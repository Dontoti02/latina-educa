<script setup lang="ts">
import { ToastService } from '@/common/util/toast.service';
import type { ImportationType } from '@/models/importations';
import { ImportationsService } from '@/services/importations.service';

// Props
const props = defineProps<{
  importationType?: ImportationType
}>()

// Emits
const emit = defineEmits<{
  (e: 'fileUploaded', file: File): void
}>()

const fileDropArea = ref<null | any>(null)
const selectedFile = ref<File | null>(null)
const loading = ref(false)

// Methods
const uploadFile = () => {
  loading.value = true

  ImportationsService.uploadFile(selectedFile.value!, props.importationType!.key)
    .then(async () => {
      emit('fileUploaded', selectedFile.value!)
    })
    .catch(e => {
      ToastService.error(e)
    })
    .finally(() => {
      loading.value = false
    })
}

// On init
const preventDefaults = (e: Event) => {
  e.preventDefault()
  e.stopPropagation()
}

const handleDrop = (e: DragEvent) => {
  const dt = e.dataTransfer
  const files = dt?.files

  if (files?.length === 1) {
    const file = files[0]

    // Guardar el archivo en una variable o hacer lo que necesites con él
    if (file.name.split('.').pop() !== 'xls' && file.name.split('.').pop() !== 'xlsx') {
      ToastService.error('Solo puedes subir archivos con extensión .xls o .xlsx')

      return
    }

    selectedFile.value = file
  }
  else {
    ToastService.error('Solo puedes subir un archivo a la vez')
  }
}

const handleFileSelect = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (!target.files)
    return
  const file = target.files[0]

  // Guardar el archivo en una variable o hacer lo que necesites con él
  if (file.name.split('.').pop() !== 'xls' && file.name.split('.').pop() !== 'xlsx') {
    ToastService.error('Solo puedes subir archivos con extensión .xls o .xlsx')

    return
  }
  selectedFile.value = file
}

const selectFile = () => {
  fileDropArea.value?.$el.querySelector('input')?.click()
}

const init = () => {
  // Añadir listeners para eventos de arrastre
  const arr = ['dragenter', 'dragover', 'dragleave', 'drop']

  arr.forEach((eventName: string) => {
    fileDropArea.value?.$el.addEventListener(eventName, preventDefaults, false)
  })

  // Añadir listeners específicos para los eventos de arrastre
  fileDropArea.value?.$el.addEventListener('drop', handleDrop, false)

  // Añadir listener para el evento de cambio en el input de archivos
  fileDropArea.value?.$el.addEventListener('change', handleFileSelect, false)
}

onMounted(() => {
  init()
})
</script>

<template>
  <VCard
    ref="fileDropArea"
    :disabled="loading"
    flat
    variant="outlined"
    class="d-flex flex-column justify-center align-center px-8 py-6"
    @click="selectFile"
  >
    <VIcon
      :color="selectedFile ? 'primary' : 'secondary'"
      :size="200"
      icon="tabler-file-upload"
    />

    <VCardText
      class="text-center pt-0"
      style="user-select: none;"
    >
      <p
        class="mb-0"
        v-html="selectedFile ? selectedFile.name : 'Selecciona o arrastra tu archivo<br>Asegúrate que tenga la extensión .xls o .xlsx'"
      />
    </VCardText>
    <VBtn
      v-if="selectedFile"
      :loading="loading"
      @click.stop="uploadFile"
    >
      Subir archivo
      <VIcon
        end
        icon="tabler-cloud-upload"
      />
    </VBtn>

    <input
      id="fileInput"
      type="file"
      style="display: none;"
      accept=".xls,.xlsx"
    >
  </VCard>
</template>
