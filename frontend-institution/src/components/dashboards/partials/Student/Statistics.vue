<script setup lang="ts">
import type { Summary } from '@/models/dashboard'
import type { SessionDTO } from '@/models/login'

interface SummaryItem {
  icon: string
  color: string

}

const props = defineProps<{
  summary: Summary[]
  user: SessionDTO | null
}>()

const summaryLabelsStudent: SummaryItem[] = [
  {
    icon: 'tabler-books',
    color: 'primary',
  },
  {
    icon: 'tabler-school',
    color: 'info',
  },
  {
    icon: 'tabler-notebook',
    color: 'success',
  },
  {
    icon: 'tabler-exclamation-circle',
    color: 'error',
  },
]

const summaryLabelsTeacher: SummaryItem[] = [
  {
    icon: 'tabler-books',
    color: 'primary',
  },
  {
    icon: 'tabler-school',
    color: 'info',
  },
  {
    icon: 'tabler-notebook',
    color: 'success',
  },
  {
    icon: 'tabler-clock',
    color: 'secondary',
  },
]

const summaryLabelsSecretary: SummaryItem[] = [
  {
    icon: 'tabler-books',
    color: 'primary',
  },
  {
    icon: 'tabler-users-group',
    color: 'info',
  },
  {
    icon: 'tabler-school',
    color: 'success',
  },
  {
    icon: 'tabler-calendar-month',
    color: 'secondary',
  },
]

const getSummaryValues = computed(() => {
  let auxSummary: SummaryItem[] = []
  if (props.user?.role.id === 3)
    auxSummary = summaryLabelsStudent
  if (props.user?.role.id === 2)
    auxSummary = summaryLabelsTeacher
  if (props.user?.role.id === 1 || props.user?.role.id === 4)
    auxSummary = summaryLabelsSecretary

  return auxSummary.map((label, index) => {
    return {
      ...label,
      title: props.summary[index].title,
      value: props.summary[index].value,
    }
  })
})
</script>

<template>
  <VCard title="Estadisticas">
    <template #append>
      <span class="text-sm text-disabled">Actualizado hace 1 minuto</span>
    </template>

    <VCardText class="pt-6">
      <VRow>
        <VCol
          v-for="item in getSummaryValues"
          :key="item.title"
          cols="6"
          md="3"
        >
          <div class="d-flex align-center gap-4">
            <VAvatar
              :color="item.color"
              variant="tonal"
              size="42"
            >
              <VIcon :icon="item.icon" />
            </VAvatar>

            <div class="d-flex flex-column">
              <span class="text-h5 font-weight-medium">{{ item.value }}</span>
              <span class="text-sm">
                {{ item.title }}
              </span>
            </div>
          </div>
        </VCol>
      </VRow>
    </VCardText>
  </VCard>
</template>
