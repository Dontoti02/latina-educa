<script setup lang="ts">
import type { CurrentImport, ImportationType } from '@/models/importations'
import { ImportationsService } from '@/services/importations.service'
import { VSkeletonLoader } from 'vuetify/lib/labs/components.mjs'

// Images
import { ToastService } from '@/common/util/toast.service'
import BulbLightImg from '@images/illustrations/bulb-light.png'
import PencilRocketImg from '@images/illustrations/pencil-rocket.png'
import { VBtn } from 'vuetify/lib/components/index.mjs'

// Emits
const emit = defineEmits<{
  (e: 'uploadFile', obj: ImportationType): void
  (e: 'viewHistory', obj: ImportationType): void
}>()

// Importation types
const importationTypes = ref<ImportationType[]>([])

// Global variables
const loading = ref(false)
const finished = ref(false)
const progressData = ref<CurrentImport>()
const confirmDialog = ref(false)
const finishAllProcesses = async () => {
  loading.value = true
   await ImportationsService.finishAllImports().then(response => {
     if (response.success) {
       ToastService.success('Procesos finalizados correctamente')
       repeatRequest().then(()=>{
         loading.value = false
         confirmDialog.value = false
        }) 
     }
     else
       ToastService.error('Ocurrió un error al finalizar los procesos')
   }) 
}

const finishProcess= async (key:string)=>{
  loading.value = true
  await ImportationsService.finishImport(key).then(response => {
    if (response.success) {
      ToastService.success('Proceso finalizado correctamente')
     repeatRequest().then(()=>{
      loading.value = false
     }) 
    }
    else
      ToastService.error('Ocurrió un error al finalizar el proceso')
  }) 
}
// Methods
const getImportationTypes = async () => {
  loading.value = true
  await ImportationsService.getImportationTypes().then(response => {
    importationTypes.value = response.data
    loading.value = false
  }).finally(() => {
  })
}

const repeatRequest = async () => {
  do {
    const request = await ImportationsService.getCurrentImport()

    if (!request.success)
      ToastService.error('Ocurrió un error al obtener la importación actual')

    if (!request.data) {
      finished.value = true
      progressData.value = request.data

      return
    }
    else { progressData.value = request.data }

    await new Promise(resolve => setTimeout(resolve, 10000))
  } while (!finished.value)
}

const uploadFile = (item: ImportationType, index: number) => {
  if ((index === 0 || !(importationTypes.value[index - 1].last_date === null)) && progressData)
    emit('uploadFile', item)
}

// Lifecycle hooks
onMounted(() => {
  repeatRequest()
  getImportationTypes()
})

onUnmounted(() => {
  finished.value = true
})
</script>

<template>
  <template v-if="loading">
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
          type="table"
        />
      </VCol>
    </VRow>
  </template>
  <template v-else>
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
          <h1>Importaciones</h1>
          <p>Carga aqui los datos en formato .xls o xlsx para que esten disponibles en la plataforma</p>
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
    <VCard class="mt-6">
      <VTable class="text-no-wrap">
        <thead>
          <tr>
            <th style="width: 3rem;" />
            <th>
              Tipo de importación
            </th>
            <th class="text-center">
              Última vez
            </th>
            <th>
              Acciones
            </th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(item, index) in importationTypes"
            :key="item.key"
            class="row-table"
          >
            <td>
              <VIcon
                color="primary"
                size="large"
                :icon="`tabler-circle-${index + 1}-filled`"
              />
            </td>
            <td>
              {{ item.title }}
            </td>
            <td>
              <template v-if="progressData?.key === item.key">
                <div class="d-flex justify-center" >
                   <div class="buttons-container"  @mouseenter="item.showButton = true"
                   @mouseleave="item.showButton = false">
                  <VBtn v-if="item.showButton"
                  icon
                  variant="text"
                  color="error"
                  class="ml-2"
                  @click="finishProcess(item.key)"
                >
                  <VIcon icon="tabler-x" />
                </VBtn>
                  <VProgressCircular v-else
                    indeterminate
                    color="primary"
                  />
                </div>
                </div>
             
              </template>
              <template v-else>
                <div class="text-center">
                  {{ item.last_date ?? 'No disponible' }}
                </div>
              </template>
            </td>
            <td>
              <VBtn
                icon
                variant="text"
                color="primary"
                @click="uploadFile(item, index)"
              >
                <VIcon
                  size="x-large"
                  icon="tabler-upload"
                />
                <VTooltip
                  v-if="progressData"
                  activator="parent"
                  location="top"
                  class="text-center"
                >
                  Se esta ejecutando una importacion
                </VTooltip>
                <VTooltip
                  v-else-if="index !== 0 && importationTypes[index - 1].last_date === null"
                  activator="parent"
                  location="top"
                  class="text-center"
                >
                  Necesita ejecutar la importacion anterior
                </VTooltip>
              </VBtn>
              <VBtn
                icon
                variant="text"
                color="primary"
                @click="emit('viewHistory', item)"
              >
                <VIcon
                  size="x-large"
                  icon="tabler-history"
                />
              </VBtn>
            </td>
          </tr>
        </tbody>
      </VTable>
    </VCard>
  <VBtn
    class="ml-auto"
    color="error"
    style="margin-top: 1%;
    float: right;"
    @click="confirmDialog = true"
  >
    Finalizar Todos Los Procesos
  </VBtn>
  <VDialog v-model="confirmDialog" max-width="500">
    <VCard>
      <VCardTitle class="headline">Confirmación</VCardTitle>
      <VCardText>¿Está seguro de que desea finalizar todos los procesos?</VCardText>
      <VCardActions>
        <VSpacer />
        <VBtn color="primary" text @click="confirmDialog = false">Cancelar</VBtn>
        <VBtn color="error" text @click="finishAllProcesses">Confirmar</VBtn>
      </VCardActions>
    </VCard>
  </VDialog>
  </template>
</template>

<style scoped>
.row-table:hover {
  background-color: rgb(var(--v-theme-background));
}

.row-table {
  transition-duration: 200ms;
}
</style>
