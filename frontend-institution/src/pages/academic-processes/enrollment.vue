<script setup lang="ts">
import { SessionStore } from '@/common/store'
import { ToastService } from '@/common/util/toast.service'
import type { Enrollment, EnrollmentFilters, EnrollmentFormSecretary, EnrollmentStudents, EnrollmentStudentsForm } from '@/models/enrollments'
import router from '@/router'
import { EnrollmentService } from '@/services/enrollments.service'
import { DateFormatting } from '@/utils/date-formatting'
import { downloadFile } from '@/utils/file-utils'
import BulbLightImg from '@images/illustrations/bulb-light.png'
import PencilRocketImg from '@images/illustrations/pencil-rocket.png'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'

// Initial
const session = SessionStore()

const detailPage = ref<{
  active: boolean
  classroomId: number
  initialTab: 'content' | 'students' | 'scores'
  student: {
    person_id: number
    names: string
  } | null
}>({
  active: false,
  classroomId: 0,
  initialTab: 'content',
  student: null,
})

const loadingFilters = ref(false)
const loadingStudents = ref(false)
const loadingEnrollments = ref(false)
const loadingDownloadEnrollment = ref(false)
const loadingDownloadConsolidated = ref(false)
const period_id = ref<number>(session.get().academicPeriod!.id)

const filtersForSecretary = ref<EnrollmentFilters>({
  periods: [],
  study_programs: [],
})

const students = ref<Array<EnrollmentStudents>>([])

const formSubmit = ref<EnrollmentFormSecretary>({
  period_id: null,
  person_id: null,
})

const formStudents = ref<EnrollmentStudentsForm>({
  period_id: null,
  study_program_id: null,
})

const headers = [
  { title: 'Curso', key: 'course' },
  { title: 'Profesor', key: 'teacher' },
  { title: 'Estado', key: 'status' },
  { title: 'Turno', key: 'shift', align: 'center' },
  { title: 'Fecha de inscripción', key: 'registration-date', align: 'center' },
  { title: 'Aula virtual', key: 'classroom', align: 'center' },
  { title: 'Acciones', key: 'actions', align: 'center' },
]

const enrollments = ref<Array<Enrollment>>([])

// Computed
const isCurrentPeriod = computed(() => {
  return session.academicPeriod?.id === formSubmit.value.period_id
})

const filtersIsValid = computed(() => {
  return session.isStudent() || (formSubmit.value.person_id !== null)
})

// Mounted
const getFilters = () => {
  loadingFilters.value = true
  EnrollmentService.getFilters().then(response => {
    filtersForSecretary.value = response.data
    if (filtersForSecretary.value.periods.length > 0) {
      period_id.value = filtersForSecretary.value.periods[0].id

      if (session.isStudent())
        getEnrollments()
    }
  }).catch(error => {
    ToastService.error(error)
  }).finally(() => {
    loadingFilters.value = false
  })
}

onBeforeMount(() => {
  getFilters()
})

// Actions
const getEnrollments = () => {
  loadingEnrollments.value = true
  formSubmit.value.period_id = period_id.value
  if (session.isSecretary()) {
    EnrollmentService.getEnrollmentForSecretary(formSubmit.value).then(response => {
      enrollments.value = response.data
    }).catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loadingEnrollments.value = false
    })
  }
  else {
    EnrollmentService.getEnrollmentForStudent({ period_id: formSubmit.value.period_id }).then(response => {
      enrollments.value = response.data
    }).catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loadingEnrollments.value = false
    })
  }
}

const getStudents = () => {
  loadingStudents.value = true

  students.value = []
  formSubmit.value.person_id = null

  formStudents.value.period_id = period_id.value
  EnrollmentService.getEnrollmentStudents(formStudents.value).then(response => {
    students.value = response.data
  }).catch(error => {
    ToastService.error(error)
  }).finally(() => {
    loadingStudents.value = false
  })
}

const redirectToClassroom = (id: number) => {
  if (session.isStudent()) {
    router.push({ name: 'courses-student-course-id', params: { id }, query: { tab: 'content', type: isCurrentPeriod.value ? 'current' : 'archived' } })
  }
  else {
    detailPage.value.classroomId = id
    detailPage.value.initialTab = 'content'

    const student = students.value.find(s => s.id === formSubmit.value.person_id)
    if (student) {
      detailPage.value.student = {
        person_id: student.id,
        names: student.names,
      }
    }
    detailPage.value.active = true
  }
}

const redirectToScores = (id: number) => {
  if (session.isStudent()) {
    router.push({ name: 'courses-student-course-id', params: { id }, query: { tab: 'scores', type: isCurrentPeriod.value ? 'current' : 'archived' } })
  }
  else {
    detailPage.value.classroomId = id
    detailPage.value.initialTab = 'scores'

    const student = students.value.find(s => s.id === formSubmit.value.person_id)
    if (student) {
      detailPage.value.student = {
        person_id: student.id,
        names: student.names,
      }
    }
    detailPage.value.active = true
  }
}

const downloadEnrollment = (type: 'xlsx' | 'pdf') => {
  loadingDownloadEnrollment.value = true
  if (session.isSecretary()) {
    EnrollmentService.downloadEnrollmentForSecretary(type, period_id.value, formSubmit.value.person_id!).then(response => {
      downloadFile(response)
    }).catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loadingDownloadEnrollment.value = false
    })
  }
  else {
    EnrollmentService.downloadEnrollmentForStudent(type, formSubmit.value.period_id!).then(response => {
      downloadFile(response)
    }).catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loadingDownloadEnrollment.value = false
    })
  }
}

const downloadConsolidated = (type: 'xlsx' | 'pdf') => {
  loadingDownloadConsolidated.value = true
  if (session.isSecretary()) {
    EnrollmentService.downloadConsolidatedForSecretary(type, period_id.value, formSubmit.value.person_id!).then(response => {
      downloadFile(response)
    }).catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loadingDownloadConsolidated.value = false
    })
  }
  else {
    EnrollmentService.downloadConsolidatedForStudent(type, formSubmit.value.period_id!).then(response => {
      downloadFile(response)
    }).catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loadingDownloadConsolidated.value = false
    })
  }
}

// Watchers
watch(period_id, () => {
  formSubmit.value.period_id = period_id.value
  formStudents.value.period_id = period_id.value
  if (session.isSecretary())
    getStudents()
  else
    getEnrollments()
})

watch(() => formSubmit.value.person_id, () => {
  getEnrollments()
})
watch(() => formStudents.value.study_program_id, () => {
  if (session.isSecretary())
    getStudents()
})

// Computed
const studentsForList = computed(() => {
  return students.value.map(student => ({
    id: student.id,
    title: `${student.document_number}-${student.names}`,
  }))
})

// Utils
const formatDate = (date: string) => {
  return DateFormatting.formatShort(new Date(date))
}
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
      <div v-show="!detailPage.active">
        <VCard>
          <VRow class="">
            <VCol
              cols="3"
              class="pl-8 pt-6"
            >
              <img
                :src="BulbLightImg"
                height="100"
                alt="Bulb Light"
              >
            </VCol>
            <VCol
              cols="6"
              class="pt-6 px-8 pb-6 d-flex text-center justify-center align-center flex-column"
            >
              <h1>Matrículas</h1>
              <p>Busca aquí tus matrículas realizadas de todos los periodos académicos hasta el periodo {{ session.academicPeriod?.name }}.</p>
            </VCol>
            <VCol
              cols="3"
              class="d-flex justify-end align-end"
            >
              <img
                :src="PencilRocketImg"
                height="140"
                alt="Pencil Rocket"
              >
            </VCol>
          </VRow>
        </VCard>
        <VSpacer />
        <VCard class="mt-6 px-4 pb-6 pt-2">
          <VRow>
            <VCol
              cols="12"
              sm="6"
              md="4"
            >
              <AppSelect
                v-model="period_id"
                :items="filtersForSecretary.periods"
                item-value="id"
                item-title="name"
                label="Periodo académico"
              />
            </VCol>
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
                  :items="studentsForList"
                  item-value="id"
                  item-title="title"
                  label="Estudiante"
                  :loading="loadingStudents"
                />
              </VCol>
            </template>
            <VCol
              cols="12"
              :sm="session.isStudent() ? 6 : 12"
              :md="session.isStudent() ? 6 : 6"
              class="d-flex align-end gap-2"
            >
              <DownloadReportBtn
                text="Descargar matrícula"
                :loading="loadingDownloadEnrollment"
                :disabled="enrollments.length === 0 || loadingEnrollments"
                @download="downloadEnrollment"
              />
            </VCol>
            <VCol
              cols="12"
              :sm="session.isStudent() ? 6 : 12"
              :md="session.isStudent() ? 6 : 6"
              class="d-flex align-end gap-2"
            >
              <DownloadReportBtn
                text="Descargar consolidado"
                variant="outlined"
                :loading="loadingDownloadConsolidated"
                :disabled="enrollments.length === 0 || loadingEnrollments"
                @download="downloadConsolidated"
              />
            </VCol>
          </VRow>
          <VRow v-if="!filtersIsValid">
            <VCol
              cols="12"
              class="py-8"
            >
              <p class="mb-0 text-center">
                Por favor, seleccione los filtros para visualizar las matrículas.
              </p>
            </VCol>
          </VRow>
          <VRow v-else>
            <VCol cols="12">
              <VProgressLinear
                v-if="loadingEnrollments"
                color="primary"
                height="3"
                indeterminate
              />
              <VTable id="enrollment-table">
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
                      scope="col"
                    >
                      {{ header.title }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="item in enrollments"
                    :key="item.id"
                  >
                    <td>{{ item.course }}</td>
                    <td class="text-capitalize">
                      {{ item.teacher?.toLowerCase() ?? '-' }}
                    </td>
                    <td class="text-capitalize">
                      {{ item.status?.toLowerCase() ?? '-' }}
                    </td>
                    <td class="text-capitalize text-center">
                      {{ item.shift.toLowerCase() }}
                    </td>
                    <td class="text-center">
                      {{ formatDate(item.registration_date) }}
                    </td>
                    <td class="text-center">
                      <VBtn
                        class="text-none"
                        text="Ver aula"
                        variant="text"
                        @click="redirectToClassroom(item.id)"
                      />
                    </td>
                    <td class="text-center">
                      <VBtn
                        class="text-none"
                        text="Ver notas"
                        variant="text"
                        @click="redirectToScores(item.id)"
                      />
                    </td>
                  </tr>
                  <tr v-if="loadingEnrollments">
                    <td
                      :colspan="headers.length"
                      class="text-center"
                    >
                      Cargando matrículas...
                    </td>
                  </tr>
                  <tr v-else-if="enrollments.length === 0">
                    <td
                      :colspan="headers.length"
                      class="text-center"
                    >
                      No hay matrículas registradas.
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VCol>
          </VRow>
        </VCard>
      </div>
      <CoursePanelsForSecretary
        v-if="session.isSecretary() && detailPage.active"
        v-show="detailPage.active"
        :classroom-id="detailPage.classroomId"
        :initial-active-tab="detailPage.initialTab"
        :student="detailPage.student!"
        @to-back="detailPage.active = false"
      />
    </template>
  </div>
</template>

<route lang="yaml">
meta:
  action: read
  subject: Enrollment
        </route>
