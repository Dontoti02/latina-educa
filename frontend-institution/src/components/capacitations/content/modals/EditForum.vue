<script setup lang="ts">
import ModalBasic from '@/common/components/Modal.vue';
import { ToastService } from '@/common/util/toast.service';
import { FileResource, ForumPost } from '@/models/forum';
import { CapacitationForumService } from '@/services/capacitation-forum.service';
import { FileService } from '@/services/file.service';
import { CHUNK_SIZE, chunkFile } from '@/utils/file-utils';
import { uid } from 'uid';

// Initial
const props = defineProps<{
    show: boolean
    post: ForumPost
  }>()
  
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'updated'): void
}>()

// Quill editor
const postEditor = ref<string>()
const quillToolbar = [[{ size: ['small', false, 'large', 'huge'] }], ['bold', 'italic'], [{ list: 'bullet' }, { list: 'ordered' }], ['link', 'image']]

// Variables
const loadingSubmit = ref<boolean>(false)
const fileInput = ref<HTMLElement | null>(null)
const newFiles = ref<{
  file: FileResource
  progress?: number
}[]>([])
const deletedFiles = ref<number[]>([])

// Actions
const openFileInput = () => {
  fileInput?.value?.click()
}

const handleFileUpload = async (event: any) => {
  for (let i = 0; i < event.target.files.length; i++) {
    const file = event.target.files[i]

    // if (!isExtensionPermitted(file.extension, session)) {
    //   await allowedExtensionsMessage(file.name)

    //   return
    // }

    const contentMedia: FileResource = {
      metaData: {
        id: newFiles.value.length + 1,
        uuid: '',
        url: '',
        metadata: {
          type: file.type,
          originalName: file.name,
          extension: file.name.split('.').pop()!,
          size: file.size,
          unit: 'MB',
        },
      },
      file,
    }

    newFiles.value.push({
      file: contentMedia,
    })
  }
}

// Submit form
const deleteFiles = async () => {
  if (deletedFiles.value.length === 0) {
    return
  }

  await Promise.all(deletedFiles.value.map((fileId) => {
    return FileService.deleteFile('publication', fileId).catch(() => {
      ToastService.error('No se pudo eliminar un archivo')
    })
  }))
}

const uploadFiles = async () => {
  if (newFiles.value.length > 0) {
    const promises: Promise<any>[] = []

    newFiles.value.forEach(file => {
      const chunks = chunkFile(file.file.file, CHUNK_SIZE)
      const chunkUid = uid(16)
      let countResponse = 0
      
      chunks.forEach((chunk, index) => {
        const promise = FileService.uploadFile({
          model: 'training_publication',
          model_id: props.post.id,
          chunk,
          chunk_uid: chunkUid,
          chunk_number: index + 1,
          chunk_total: chunks.length,
          chunk_name: file.file.file.name,
        }).then(response => {
          countResponse++
          file.progress = Math.round((countResponse) / chunks.length * 100)
        }).catch(error => {
          ToastService.error(error)
        })

        promises.push(promise)
      })
    })

    await Promise.all(promises).then(() => {
      if (fileInput.value)
        fileInput.value.value = ''
    })
  }
}

const submit = async () => {
  if (postEditor.value === undefined || postEditor.value === null || postEditor.value === '') {
    ToastService.error('No puede realizar una publicación vacía')
    return
  }

  loadingSubmit.value = true
  await CapacitationForumService.updatePostsForum(props.post.id, {value: postEditor.value}).catch(error => {
    ToastService.error(error)
  })

  await deleteFiles()
  await uploadFiles()

  emit('updated')
  loadingSubmit.value = false
}

// Computed
const existingFiles = computed(() => {
  return props.post.files.filter(f => !deletedFiles.value.includes(f.id))
})

// Watchers
onMounted(() => {
  postEditor.value = props.post.value
})
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
        <VToolbarTitle>Actualización de publicación</VToolbarTitle>
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
          <VCol cols="12">
            <QuillEditor
              v-model:content="postEditor"
              theme="snow"
              :toolbar="quillToolbar"
              style="min-height: 5rem !important;"
              content-type="html"
              placeholder="Escribe una publicación..."
            />
          </VCol>
          <VCol cols="12">
            <p class="text-h6 mt-4 pt-4">
              Archivos
            </p>
            <VRow>
              <VCol
                v-for="(file, index) in existingFiles"
                :key="`existing-file${index}`"
                cols="12"
                md="3"
                sm="6"
              >
                <ResourceItem
                  :content-resource="file"
                  :disabled="loadingSubmit"
                  removable
                  @remove="deletedFiles.push(file.id)"
                />
              </VCol>
              <VCol
                v-for="(file, index) in newFiles"
                :key="`new-file${index}`"
                cols="12"
                md="3"
                sm="6"
              >
                <ResourceItem
                  :progress="file.progress"
                  :content-resource="file.file.metaData"
                  :disabled="loadingSubmit"
                  removable
                  @remove="newFiles.splice(index, 1)"
                />
              </VCol>
              <VCol
                cols="12"
                md="3"
                sm="6"
              >
                <VBtn
                  icon="tabler-plus"
                  variant="outlined"
                  :disabled="loadingSubmit"
                  color="primary"
                  size="small"
                  @click="openFileInput"
                />
                <input
                  ref="fileInput"
                  type="file"
                  style="display: none;"
                  multiple
                  @change="handleFileUpload"
                >
              </VCol>
            </vRow>
          </VCol>
        </VRow>
      </VCardText>
      <VCardActions>
        <div class="d-flex gap-4 justify-end w-100">
          <VBtn
            class="px-4"
            color="primary"
            variant="outlined"
            :disabled="loadingSubmit"
            text="Cancelar"
            @click="emit('close')"
          >
            Cancelar
          </VBtn>
          <VBtn
            class="px-4"
            color="primary"
            text="Actualizar"
            :loading="loadingSubmit"
            variant="flat"
            @click="submit"
          />
        </div>
      </VCardActions>
    </VCard>
  </ModalBasic>
</template>
