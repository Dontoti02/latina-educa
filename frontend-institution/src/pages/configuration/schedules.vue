<script setup lang="ts">
import type { CalendarApi, CalendarOptions } from '@fullcalendar/core'
import FullCalendar from '@fullcalendar/vue3'
import { VSkeletonLoader } from 'vuetify/lib/labs/components.mjs'
import { SessionStore } from '@/common/store'
import { ToastService } from '@/common/util/toast.service'
import AssignSchedule from '@/components/schedules/modals/AssignSchedule.vue'
import AssignTeacher from '@/components/schedules/modals/AssignTeacher.vue'
import StudentListForSchedule from '@/components/schedules/modals/StudentListForSchedule.vue'
import { blankSchedule, useScheduleCalendar } from '@/components/schedules/useScheduleCalendar'
import type { AssignationSelected, Schedule, ScheduleFilters, ScheduleFormByClassroom } from '@/models/schedules'
import { AcademicPeriodService } from '@/services/academic-period.service'
import { ScheduleService } from '@/services/schedules.service'
import { downloadFile } from '@/utils/file-utils'
import BulbLightImg from '@images/illustrations/bulb-light.png'
import PencilRocketImg from '@images/illustrations/pencil-rocket.png'

// Initial
const session = SessionStore()
const loadingFilters = ref(false)
const content = ref(null)
const loadingDownload = ref(false)
const loadingPeriods = ref(false)

// Filters
const academicPeriods = ref<any[]>(session.academicPeriod ? [JSON.parse(JSON.stringify(session.academicPeriod))] : [])
const filters = ref<ScheduleFilters>()

const displayOptions = [
  // { title: 'Horario por docente', value: 'teacher' },
  { title: 'Horario por aula', value: 'classroom' },
]

const displayOption = ref<'teacher' | 'classroom'>('classroom')

const formByTeacher = ref<{
  teacher_id: number
}>({
  teacher_id: 0,
})

const formByClassroom = ref<ScheduleFormByClassroom>({
  period_id: 0,
  study_program_id: undefined,
  cycle_id: undefined,
})

const assignationSelected = ref<AssignationSelected | null>(null)

// Calendar
let refCalendar: Ref<any>
let calendarOptions: CalendarOptions
let calendarApi: Ref<null | CalendarApi>
let refetchEvents: () => void
let loadingCalendarData: Ref<boolean>

const setUpCalendar = () => {
  nextTick(() => {
    if (content && refCalendar?.value)
      calendarApi.value = refCalendar.value.getApi()
  })
}

// Schedule
const schedule = ref<Schedule>(structuredClone(blankSchedule))
const modalAssignSchedule = ref<boolean>(false)
const modalAssignTeacher = ref<boolean>(false)
const daysAvailable = ref<number[]>([])

// Report
const modalReport = ref<boolean>(false)

// Computed
const formValid = computed(() => {
  if (!(session.isSecretary()||session.isAdmin()))
    return true

  if (displayOption.value === 'teacher')
    return formByTeacher.value.teacher_id > 0

  return formByClassroom.value.period_id > 0 && formByClassroom.value.study_program_id > 0 && formByClassroom.value.cycle_id > 0
})

const notCurrentPeriod = computed(() => {
  const currentId = session.academicPeriod?.id?.value ?? session.academicPeriod?.id
  return formByClassroom.value.period_id !== currentId
})

const filteredCycles = computed(() => {
  if (!filters.value?.cycles || !filters.value?.cycles_by_study_program) return filters.value?.cycles || []
  const spId = formByClassroom.value.study_program_id
  if (!spId) return []
  const cycleIds = filters.value.cycles_by_study_program[spId]
  if (!cycleIds || cycleIds.length === 0) return []
  return filters.value.cycles.filter(c => cycleIds.includes(c.id))
})

// Get initial data
const getFilters = () => {
  loadingFilters.value = true
  ScheduleService.getFilters().then(response => {
    filters.value = response.data
    if (academicPeriods.value && academicPeriods.value.length > 0 && academicPeriods.value[0]) {
      formByClassroom.value.period_id = academicPeriods.value[0].id?.value ?? academicPeriods.value[0].id
    } else {
      formByClassroom.value.period_id = 0
    }
    daysAvailable.value = Object.keys(response.data?.days || {}).map(Number)

    // 👉 useCalendar
    const {
      refCalendar: refCalendar2,
      calendarOptions: calendarOptions2,
      calendarApi: calendarApi2,
      refetchEvents: refetchEvents2,
      loadingCalendarData: loadingCalendarData2,
    } = useScheduleCalendar(
      schedule,
      modalAssignSchedule,
      modalAssignTeacher,
      formByClassroom,
      notCurrentPeriod,
      daysAvailable,
      filters.value.hours.start,
      filters.value.hours.end,
      assignationSelected,
      session,
    )

    calendarOptions = calendarOptions2
    calendarApi = calendarApi2
    refetchEvents = refetchEvents2
    refCalendar = refCalendar2
    loadingCalendarData = loadingCalendarData2
  }).catch(error => {
    ToastService.error(error)
  }).finally(() => {
    loadingFilters.value = false
    setUpCalendar()
  })
}

const getAcademicPeriods = () => {
  loadingPeriods.value = true
  AcademicPeriodService.getList().then(response => {
    academicPeriods.value = response.data
    if (formByClassroom.value.period_id === 0 && response.data.length > 0) {
      formByClassroom.value.period_id = response.data[0].id.value ?? response.data[0].id
    }
  }).catch(error => {
    ToastService.error(error)
  }).finally(() => {
    loadingPeriods.value = false
  })
}

// Mounted
onBeforeMount(() => {
  getFilters()
  getAcademicPeriods()
})

// Actions
const openBlankSchedule = () => {
  schedule.value = structuredClone(blankSchedule)
  modalAssignSchedule.value = true
}

const refetch = () => {
  if (!loadingFilters.value && formValid.value)
    refetchEvents()
}

const downloadReport = async (type: 'xlsx' | 'pdf') => {
  loadingDownload.value = true
  ScheduleService.downloadSchedule(type, formByClassroom.value).then(response => {
    downloadFile(response)
  }).catch(error => {
    ToastService.error(error)
  }).finally(() => {
    loadingDownload.value = false
  })
}

// Watch
watch(() => formByClassroom.value.period_id, refetch)
watch(() => formByClassroom.value.study_program_id, () => {
  formByClassroom.value.cycle_id = undefined
  refetch()
})
watch(() => formByClassroom.value.cycle_id, refetch)
watch(formValid, value => {
  if (value) {
    nextTick(() => {
      if (content)
        calendarApi.value = refCalendar.value.getApi()
    })
  }
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
            class="w-100 gap-4 "
            type="image,list-item-avatar"
          />
        </VCol>
        <VCol cols="12">
          <VSkeletonLoader
            class="w-100 gap-4 "
            type="list-item,list-item,article,article,article"
          />
        </VCol>
      </VRow>
    </div>

    <div
      v-else
      ref="content"
    >
      <VCard>
        <VRow class="">
          <VCol
            cols="3"
            class="pl-8 pt-6 pb-0"
          >
            <img
              :src="BulbLightImg"
              height="100"
            >
          </VCol>
          <VCol
            cols="6"
            class="pt-6 px-8 d-flex text-center justify-center align-center flex-column"
          >
            <h1>Horarios</h1>
            <p>Aquí podrás configurar los horarios para cada curso de las diferentes carreras con las que cuenta la institución.</p>
          </VCol>
          <VCol
            cols="3"
            class=" pb-0 d-flex justify-end align-end"
          >
            <img
              :src="PencilRocketImg"
              height="140"
            >
          </VCol>
        </VRow>
      </VCard>
      <VSpacer />
      <VCard
        flat
        class="mt-6 py-2"
      >
        <VRow>
          <VCol cols="12">
            <VRow
              class="px-6"
              align="end"
              :justify="session.isSecretary()||session.isAdmin() ? 'end' : 'start'"
            >
              <VCol
                v-if="session.isSecretary()||session.isAdmin()"
                cols="8"
              >
                <AppSelect
                  v-model="displayOption"
                  label="Ver horario por:"
                  :disabled="loadingCalendarData"
                  :items="displayOptions"
                />
              </VCol>
              <VCol cols="4">
                <AppSelect
                  v-model="formByClassroom.period_id"
                  :items="academicPeriods"
                  :disabled="loadingCalendarData"
                  :loading="loadingPeriods"
                  item-value="id.value"
                  item-title="name.value"
                  label="Periodo académico"
                />
              </VCol>
              <template v-if="session.isSecretary()||session.isAdmin()">
                <template v-if="displayOption === 'teacher'">
                  <VCol cols="12">
                    <AppSelect
                      v-model="formByTeacher.teacher_id"
                      label="Docente"
                    />
                  </VCol>
                </template>
                <template v-else>
                  <VCol
                    lg="5"
                    sm="7"
                    cols="12"
                  >
                    <AppSelect
                      v-model="formByClassroom.study_program_id"
                      :items="filters?.study_programs"
                      :disabled="loadingCalendarData"
                      item-value="id"
                      item-title="name"
                      label="Programa de estudio"
                    />
                  </VCol>
                  <VCol
                    lg="3"
                    sm="5"
                    cols="12"
                  >
                    <AppSelect
                      v-model="formByClassroom.cycle_id"
                      :items="filteredCycles"
                      :disabled="loadingCalendarData"
                      item-value="id"
                      item-title="name"
                      label="Ciclo"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    lg="4"
                    md="6"
                    class="d-flex gap-2 justify-sm-end justify-space-between"
                  >
                    <VBtn
                      prepend-icon="tabler-edit"
                      text="Asignar horario"
                      :disabled="!formValid || notCurrentPeriod || loadingCalendarData"
                      @click="openBlankSchedule"
                    />
                    <VBtn
                      prepend-icon="mdi-account-tie"
                      variant="tonal"
                      text="Asignar docente"
                      :disabled="!formValid || notCurrentPeriod || loadingCalendarData"
                      @click="modalAssignTeacher = true"
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    class="d-flex gap-2 justify-end"
                  >
                    <VBtn
                      text="Descargar"
                      prepend-icon="mdi-download"
                      :disabled="!formValid || loadingCalendarData"
                      variant="outlined"
                      @click="modalReport = true"
                    />
                  </VCol>
                </template>
              </template>
              <template v-else>
                <VCol
                  cols="12"
                  class="d-flex gap-2 justify-end"
                >
                  <VBtn
                    text="Descargar"
                    prepend-icon="mdi-download"
                    :disabled="!formValid || loadingCalendarData"
                    variant="outlined"
                    :loading="loadingDownload"
                    @click="downloadReport('pdf')"
                  />
                </VCol>
              </template>
            </VRow>
          </VCol>
          <VCol
            v-if="formValid"
            cols="12"
          >
            <VProgressLinear
              v-if="loadingCalendarData"
              color="primary"
              height="3"
              indeterminate
            />
            <FullCalendar
              id="content-calendar"
              ref="refCalendar"
              :disabled="!formValid"
              :options="calendarOptions"
            />
          </VCol>
          <VCol
            v-else
            class="text-center py-6"
          >
            Seleccione un programa de estudio y un ciclo
          </VCol>
        </VRow>
      </VCard>
    </div>
    <AssignSchedule
      v-if="formValid && (session.isSecretary()||session.isAdmin())"
      :show="modalAssignSchedule"
      :schedule="schedule"
      :form-by-classroom="formByClassroom"
      :days-available="filters?.days!"
      @close="modalAssignSchedule = false"
      @update-calendar="refetchEvents"
    />
    <AssignTeacher
      v-if="formValid && (session.isSecretary()||session.isAdmin())"
      :show="modalAssignTeacher"
      :form-by-classroom="formByClassroom"
      :assignation-selected="assignationSelected"
      @submit="refetchEvents"
      @close="modalAssignTeacher = false;assignationSelected = null"
    />
    <StudentListForSchedule
      v-if="formValid && session.isTeacher()"
      :schedule="schedule"
      :show="modalAssignSchedule"
      @close="modalAssignSchedule = false"
    />
    <DownloadScheduleReport
      v-if="formValid && (session.isSecretary()||session.isAdmin())"
      :show="modalReport"
      :form-filters="formByClassroom"
      @close="modalReport = false"
    />
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/libs/full-calendar";

.v-application .fc .fc-col-header .fc-col-header-cell .fc-col-header-cell-cushion {
  text-transform: capitalize !important;
}

.fc .fc-scroller-harness-liquid {
  block-size: calc(100% - 80px);
}

.fc-timegrid .fc-timegrid-slots .fc-timegrid-slot {
  block-size: 2rem;
}

// Event
.assign-teacher {
  opacity: 0.7;
  text-transform: capitalize;
}

.assign-teacher:hover {
  cursor: pointer;
  opacity: 1;
}

// Overflow
.custom-event-overflow {
  overflow-y: auto !important;
}

.custom-event-overflow::-webkit-scrollbar {
  inline-size: 4px;
}

.custom-event-overflow::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}

.custom-event-overflow::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background-color: #afafaf;
}

.custom-event-overflow::-webkit-scrollbar-thumb:hover {
  background-color: #8f8f8f;
}

// Schedule Colors
.schedule-color-primary {
  background-color: rgb(115, 103, 240, 16%) !important;
  color: rgb(115, 103, 240) !important;
}

.schedule-color-success {
  background-color: rgb(40, 199, 111, 16%) !important;
  color: rgb(40, 199, 111) !important;
}

.schedule-color-error {
  background-color: rgb(234, 84, 85, 16%) !important;
  color: rgb(234, 84, 85) !important;
}

.schedule-color-warning {
  background-color: rgb(255, 159, 67, 16%) !important;
  color: rgb(255, 159, 67) !important;
}

.schedule-color-info {
  background-color: rgb(0, 207, 232, 16%) !important;
  color: rgb(0, 207, 232) !important;
}

.schedule-color-blue-light {
  background-color: rgba(127, 157, 196, 16%) !important;
  color: rgb(127, 157, 196) !important;
}

.schedule-color-blue-dark {
  background-color: rgba(0, 0, 139, 16%) !important;
  color: rgb(0, 0, 139) !important;
}

.schedule-color-green-light {
  background-color: rgba(144, 238, 144, 16%) !important;
  color: rgb(144, 238, 144) !important;
}

.schedule-color-green-dark {
  background-color: rgba(0, 100, 0, 16%) !important;
  color: rgb(0, 100, 0) !important;
}

.schedule-color-red-light {
  background-color: rgba(255, 182, 193, 16%) !important;
  color: rgb(255, 182, 193) !important;
}

.schedule-color-red-dark {
  background-color: rgba(139, 0, 0, 16%) !important;
  color: rgb(139, 0, 0) !important;
}

.schedule-color-orange-light {
  background-color: rgba(255, 165, 0, 16%) !important;
  color: rgb(255, 165, 0) !important;
}

.schedule-color-orange-dark {
  background-color: rgba(255, 140, 0, 16%) !important;
  color: rgb(255, 140, 0) !important;
}

.schedule-color-cyan-light {
  background-color: rgba(224, 255, 255, 16%) !important;
  color: rgb(224, 255, 255) !important;
}

.schedule-color-cyan-dark {
  background-color: rgba(0, 139, 139, 16%) !important;
  color: rgb(0, 139, 139) !important;
}

.schedule-color-purple-light {
  background-color: rgba(218, 112, 214, 16%) !important;
  color: rgb(218, 112, 214) !important;
}

.schedule-color-purple-dark {
  background-color: rgba(128, 0, 128, 16%) !important;
  color: rgb(128, 0, 128) !important;
}

.schedule-color-yellow-light {
  background-color: rgba(255, 255, 224, 16%) !important;
  color: rgb(255, 255, 224) !important;
}

.schedule-color-yellow-dark {
  background-color: rgba(204, 204, 0, 16%) !important;
  color: rgb(204, 204, 0) !important;
}

.schedule-color-pink-light {
  background-color: rgba(255, 192, 203, 16%) !important;
  color: rgb(255, 192, 203) !important;
}

.schedule-color-pink-dark {
  background-color: rgba(255, 105, 180, 16%) !important;
  color: rgb(255, 105, 180) !important;
}

.schedule-color-brown-light {
  background-color: rgba(210, 180, 140, 16%) !important;
  color: rgb(210, 180, 140) !important;
}

.schedule-color-brown-dark {
  background-color: rgba(165, 42, 42, 16%) !important;
  color: rgb(165, 42, 42) !important;
}

.schedule-color-gray-light {
  background-color: rgba(211, 211, 211, 16%) !important;
  color: rgb(211, 211, 211) !important;
}

.schedule-color-gray-dark {
  background-color: rgba(169, 169, 169, 16%) !important;
  color: rgb(169, 169, 169) !important;
}
</style>

<route lang="yaml">
meta:
  action: read
  subject: Schedules
        </route>

