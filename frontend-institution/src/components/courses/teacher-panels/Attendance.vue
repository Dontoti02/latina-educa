<script setup lang="ts">
import { ToastService } from '@/common/util/toast.service'
import type { AttendanceListItem } from '@/models/attendance'
import { AttendanceService } from '@/services/attendance.service'
import MenuDrawerService from '@/services/menu-drawer.service'
import { downloadFile } from '@/utils/file-utils'
import type { CalendarApi, CalendarOptions } from '@fullcalendar/core'
import esLocale from '@fullcalendar/core/locales/es'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import FullCalendar from '@fullcalendar/vue3'
import { VSkeletonLoader } from 'vuetify/lib/labs/components.mjs'

const props = defineProps<{
  classroomId: number
}>()

const datesList = ref<AttendanceListItem[]>([])
const selectedDate = ref<string | null>()
const loading = ref(true)
const buttonLoading = ref(false)
const dialog = ref({ visible: false, message: '', date: '' })

const invertDate = (date?: string | null) => {
  if (!date)
    return ''

  const arr = date.split('-')

  return `${arr[2]}-${arr[1]}-${arr[0]}`
}

// 👉 Calendar API
const calendarApi = ref<null | CalendarApi>(null)

// useCalendar
// 👉 Calendar template ref
const refCalendar = ref()

// 👉 Add event
const addAttendance = (attendance: AttendanceListItem) => {
  datesList.value.push(attendance)
  calendarApi.value = refCalendar.value.getApi()
  calendarApi.value?.addEvent({ title: `${attendance.value}`, date: attendance.date, display: 'background', backgroundColor: 'green' })
}

const openConfirmationModal = (d: string) => {
  selectedDate.value = d
  dialog.value = {
    visible: true,
    message: `¿Está seguro que desea aperturar la asistencia para el dia ${invertDate(d)}?`,
    date: d,
  }
}

const createAttendance = () => {
  buttonLoading.value = true
  AttendanceService.createAttendance({ classroom_id: props.classroomId, date: selectedDate.value! })
    .then(res => {
      MenuDrawerService.emitCreateList({ list: res.data, date: selectedDate.value!,classroom_id: props.classroomId })
      addAttendance({ date: dialog.value.date, value: `0/${res.data.length}` })
    })
    .catch(err => {
      ToastService.error(err)
    })
    .finally(() => {
      buttonLoading.value = false
      dialog.value.visible = false
    })
}

const handleCreation = (date: string) => {
  const existingDate = datesList.value.find(item => item.date === date)
  if (existingDate)
    MenuDrawerService.emitLoadList({ date, classroom_id: props.classroomId })

  else
    openConfirmationModal(date)
}

const download = (type: 'xlsx' | 'pdf') => {
  AttendanceService.downloadAttendanceConsolidated(type, props.classroomId).then(response => {
    downloadFile(response)
  }).catch(err => {
    ToastService.error(err)
  })
}

const calendarOptions = {
  plugins: [dayGridPlugin, interactionPlugin],
  locale: esLocale,
  initialView: 'dayGridMonth',
  height: '100%',
  validRange: {
    start: '2000-01-01',
    end: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  },
  headerToolbar: {
    start: 'prev,next title',
    end: 'downloadPDF downloadExcel',
  },
  customButtons: {
    downloadPDF: {
      text: 'Descargar PDF',
      click() {
        download('pdf')
      },
    },
    downloadExcel: {
      text: 'Descargar Excel',
      click() {
        download('xlsx')
      },
    },
  },

  /*
    Max number of events within a given day
    Docs: https://fullcalendar.io/docs/dayMaxEvents
  */
  dayMaxEvents: 1,

  // customButtons
  dateClick(info: any) {
    handleCreation(info.dateStr)

    // isEventHandlerSidebarActive.value = true
  },

  eventClassNames({ event: calendarEvent }) {
    return [
      'custom-fc-title',
    ]
  },
} as CalendarOptions

const getListdates = () => {
  loading.value = true
  AttendanceService.getAttendanceDates(props.classroomId)
    .then(res => {
      datesList.value = res.data
      calendarOptions.events = res.data.map((item: AttendanceListItem) => {
        return {
          title: `${item.value}`,
          date: item.date,
          display: 'background',
          backgroundColor: 'green',
        }
      })
    })
    .catch(err => {
      ToastService.error(err)
    })
    .finally(() => {
      loading.value = false
    })
}

onMounted(() => {
  getListdates()

  MenuDrawerService.on('updatedList', () => {
    getListdates()
  })
})
</script>

<template>
  <!-- loading -->
  <template v-if="loading">
    <VRow>
      <VCol>
        <VSkeletonLoader
          type="heading"
          class="mb-5"
        />
      </VCol>
    </VRow>
    <VSkeletonLoader
      type="table-tbody"
      class="mb-5"
    />
  </template>
  <template v-else>
    <VCard>
      <VCard flat>
        <FullCalendar
          ref="refCalendar"
          :options="calendarOptions"
        />
      </VCard>
    </VCard>
    <VDialog
      v-model="dialog.visible"
      persistent
      class="v-dialog-sm"
    >
      <!-- Dialog close btn -->
      <DialogCloseBtn @click="dialog.visible = !dialog.visible" />

      <!-- Dialog Content -->
      <VCard
        :loading="buttonLoading"
        :disabled="buttonLoading"
        title="Crear lista de asistencia"
      >
        <VCardText>
          {{ dialog.message }}
        </VCardText>

        <VCardText class="d-flex justify-end gap-3 flex-wrap">
          <VBtn
            variant="tonal"
            @click="dialog.visible = false"
          >
            Cancelar
          </VBtn>
          <VBtn @click="createAttendance">
            Crear asistencia
          </VBtn>
        </VCardText>
      </VCard>
    </VDialog>
  </template>
</template>

<style lang="scss">
@use "@core/scss/template/libs/full-calendar";

.custom-fc-title .fc-event-title {
  color: white;
  font-size: 1.2rem !important;
  padding-block-start: 1rem;
}
</style>

<style lang="scss" scoped>
.v-layout {
  overflow: visible !important;

  .v-card {
    overflow: visible;
  }
}
</style>
