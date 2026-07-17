<script setup lang="ts">
import { ToastService } from '@/common/util/toast.service'
import { ListOfMeritFilters, Period, StudentForListOfMerit, StudyProgram } from '@/models/list-of-merit'
import { ListOfMeritService } from '@/services/list-of-merit.service'
import BulbLightImg from '@images/illustrations/bulb-light.png'
import PencilRocketImg from '@images/illustrations/pencil-rocket.png'
import { VDataTable } from 'vuetify/labs/VDataTable'
import { VSkeletonLoader } from 'vuetify/lib/labs/components.mjs'

const loading = ref(false)
const studentsLoading = ref(false)
const currentTabPeriod = ref<Period>()
const currentTabStudyProgram = ref<StudyProgram>()
const currentPercentil = ref('todos')

const percentiles = ref([
  'todos',
  'medio',
  'tercio',
  'decimo',
])

const filters = ref<ListOfMeritFilters>()
const students = ref<StudentForListOfMerit[]>()
const percentilStudents = ref<StudentForListOfMerit[]>()

// Filters
const studentsSearch = ref<string>('')
const page = ref(1)

const headers = [
  { title: 'Merito', key: 'order', align: 'center', sortable: false },
  { title: 'Nombre', key: 'names', sortable: false },
  { title: 'Promedio', key: 'semester_average', align: 'center', sortable: false },
]

const getFilters = () => {
  loading.value = true
  ListOfMeritService.getFilters()
    .then(response => {
      filters.value = response.data
      currentTabPeriod.value = filters.value.periods[0]
      currentTabStudyProgram.value = filters.value.study_programs[0]
    })
    .catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loading.value = false
    })
}

const getStudents = () => {
  studentsLoading.value = true
  ListOfMeritService.getStudents({
    period_id: currentTabPeriod.value!.id,
    study_program_id: currentTabStudyProgram.value!.id,
  })
    .then(response => {
      students.value = response.data.sort((a, b) => a.order - b.order)

      percentilStudents.value = students.value
    })
    .catch(error => {
      ToastService.error(error)
    }).finally(() => {
      studentsLoading.value = false
    })
}

const changeCourse = () => {
  currentPercentil.value = 'todos'
  studentsSearch.value = ''
  getStudents()
}

const filterStudents = computed(() => {
  if (!students.value)
    return []

  return percentilStudents.value!.filter(student => {
    return student.names.toLowerCase().includes(studentsSearch.value.toLowerCase().trim())
  })
})

const changePercentil = async () => {
  studentsLoading.value = true
  await new Promise(resolve => setTimeout(resolve, 1000))
  page.value = 1
  switch (currentPercentil.value) {
    case 'decimo':
      percentilStudents.value = students.value!.slice(0, Math.floor((students.value!.length / 10) !== 0 ? (students.value!.length / 10) : 1))
      break

    case 'tercio':
      percentilStudents.value = students.value!.slice(0, Math.floor(students.value!.length / 3))
      break

    case 'medio':
      percentilStudents.value = students.value!.slice(0, Math.floor(students.value!.length / 2))
      break

    default:
      percentilStudents.value = students.value
  }

  studentsLoading.value = false
}

watch(() => currentTabPeriod.value, () => {
  getStudents()
})

onBeforeMount(() => {
  getFilters()
})
</script>

<template>
  <div>
    <div
      v-if="loading || filters === undefined"
      class="mt-4 w-100"
    >
      <VRow>
        <VCol cols="12">
          <VSkeletonLoader
            class="w-100"
            type="image"
          />
        </VCol>
        <VCol cols="12">
          <VSkeletonLoader
            class="w-100"
            type="table"
          />
        </VCol>
      </VRow>
    </div>
    <template v-else>
      <VCard>
        <VRow class="">
          <VCol
            cols="3"
            class="pl-8 pt-6"
          >
            <img
              :src="BulbLightImg"
              height="100"
            >
          </VCol>
          <VCol
            cols="6"
            class="pt-6 px-8 pb-6 d-flex text-center justify-center align-center flex-column"
          >
            <h1>Lista de mérito</h1>
            <p>Aquí se listarán los alumnos ordenados por orden de mérito</p>
          </VCol>
          <VCol
            cols="3"
            class="d-flex justify-end align-end"
          >
            <img
              :src="PencilRocketImg"
              height="140"
            >
          </VCol>
        </VRow>
      </VCard>
      <VSpacer class="mt-8" />
      <VCard>
        <VCardText>
          <VRow>
            <VCol>
              <VTabs
                v-model="currentTabPeriod"
                mandatory
                show-arrows
              >
                <VTab
                  v-for="(p, index) in filters.periods"
                  :key="`period-${index}`"
                  :value="p"
                >
                  {{ p.name }}
                </VTab>
              </VTabs>
              <div
                v-if="currentTabPeriod"
                class="mt-5 d-flex w-100"
              >
                <div style="max-width: 35%;">
                  <VTabs
                    v-model="currentTabStudyProgram"
                    direction="vertical"
                    class="v-tabs-pill"
                    mandatory
                    @update:modelValue="changeCourse"
                  >
                    <VTab
                      v-for="(c, index) in filters.study_programs"
                      :key="`course-${index}`"
                      :value="c"
                      size="small"
                      :text="c.name"
                    />
                  </VTabs>
                </div>

                <div class="ms-5 flex-grow-1">
                  <VRow>
                    <VCol cols="12">
                      <VTextField
                        v-model="studentsSearch"
                        placeholder="Buscar estudiante"
                        dense
                      />
                    </VCol>
                    <VCol cols="12">
                      <VTabs
                        v-model="currentPercentil"
                        :items="percentiles"
                        class="v-tabs-pill"
                        grow
                        @update:modelValue="changePercentil"
                      />
                    </VCol>
                  </VRow>

                  <div>
                    <VDataTable
                      v-if="!studentsLoading"
                      :items="filterStudents"
                      :headers="headers"
                      :items-per-page="10"
                      :page="page"
                    />
                    <VSkeletonLoader
                      v-else
                      type="table"
                      class="w-100"
                    />
                  </div>
                </div>
              </div>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </template>
  </div>
</template>

<route lang="yaml">
meta:
  action: read
  subject: ListOfMerit
          </route>
