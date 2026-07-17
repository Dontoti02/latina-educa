<script setup lang="ts">
import { VDataTable } from 'vuetify/labs/VDataTable'
import ModalBasic from '@/common/components/Modal.vue'
import type { Schedule } from '@/models/schedules'

// Initial
const props = withDefaults(
  defineProps<{
    schedule: Schedule
    show: boolean
  }>(),
  {
    show: false,
  },
)

const emit = defineEmits<{
  (e: 'close'): void
}>()

const headers = [
  { title: '#', key: 'index', sortable: false, align: 'center' },
  { title: 'NAMES', key: 'names' },
  { title: 'EMAIL', sortable: false, key: 'email' },
]
</script>

<template>
  <ModalBasic
    :visible="props.show"
    is-persistent
    width="1000"
    is-scrollable
  >
    <VCard>
      <VToolbar>
        <VToolbarTitle>{{ schedule.course.name }}</VToolbarTitle>
        <VSpacer />
        <VBtn
          icon
          @click="emit('close')"
        >
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VToolbar>
      <VCardText class="px-4 pb-4">
        <VRow>
          <VCol
            cols="12"
            class="px-0 py-0"
          >
            <VDataTable
              :items="schedule.participants"
              :headers="headers"
              :items-per-page="10"
            >
              <template #top>
                <VRow
                  class="pb-2 mx-0"
                  justify="space-between"
                  align="center"
                >
                  <VCol
                    cols="6"
                    class="text-h5"
                  >
                    Lista de estudiantes
                  </VCol>
                  <!--
                    <VCol
                    cols="4"
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
                  -->
                </VRow>
              </template>

              <template #item.index="{ index }">
                {{ index + 1 }}
              </template>
            </VDataTable>
          </VCol>
        </VRow>
      </VCardText>
      <VCardActions />
    </VCard>
  </ModalBasic>
</template>

<style lang="scss">
.days-radio-group {
  .v-input__control .v-selection-control-group--inline {
    justify-content: space-between !important;
  }
}
</style>
