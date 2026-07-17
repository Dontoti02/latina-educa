<script setup lang="ts">
import { VDataTable } from 'vuetify/labs/VDataTable'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'
import { SessionStore } from '@/common/store'
import { ToastService } from '@/common/util/toast.service'
import type { GetParticipantsForStudent, ParticipantForStudent } from '@/models/participants'

import { DateFormatting } from '@/utils/date-formatting'
import { downloadFile } from '@/utils/file-utils'
import { CapacitationParticipantsService } from '@/services/capacitation-participant.service'
import { CapacitationContentService } from '@/services/capacitation-content.service'

// Initial
const props = defineProps<{
  trainingId: number
}>()

const session = SessionStore()

const loading = ref(false)
const loadingDownload = ref(false)

const search = ref<string>('')
const searchTimer = ref()

const headers = [
  { title: '#', key: 'index', sortable: false, align: 'center' },
  { title: 'NAME', key: 'names' },
  { title: 'EMAIL', sortable: false, key: 'email' },
  { title: 'LAST CONNECTION', key: 'last_connection', align: 'center' },
]

const participants = ref<Array<ParticipantForStudent> | null>(null)
const data = ref<GetParticipantsForStudent | null>(null)

// Actions
const getParticipants = () => {
  loading.value = true
  CapacitationParticipantsService.getParticipantsForStudent(props.trainingId)
    .then(response => {
      data.value = response.data
      participants.value = response.data.participants
    })
    .catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loading.value = false
    })
}

const downloadConsolidatedNotes = (type: 'xlsx' | 'pdf') => {
  loadingDownload.value = true
  CapacitationContentService.downloadConsolidatedNotes(type, props.trainingId).then(response => {
    downloadFile(response)
  }).catch(error => {
    console.error(error)
  }).finally(() => {
    loadingDownload.value = false
  })
}

// Mounted
onMounted(() => {
  getParticipants()
})

// Search
const findParticipants = () => {
  if (data.value === null || participants.value === null)
    return

  if (search.value === '') {
    participants.value = data.value.participants

    return
  }

  participants.value = data.value.participants.filter(participant => {
    return participant.names.toLowerCase().includes(search.value.toLowerCase().trim())
      || participant.email.toLowerCase().includes(search.value.toLowerCase().trim())
  })
}

watch(search, () => {
  if (searchTimer.value)
    clearTimeout(searchTimer.value)

  searchTimer.value = setTimeout(() => {
    findParticipants()
  }, 500)
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
  <VCard
    v-else
    class="py-4"
  >
    <template v-if="participants === null">
      <VSkeletonLoader type="table" />
    </template>
    <template v-else>
      <VDataTable
        :items="participants"
        :headers="headers"
        :items-per-page="10"
      >
        <template #top>
          <VRow
            class="pb-2 px-2"
            :justify="session.isSecretary() ? 'space-between' : 'end'"
          >
            <VCol
              v-if="session.isSecretary()"
              cols="12"
              md="6"
              lg="4"
            >
              <VBtn
                class="text-none"
                text="Descargar consolidado de notas"
                prepend-icon="mdi-download"
                variant="outlined"
                :loading="loadingDownload"
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
                @click="findParticipants"
              />
            </VCol>
          </VRow>
        </template>
        <template #item.index="{ index }">
          {{ index + 1 }}
        </template>
        <template #item.last_connection="{ value }">
          {{ !!value ? DateFormatting.formatDayOfMonth(new Date(value)) : '-' }}
        </template>
      </VDataTable>
    </template>
  </VCard>
</template>
