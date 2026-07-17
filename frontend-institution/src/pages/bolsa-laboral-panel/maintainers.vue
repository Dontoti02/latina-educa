<script setup lang="ts">
import { ref, watchEffect } from 'vue'
import { JobOpportunitiesMasterTableConfig, JobOpportunitiesMasterTableKey } from '@/config/job-opportunities.config';
import { useMasterService } from '@/services/job-opportutines/master-table.service';
import { MasterTable } from '@/models/job-opportunities/master-table';
import { VDataTable } from 'vuetify/lib/labs/components.mjs';
import { modalConfirmation } from '@/common/util/modal.service';
import PageHeader from '@/common/components/PageHeader.vue';
import { toastError, toastSuccess } from '@/common/util/toast.service';

const selectedTab = ref<JobOpportunitiesMasterTableKey>('work_schedule')
const config = ref(JobOpportunitiesMasterTableConfig[selectedTab.value])
const items = ref<MasterTable[]>([])
const loading = ref(false)
const showModal = ref(false)
const form = ref({ id: null, name: '', description: '' })

const service = useMasterService(config.value.apiBase)

const fetchItems = async () => {
  loading.value = true
  const { data } = await service.list()
  items.value = data
  loading.value = false
}

const openCreate = () => {
  form.value = { id: null, name: '', description: '' }
  showModal.value = true
}

const openEdit = (item: any) => {
  form.value = { id: item.id, name: item.name, description: item.description }
  showModal.value = true
}

const save = async () => {
  try {
    let response
    if (form.value.id) {
      response = await service.update(form.value.id, form.value)
    } else {
      response = await service.create(form.value)
    }
    const { success, message } = response
    if (!success) {
      toastError(message)
      return
    }
    toastSuccess(message)
    showModal.value = false
    fetchItems()
  } catch (error) {
    toastError(error as string)
  }
}

const removeItem = async (id: number) => {
  const confirm = await modalConfirmation({
    title: 'Eliminar',
    content: `¿Estás seguro de que deseas eliminar este ${config.value.title.toLowerCase()}?`
  })
  if (!confirm) return
  try {
    const { success, message } = await service.remove(id)
    if (!success) {
      toastError(message)
      return
    }
    toastSuccess(message)
    fetchItems()
  } catch (error) {
    toastError(error as string)
  }
}

watchEffect(() => {
  config.value = JobOpportunitiesMasterTableConfig[selectedTab.value]
  Object.assign(service, useMasterService(config.value.apiBase))
  fetchItems()
})
</script>

<template>
  <div>
    <PageHeader
      title="Mantenedores de Bolsa Laboral"
      description="Aquí puedes gestionar los mantenedores de la bolsa laboral."
    />

    <VCard class="mt-2">
      <VCardText>
        <VTabs v-model="selectedTab" show-arrows>
          <VTab v-for="(value, key) in JobOpportunitiesMasterTableConfig" :key="key" :value="key">
            {{ value.title }}
          </VTab>
        </VTabs>

        <div class="my-4 text-end">
          <VBtn color="primary" @click="openCreate">Crear {{ config.title }}</VBtn>
        </div>

        <VDataTable
          :headers="[
            { title: 'Nombre', key: 'name' },
            { title: 'Acciones', key: 'actions', sortable: false, align: 'end' }
          ]"
          :items="items"
          :loading="loading"
        >
          <template #item.actions="{ item }">
            <VBtn icon variant="text" @click="openEdit(item)"><VIcon>mdi-pencil</VIcon></VBtn>
            <VBtn icon variant="text" color="error" @click="removeItem(item.id)"><VIcon>mdi-delete</VIcon></VBtn>
          </template>
        </VDataTable>
      </VCardText>
    </VCard>
    
    <VDialog v-model="showModal" max-width="500">
      <VCard>
        <VCardTitle>
          {{ form.id ? 'Editar' : 'Crear' }} {{ config.title }}
        </VCardTitle>
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
          <VBtn color="primary" @click="save">Guardar</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
<route lang="yaml">
meta:
  action: read
  subject: JobMaintainers
</route>
