<script setup lang="ts">
import { ToastService } from '@/common/util/toast.service';
import { QuillEditor } from '@vueup/vue-quill';

// Initial
defineProps<{
  loading: boolean
}>()

const emit = defineEmits<{
  (e: 'addComment', comment: string): void
}>()

const quillOptions = {
  modules: {
    toolbar: [{ size: ['small', false, 'large'] }, 'bold', 'italic', { list: 'bullet' }],
  },
  placeholder: 'Escribe un comentario...',
}

const comment = ref<string>()
const quillEditorSelected = ref<boolean>(false)

const selectQuillEditor = () => {
  quillEditorSelected.value = true

  setTimeout(() => {
    const quillEditor = document.querySelector('#rich-editor-id .ql-editor')
    if (quillEditor)
      (quillEditor as HTMLElement).focus()
  }, 300)
}

const sendComment = () => {
  if (!comment.value || comment.value === '<p><br></p>' || comment.value === '')
    ToastService.error('El comentario no puede estar vacío')

  emit('addComment', comment.value ?? '')
  comment.value = '<p><br></p>'
}
</script>

<template>
  <VCard
    class="mt-4 px-4 py-4"
    variant="elevated"
  >
    <VRow>
      <VCol
        cols="12"
        class="font-weight-bold"
      >
        <VIcon
          start
          icon="tabler-brand-wechat"
        />
        <span>Comentarios de clase</span>
      </VCol>
      <VCol cols="12">
        <VRow>
          <VCol
            cols="12"
            class="py-0"
          >
            <VTextField
              v-if="!quillEditorSelected"
              placeholder="Escribe un comentario..."
              :disabled="loading"
              @focus="selectQuillEditor"
            />
            <QuillEditor
              v-else
              id="rich-editor-id"
              v-model:content="comment"
              theme="snow"
              content-type="html"
              :options="quillOptions"
              style="height: 60px !important;"
            />
            <div
              v-if="loading"
              style="position: absolute; top: 0; width: 100%; height: 100%; background: #ffff; opacity: 0.5;"
            />
          </VCol>
          <VCol cols="12">
            <VBtn
              style="text-transform: none;"
              variant="elevated"
              density="comfortable"
              rounded="sm"
              width="100%"
              :disabled="loading"
              @click="sendComment"
            >
              <span v-if="!loading">Enviar comentario</span>
              <VProgressCircular
                v-else
                indeterminate
                size="20"
                color="white"
              />
            </VBtn>
          </VCol>
        </VRow>
      </VCol>
    </VRow>
  </VCard>
</template>
