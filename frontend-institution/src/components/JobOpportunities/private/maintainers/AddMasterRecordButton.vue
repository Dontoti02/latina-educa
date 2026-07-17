<script setup lang="ts">
import { ref } from 'vue'
import { JobOpportunitiesMasterTableConfig, JobOpportunitiesMasterTableKey } from '@/config/job-opportunities.config'
import { useMasterService } from '@/services/job-opportutines/master-table.service'
import { toastError, toastSuccess } from '@/common/util/toast.service'

const emit = defineEmits<{
  (e: 'record-added', record: { id: number; name: string; description: string | null }): void
}>()

const props = defineProps<{
  tableKey: JobOpportunitiesMasterTableKey
}>()

const config = JobOpportunitiesMasterTableConfig[props.tableKey]
const service = useMasterService(config.apiBase)

const showModal = ref(false)
const form = ref({ name: '', description: '' })
const loading = ref(false)

const open = () => {
  form.value = { name: '', description: '' }
  showModal.value = true
}

const save = async () => {
  try {
    loading.value = true
    const response = await service.create(form.value)
    const { success, message, data } = response
    if (!success) {
      toastError(message)
      return
    }

    toastSuccess(message)
    emit('record-added', data)
    showModal.value = false
  } catch (error) {
    toastError(error as string)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <VBtn
      icon
      variant="text"
      color="primary"
      @click="open"
      :title="`Añadir nuevo ${config.title}`"
    >
      <VIcon>mdi-plus</VIcon>
    </VBtn>

    <VDialog v-model="showModal" max-width="500">
      <VCard>
        <VCardTitle>Crear {{ config.title}}</VCardTitle>
        <VCardText>
          <VForm>
            <VRow>
              <VCol cols="12">
                <VTextField
                  v-model="form.name"
                  label="Nombre"
                  required
                />
              </VCol>
              <VCol cols="12">
                <VTextField
                  v-model="form.description"
                  label="Descripción"
                />
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
        <VCardActions>
          <VSpacer />
          <VBtn text @click="showModal = false">Cancelar</VBtn>
          <VBtn color="primary" :loading="loading" @click="save">Guardar</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
