<script setup lang="ts">
import Table, { HeaderProp } from '@/components/common/Table.vue'
import { GetEvaluationGroup } from '@/models/evaluation-group'
import type { GetParticipantsForTeacher } from '@/models/participants'
import { ContentService } from '@/services/content.service' 
import { ParticipantsService } from '@/services/participants.service'
import { downloadFile } from '@/utils/file-utils'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'
import StudentScoresForTeacher from './StudentScoresForTeacher.vue'
// Initial
const props = defineProps<{
  classroomId: number
  activeTab: string
}>()

const loading = ref(false)
const loadingDownload = ref(false)
 
const search = ref('')
const searchTimer = ref()

const studentList = ref<Array<GetParticipantsForTeacher>>([])
const evaluations = ref<GetEvaluationGroup[]>([])
const studentListFiltered = ref<Array<GetParticipantsForTeacher>>([])
const studentSelected = ref<GetParticipantsForTeacher | null>(null)

const headers = ref<HeaderProp[]>([
  { title: 'ESTUDIANTES', key: 'names', nowrap : true, align:'left' },
  { title: 'CICLO', key: 'cycle'},
  { title: 'FALTAS', key: 'absences' },
  { title: 'PONDERADO', key: 'score' },
  { title: 'NOTA FINAL', key: 'score', align: 'center' },
])

const setHeaderEvaluations = () => {
  const children : {title:string, key:string}[] = []
  evaluations.value.forEach( item => {
    if (!headers.value.map(aux => aux.key).includes('evaluation_' + item.id))
      children.push({
        title : item.title + ' (' + (item.weight * 100) +'%)',
        key : 'evaluation_' + item.id
      })
  })

  if (children.length > 0 ) {
    headers.value.push({
      title : 'NOTAS POR CRITERIO',
      align: 'center',
      key: 'group',
      children
    })
  }
}
// Get data
const getParticipants = () => {
  loading.value = true
  ParticipantsService.getParticipantsForTeacher(props.classroomId)
    .then(({data}) => {
      const {evaluationGroups,result} = data
      studentList.value = result
      studentListFiltered.value = result
      evaluations.value = evaluationGroups
      setHeaderEvaluations()
        headers.value.push({
          title : '',
          key: 'actions'
      })
    })
    .catch(error => {
      console.error(error)
    }).finally(() => {
      loading.value = false
    })
}

// Mounted
onBeforeMount(() => {
  getParticipants()
})

const filterStudents = () => {
  if (search.value === '') {
    studentListFiltered.value = studentList.value

    return
  }

  studentListFiltered.value = studentList.value.filter(student => {
    return student.names.toLowerCase().includes(search.value.toLowerCase().trim())
    || student.cycle.toLowerCase().includes(search.value.toLowerCase().trim())
    || student.score.toString().includes(search.value.toLowerCase().trim())
  })
}

// Actions
const selectStudent = (student: GetParticipantsForTeacher) => {
  studentSelected.value = student
}

const deselectStudent = () => {
  studentSelected.value = null
}

const downloadConsolidatedNotes = (type: 'xlsx' | 'pdf') => {
  loadingDownload.value = true
  ContentService.downloadConsolidatedNotes(type, props.classroomId).then(response => {
    downloadFile(response)
  }).catch(error => {
    console.error(error)
  }).finally(() => {
    loadingDownload.value = false
  })
}

// Watchers
watch(search, () => {
  if (searchTimer.value)
    clearTimeout(searchTimer.value)

  searchTimer.value = setTimeout(() => {
    filterStudents()
  }, 500)
})

watch(() => props.activeTab, newValue => {
  if (newValue === 'students')
    deselectStudent()
})
</script>

<template>
  <div v-if="loading">
    <VRow>
      <VCol cols="12">
        <VSkeletonLoader type="table" />
      </VCol>
    </VRow>
  </div>
  <template v-else>
    <VCard
      v-show="studentSelected === null"
      class="py-4"
    >
      <VRow
        class="pb-4 px-2"
        justify="space-between"
      >
        <VCol
          cols="12"
          md="6"
          lg="4"
        >
          <VBtn
            class="text-none"
            text="Descargar consolidado de notas"
            variant="outlined"
            :loading="loadingDownload"
            prepend-icon="mdi-download"
            @click="downloadConsolidatedNotes('xlsx')"
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
          lg="4"
          class="d-flex gap-2"
        >
          <VTextField
            v-model="search"
            placeholder="Buscar participante"
            clearable
            density="compact"
          />
          <VBtn
            color="primary"
            icon="tabler-search"
            rounded="sm"
            density="comfortable"
            @click="filterStudents"
          />
        </VCol>
      </VRow>

      <Table
        :config="{
          index:true,
          pagination: {
            peerPage:10
          }
        }"
        :header="headers"
        :items="studentListFiltered"
      >

       <!-- <template #evaluation_5>
          goaa
       </template> -->

       <template v-for="{id} in evaluations" 
          :slot="'evaluation_' + id" 
          :key="'evaluation_' + id" 
          v-slot="{ item }"
        >
            {{ item }}
        </template>

        <template #actions="{item}">
            <VBtn
              class="text-none"
              text="Ver notas"
              variant="tonal"
              @click="selectStudent(item as GetParticipantsForTeacher)"
            />

        </template>
      </Table>
    </VCard>
    <StudentScoresForTeacher
      v-if="studentSelected !== null"
      :classroom-id="props.classroomId"
      :student="studentSelected"
      @to-back="deselectStudent"
    />
  </template>
</template>
