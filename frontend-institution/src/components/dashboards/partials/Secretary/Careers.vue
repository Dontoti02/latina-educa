<script setup lang="ts">
import type { StudyProgram } from '@/models/dashboard'
import type { SessionDTO } from '@/models/login'

const props = defineProps<{
  careers: StudyProgram[]
  user: SessionDTO | null
}>()

const colors = ref(['primary', 'success', 'error', 'secondary', 'info'])

const getColors = (index: number) => {
  return colors.value[index % colors.value.length]
}

onMounted(() => {})
</script>

<template>
  <VCard
    title="Carreras"
    :subtitle="`Existen ${careers.length} carreras registradas`"
  >
    <VCardText>
      <p
        v-if="careers.length === 0"
        class="text-center"
      >
        No se han encontrado cursos registrados
      </p>
      <VList class="card-list">
        <VListItem
          v-for="(career, index) in careers"
          :key="career.id"
        >
          <template #prepend>
            <VAvatar
              size="34"
              :color="getColors(index)"
              variant="tonal"
              rounded
            >
              <VIcon icon="tabler-school" />
            </VAvatar>
          </template>

          <VListItemTitle class="font-weight-medium">
            {{ career.name }}
          </VListItemTitle>

          <VListItemSubtitle class="text-disabled">
            Cursos registrados {{ career.total_classrooms }}
          </VListItemSubtitle>
        </VListItem>
      </VList>
    </VCardText>
  </VCard>
</template>
