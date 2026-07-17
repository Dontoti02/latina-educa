<script setup lang="ts">
import type { Detail, ImportHistory, ImportationType } from '@/models/importations';
import { ImportationsService } from '@/services/importations.service';
import { VSkeletonLoader } from 'vuetify/lib/labs/components.mjs';

const props = defineProps<{
  importationType?: ImportationType
}>()

// Emits
const emit = defineEmits<{
  (e: 'back'): void
}>()

const loading = ref(true)
const history = ref<ImportHistory>()
const log = ref<string[]>([])

const concatLog = computed(() => {
  return log.value.join('\n')
})

const getHistory = () => {
  loading.value = true
  ImportationsService.getImportHistory(props.importationType!.id)
    .then(response => {
      history.value = response.data
    })
    .finally(() => {
      loading.value = false
    })
}

const selectLog = (items: Detail) => {
  log.value = items.log
}

onMounted(() => {
  getHistory()
})
</script>

<template>
  <template v-if="loading">
    <VRow>
      <VCol cols="12">
        <VSkeletonLoader
          class="w-100 gap-4 "
          type="table"
        />
      </VCol>
    </VRow>
  </template>
  <template v-else>
    <VCard>
      <VCardText>
        <VCard elevation="0">
          <VRow>
            <VCol class="d-flex align-center">
              <VBtn
                variant="tonal"
                icon="tabler-chevron-left"
                class="mr-2"
                density="compact"
                rounded="sm"
                @click="emit('back')"
              />

              <div class="text-h4">
                Importar {{ importationType?.title.toLowerCase() }}
              </div>
            </VCol>
          </VRow>
        </VCard>
      </VCardText>
      <VRow class="mt-1">
        <VCol
          md=""
          cols="12"
          class="align-center  px-md-10 px-2"
        >
          <VTable
            height="35rem"
            class="text-no-wrap"
          >
            <thead>
              <tr>
                <th>
                  Fecha de importación
                </th>
                <th class="text-center">
                  Estado
                </th>
                <th class="text-center">
                  Acciones
                </th>
              </tr>
            </thead>

            <tbody>
              <tr
                v-for="(item) in history?.details"
                :key="item.id"
                class="row-table"
              >
                <td>
                  {{ item.date }}
                </td>
                <td class="text-center">
                  {{ item.status === 'completed' ? 'Completado' : item.status === 'failed' ? 'Fallido' : 'En proceso' }}
                </td>
                <td class="d-flex justify-center align-center">
                  <VBtn
                    icon
                    variant="text"
                    color="primary"
                    @click="selectLog(item)"
                  >
                    <VIcon
                      size="x-large"
                      icon="tabler-eye"
                    />
                  </VBtn>
                </td>
              </tr>
            </tbody>
          </VTable>
        </VCol>
        <VDivider
          v-if="log.length > 0"
          vertical
        />
        <VCol
          v-if="log.length > 0"
          md=""
          cols="12"
          class="px-md-10 px-2"
        >
          <VCardText class="pr-0 pt-0 pb-2 pl-4">
            Consola de progreso
          </VCardText>
          <VTextarea
            v-model="concatLog"
            readonly
            no-resize
            single-line
            class="console-text"
            rows="20"
          />
        </VCol>
      </VRow>
    </VCard>
  </template>
</template>
<style>
.console-text textarea {
  font-size: 0.85rem !important;
  white-space: pre !important;
}
</style>
