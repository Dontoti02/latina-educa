<script setup lang="ts">
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'
import { SessionStore } from '@/common/store'
import { ToastService } from '@/common/util/toast.service'
import type { AcademicHistory, AcademicHistoryFilters, AcademicHistoryFormSecretary, AcademicHistoryStudents, AcademicHistoryStudentsForm } from '@/models/academic-history'
import { AcademicHistoryService } from '@/services/academic-history.service'
import { downloadFile } from '@/utils/file-utils'
import BulbLightImg from '@images/illustrations/bulb-light.png'
import PencilRocketImg from '@images/illustrations/pencil-rocket.png'

// Initial
const session = SessionStore()

const loadingFilters = ref(false)
const loadingStudents = ref(false)
const loadingHistory = ref(false)
const loadingDownload = ref(false)

const filtersForSecretary = ref<AcademicHistoryFilters>({
  study_programs: [],
})

const students = ref<Array<AcademicHistoryStudents>>([])

const formSubmit = ref<AcademicHistoryFormSecretary>({
  person_id: null,
})

const formStudents = ref<AcademicHistoryStudentsForm>({
  study_program_id: null,
})

const headers = [
  { title: 'Curso', key: 'course' },
  { title: 'Nota final', key: 'score', align: 'center', width: '160px' },
]

const academicHistory = ref<Array<AcademicHistory>>([])

// Computed
const filtersIsValid = computed(() => {
  return session.isStudent() || (formSubmit.value.person_id !== null)
})

// Actions
const getFilters = () => {
  loadingFilters.value = true
  AcademicHistoryService.getFilters().then(response => {
    filtersForSecretary.value = response.data
  }).catch(error => {
    ToastService.error(error)
  }).finally(() => {
    loadingFilters.value = false
  })
}

const getAcademicHistory = () => {
  loadingHistory.value = true
  if (session.isSecretary()) {
    AcademicHistoryService.getAcademicHistoryForSecretary(formSubmit.value).then(response => {
      academicHistory.value = response.data
    }).catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loadingHistory.value = false
    })
  }
  else {
    AcademicHistoryService.getAcademicHistoryForStudent().then(response => {
      academicHistory.value = response.data
    }).catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loadingHistory.value = false
    })
  }
}

const getStudents = () => {
  loadingStudents.value = true

  students.value = []
  formSubmit.value.person_id = null

  AcademicHistoryService.getAcademicHistoryStudents(formStudents.value).then(response => {
    students.value = response.data.map(student => ({
      id: student.id,
      names: `${student.document_number}-${student.names}`,
      document_number: student.document_number,
    }))
  }).catch(error => {
    ToastService.error(error)
  }).finally(() => {
    loadingStudents.value = false
  })
}

const download = (type: 'xlsx' | 'pdf') => {
  loadingDownload.value = true
  if (session.isSecretary()) {
    AcademicHistoryService.downloadHistoryForSecretary(type, formSubmit.value).then(response => {
      downloadFile(response)
    }).catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loadingDownload.value = false
    })
  }
  else {
    AcademicHistoryService.downloadHistoryForStudent(type).then(response => {
      downloadFile(response)
    }).catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loadingDownload.value = false
    })
  }
}

// Mounted
onBeforeMount(() => {
  if (session.isStudent())
    getAcademicHistory()
  else getFilters()
})

// Watchers
watch(() => formSubmit.value.person_id, () => {
  getAcademicHistory()
})

watch(() => formStudents.value.study_program_id, () => {
  getStudents()
})
</script>

<template>
  <div>
    <div
      v-if="loadingFilters"
      class="mt-4 w-100 d-flex justify-center"
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
            class="w-100 gap-2"
            type="list-item-three-line,list-item-three-line,list-item-three-line,list-item-three-line,list-item-three-line"
          />
        </VCol>
      </VRow>
    </div>
    <template v-else>
      <div>
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
              <h1>Historial Académico</h1>
              <p>Revisa aquí tu historial académico.</p>
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
        <VSpacer />
        <VCard class="mt-6 px-4 pb-6 pt-2">
          <VRow>
            <template v-if="session.isSecretary()">
              <VCol
                cols="12"
                sm="6"
                md="4"
              >
                <AppSelect
                  v-model="formStudents.study_program_id"
                  :items="filtersForSecretary.study_programs"
                  item-value="id"
                  item-title="name"
                  label="Programa de estudios"
                />
              </VCol>
              <VCol
                cols="12"
                sm="6"
                md="4"
              >
                <AppAutocomplete
                  v-model="formSubmit.person_id"
                  :items="students"
                  item-value="id"
                  item-title="names"
                  label="Estudiante"
                  :loading="loadingStudents"
                />
              </VCol>
            </template>
            <VCol
              cols="12"
              sm="6"
              md="4"
              class="d-flex align-end"
            >
              <DownloadReportBtn
                :loading="loadingDownload"
                :disabled="academicHistory.length === 0"
                @download="download"
              />
            </VCol>
            <VDivider />
          </VRow>
          <VRow v-if="!filtersIsValid">
            <VCol
              cols="12"
              class="py-8"
            >
              <p class="mb-0 text-center">
                Por favor, seleccione los filtros para visualizar el historial académico.
              </p>
            </VCol>
          </VRow>
          <VRow v-else>
            <VCol
              v-if="loadingHistory"
              cols="12"
            >
              <VSkeletonLoader
                class="w-100 gap-4"
                type="table,table,table"
              />
            </VCol>
            <template v-else>
              <template
                v-for="item in academicHistory"
                :key="item.id"
              >
                <VCol
                  v-if="item.courses.length > 0"
                  cols="12"
                  class="my-2"
                >
                  <div class="text-center text-h4">
                    PERIODO: {{ item.name }} <span v-if="session.academicPeriod?.id === item.id">(Actual)</span>
                  </div>
                  <div class="d-flex justify-end gap-4 text-h6">
                    <VChip
                      color="primary"
                      variant="tonal"
                    >
                      PPS: {{ item.semester_average }}
                      <VTooltip
                        activator="parent"
                        location="top"
                      >
                        Promedio ponderado semestral
                      </VTooltip>
                    </VChip>
                    <div>
                      <VChip
                        color="info"
                        variant="tonal"
                      >
                        PPA: {{ item.accumulated_average }}
                        <VTooltip
                          activator="parent"
                          location="top"
                        >
                          Promedio ponderado acumulado
                        </VTooltip>
                      </VChip>
                    </div>
                  </div>
                  <VTable>
                    <thead>
                      <tr>
                        <th
                          v-for="header in headers"
                          :key="header.key"
                          :class="{
                            'text-left': !header.align || header.align === 'left',
                            'text-center': header.align === 'center',
                            'text-right': header.align === 'right',
                          }"
                          :style="{ width: header.width }"
                        >
                          {{ header.title }}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="(historyItem, index) in item.courses"
                        :key="`history-${item.id}-${index}`"
                      >
                        <td>{{ historyItem.name }}</td>
                        <td class="text-center">
                          {{ historyItem.score }}
                        </td>
                      </tr>
                      <tr v-if="item.courses.length === 0">
                        <td
                          :colspan="headers.length"
                          class="text-center"
                        >
                          No hay cursos registrados en este periodo académico.
                        </td>
                      </tr>
                    </tbody>
                  </VTable>
                </VCol>
              </template>
            </template>
          </VRow>
        </VCard>
      </div>
    </template>
  </div>
</template>

<route lang="yaml">
meta:
  action: read
  subject: AcademicHistory
          </route>
