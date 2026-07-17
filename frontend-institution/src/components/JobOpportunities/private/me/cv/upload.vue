<script lang="ts" setup>
import emitter from '@/common/util/emitter.service'
import { toastError, toastSuccess } from '@/common/util/toast.service'
import { JobOpportunitiesJobOfferService } from '@/services/job-opportutines/job-offer'
import { ref } from 'vue'

const dialog = ref(false)
const file = ref<File[]|null>(null)
const props = withDefaults(defineProps<{
  styleBtn : 'icon' | 'tonal'
}>(), {
  styleBtn : 'icon'
})

const subirArchivo = async () => {
  if (!file.value) {
    toastError('Por favor, selecciona un archivo para subir.')
    return
  }
  try {
    const {success, message,data } = await JobOpportunitiesJobOfferService.uploadCV(file.value[0])
    if (!success) {
      toastError('Error al subir el archivo: ' + message)
      return
    }
    emitter.emit('uploadCV', data)
    toastSuccess('Archivo subido correctamente' + message)
    dialog.value = false
  } catch (error) {
    toastError('Error al subir el archivo: ' + (error as Error).message)
  } finally {
    file.value = null 
  }
}

</script>
<template>
   <div>
    <VBtn icon color="primary" variant="text" @click="dialog = true"
      v-if="props.styleBtn === 'icon'"
    >
      <VIcon>mdi-plus</VIcon>
    </VBtn>
    <VBtn color="primary" @click="dialog = true"
      v-else-if="props.styleBtn === 'tonal'" class="mb-4"
    >
      <VIcon icon="mdi-plus" class="mr-2" />
      Agregar CV
    </VBtn>
    <VDialog v-model="dialog" max-width="500">
      <VCard>
        <VCardTitle class="text-h6">Subir nuevo CV</VCardTitle>

        <VCardText>
          <VFileInput
            v-model="file"
            label="Selecciona un archivo"
            accept=".pdf,.doc,.docx,.odt"
            prepend-icon="mdi-upload"
            show-size
            outlined
            dense
          />
        </VCardText>

        <VCardActions>
          <VSpacer />
          <VBtn text @click="dialog = false">Cancelar</VBtn>
          <VBtn color="primary" @click="subirArchivo" :disabled="!file">Subir</VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
