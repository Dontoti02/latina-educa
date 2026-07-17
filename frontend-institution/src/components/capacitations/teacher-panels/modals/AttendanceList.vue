<script setup lang="ts">
import { ToastService } from '@/common/util/toast.service'
import type { Attendance, CapacitationAttendanceListRequest } from '@/models/attendance'
import { CapacitationAttendanceService } from '@/services/capacitation-attendance.service'
import CapacitationMenuDrawerService from '@/services/capacitation-menu-drawer.service'
import { downloadFile } from '@/utils/file-utils'
import { ImageUtils } from '@/utils/images'
import Close from '@images/icons/bootstrap-icons/close.svg'
import { VDataTable } from 'vuetify/lib/labs/components.mjs'

const attendanceList = ref<Attendance[]>([])
const loadingDownload = ref(false)
const form = ref<CapacitationAttendanceListRequest>()
const updatedList = ref(false)

// 👉 Event
const isEventHandlerSidebarActive = ref(false)

// 👉 Date
const selectedDate = ref<string | null>()

// Search field
const attendanceListSearch = ref<string>('')

// Loading drawer
const drawerLoading = ref(false)

// Dialog
const lateAttendanceDialog = ref<{
  visible: boolean
  reason: string
  student: Attendance | null
  loading: boolean
}>({ visible: false, reason: '', student: null, loading: false })

// Table Headers
const headers = [
  { title: 'Estudiante', key: 'person' },
  { title: 'Asistencia', key: 'attended', align: 'center' },
]

// Methods
const invertDate = (date?: string | null) => {
  if (!date)
    return ''

  const arr = date.split('-')

  return `${arr[2]}-${arr[1]}-${arr[0]}`
}

const markAttendance = (student: Attendance, status: 'attended' | 'absence' | 'late' | null, reason?: string) => {
  if(student.status === status)
    return
  
  student.loading = true
  student.status = status

  if(status === 'late') {
    lateAttendanceDialog.value.loading = true
  }
  CapacitationAttendanceService.markAttendance(student.id, { status, reason })
    .then(() => {
      updatedList.value = true
    })
    .catch(err => {
      ToastService.error(err.response.data.message)
    }).finally(() => {
      student.loading = false

      if(status === 'late') {
        lateAttendanceDialog.value.visible = false
        lateAttendanceDialog.value.loading = false
      }
      if (reason)
        student.reason = reason
    })
}

const getAttendanceList = (body: { date: string; training_id: number }) => {
  drawerLoading.value = true
  selectedDate.value = body.date
  isEventHandlerSidebarActive.value = true
  CapacitationAttendanceService.getAttendanceList({ training_id: body.training_id, date: body.date })
    .then(res => {
      attendanceList.value = res.data
    })
    .catch(err => {
      ToastService.error(err)
    })
    .finally(() => {
      drawerLoading.value = false
    })
}

const download = (type: 'xlsx' | 'pdf') => {
  loadingDownload.value = true
  CapacitationAttendanceService.downloadAttendanceReport(type, form.value!).then(response => {
    downloadFile(response)
  }).catch(err => {
    ToastService.error(err)
  }).finally(() => {
    loadingDownload.value = false
  })
}
const deleteAssistance = () => {
  loadingDownload.value = true
  CapacitationAttendanceService.deleteAttendanceList(form.value!).then((attendances) => {
    attendanceList.value = attendances.data
    ToastService.success('Asistencia eliminada')
    closeDrawer()
  }).catch(err => {
    ToastService.error(err)
  }).finally(() => {
    loadingDownload.value = false
    CapacitationMenuDrawerService.emitUpdatedList()
  })
}

const closeDrawer = () => {
  isEventHandlerSidebarActive.value = false
  selectedDate.value = null
  attendanceList.value = []

  if (updatedList.value)
    CapacitationMenuDrawerService.emitUpdatedList()
}

// Computed
const filterList = computed(() => {
  return attendanceList.value.filter(attendance => {
    return attendance.person.toLowerCase().includes(attendanceListSearch.value.toLowerCase())
  })
})

// Mounted
onMounted(() => {
  CapacitationMenuDrawerService.on('loadList', (body: { date: string; training_id: number }) => {
    getAttendanceList(body)
    form.value = body
    updatedList.value = false
  })

  CapacitationMenuDrawerService.on('createList', (body: { list: Attendance[]; date: string ,training_id:number}) => {
    form.value= { training_id: body.training_id, date: body.date }
    attendanceList.value = body.list
    selectedDate.value = body.date
    isEventHandlerSidebarActive.value = true
    updatedList.value = false
  })
})
</script>

<template>
  <VNavigationDrawer
    v-model="isEventHandlerSidebarActive"
    temporary
    location="end"
    width="700"
    @update:model-value="closeDrawer"
  >
    <VCard
      v-if="drawerLoading"
      v-model="drawerLoading"
      height="100%"
      width="100%"
      class="d-flex align-center justify-center"
      contained
    >
      <VProgressCircular
        indeterminate
        color="primary"
        class="mt-10"
      />
    </VCard>
    <VCard
      v-else
      style="min-height: 100%;"
      flat
    >
      <VCardText>
        <VCardTitle>
          <div class="d-flex align-center mb-1 justify-space-between">
            <div class="text-h4">
              Asistencia del {{ invertDate(selectedDate) }}
            </div>
            <div>
              <img
                style="height: 1.5rem; cursor: pointer;"
                :src="Close"
                alt=""
                @click="closeDrawer"
              >
            </div>
          </div>

          <div>
            <AppTextField
              v-model="attendanceListSearch"
              placeholder="Buscar estudiante..."
            />
          </div>
          <div class="d-flex justify-end mt-2">
            <DownloadReportBtn
              :loading="loadingDownload"
              @download="download"
            />
            <VBtn
              @click="deleteAssistance"
              color="error"
              class="ml-2"
            >Eliminar Asistencia</VBtn>
          </div>
        </VCardTitle>
        <VDataTable
          :items="filterList"
          :headers="headers"
          :items-per-page="100"
        >
          <template #item.person="{ item }">
            <div class="text-left">
              <VAvatar
                v-if="item.photo"
                class="mr-2"
                :image="ImageUtils.getUrlImage(item.photo)"
              />

              <VAvatar
                v-else
                class="mr-2"
                color="primary"
                variant="tonal"
                size="large"
              >
                <VIcon
                  size="large"
                  icon="tabler-user"
                />
              </VAvatar>
              {{ item.person }}
            </div>
          </template>
          <template #item.attended="{ item }">
            <VCard
              elevation="0"
              :disabled="item.loading"
              :loading="item.loading"
              class="text-center d-flex justify-center gap-2"
            >
              <VBtn
                icon="tabler-check"
                :variant="item.status === 'attended' ? 'tonal' : 'text'"
                density="comfortable"
                :color="item.status === 'attended' ? 'success' : 'secondary'"
                @click.prevent="markAttendance(item, 'attended')"
              />
              <VBtn
                icon="tabler-x"
                :variant="item.status === 'absence' ? 'tonal' : 'text'"
                density="comfortable"
                :color="item.status === 'absence' ? 'error' : 'secondary'"
                @click.prevent="markAttendance(item, 'absence')"
              />
              <VBtn
                icon="tabler-clock-hour-4"
                :variant="item.status === 'late' ? 'tonal' : 'text'"
                density="comfortable"
                :color="item.status === 'late' ? 'warning' : 'secondary'"
                @click="lateAttendanceDialog.visible = true; lateAttendanceDialog.student = item; lateAttendanceDialog.reason = item.reason"
              />
            </VCard>
          </template>
        </VDataTable>
      </VCardText>
    </VCard>
  </VNavigationDrawer>
  <VDialog
    v-model="lateAttendanceDialog.visible"
    persistent
    class="v-dialog-sm"
  >
    <!-- Dialog close btn -->
    <DialogCloseBtn @click="lateAttendanceDialog.visible = false;lateAttendanceDialog.reason = ''" />

    <!-- Dialog Content -->
    <VCard
      :loading="lateAttendanceDialog.loading"
      :disabled="lateAttendanceDialog.loading"
      title="Marcar tardanza"
    >
      <VCardText>
        Si es necesario agregue un motivo para la tardanza
      </VCardText>

      <VCardText>
        <VTextarea v-model="lateAttendanceDialog.reason" />
      </VCardText>

      <VCardText class="d-flex justify-end gap-3 flex-wrap">
        <VBtn
          :loading="lateAttendanceDialog.loading"
          variant="tonal"
          @click="lateAttendanceDialog.visible = false; lateAttendanceDialog.reason = ''"
        >
          Cancelar
        </VBtn>
        <VBtn
          :loading="lateAttendanceDialog.loading"
          @click="markAttendance(lateAttendanceDialog.student!, 'late', lateAttendanceDialog.reason)"
        >
          Marcar tardanza
        </VBtn>
      </VCardText>
    </VCard>
  </VDialog>
</template>
