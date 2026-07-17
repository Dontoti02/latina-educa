<script setup lang="ts">
import { SessionStore } from '@/common/store'
import modalService from '@/common/util/modal.service'
import { ToastService } from '@/common/util/toast.service'
import AddEvidence from '@/components/resources/AddEvidence.vue'
import LinkItem from '@/components/resources/LinkItem.vue'
import ResourceItem from '@/components/resources/ResourceItem.vue'
import type { CourseContentLink, TrainingContentDetailForStudent } from '@/models/content'
import type { CourseContentResource } from '@/models/courses'
import type { FileResource } from '@/models/forum'
import { CapacitationAnswerService as AnswerService} from '@/services/capacitation-answer.service'
import { FileService } from '@/services/file.service'
import { LinkService } from '@/services/link.service'
import { CHUNK_SIZE, chunkFile } from '@/utils/file-utils'
import { uid } from 'uid'

// Initial
const props = defineProps<{
  contentId: number
  isOpen: TrainingContentDetailForStudent['is_open']
  answer: TrainingContentDetailForStudent['answer']
  formUuid?: string | null
}>()

const emit = defineEmits<{
  (e: 'removeResource', id: number): void
  (e: 'removeLink', id: number): void
  (e: 'updateFilesAnswer', answer: TrainingContentDetailForStudent['answer']['files']): void
  (e: 'updateLinksAnswer', answer: TrainingContentDetailForStudent['answer']['links']): void
  (e: 'changeStatus', status: TrainingContentDetailForStudent['answer']['status']): void
}>()

const session = SessionStore()
const addEvidence = ref(null)

const uploadingFiles = ref(false)
const removingFile = ref<number | null>(null)
const changingStatus = ref(false)

const newFiles = ref<{
  file: FileResource
  progress: number
}[]>([])

const newLink = ref<CourseContentLink | null>(null)

const formEvaluationLink = ref<CourseContentLink | null>(null)

// File actions
const addFile = async (event: any) => {
  if (event.target.files.length === 0)
    return

  let lastData: any = null
  const promises: Promise<any>[] = []
    
  for (let i = 0; i < event.target.files.length; i++) {
    const file = event.target.files[i]

    const extension = file.name.split('.').pop()
    if (!extension)
      return

    // if (!isExtensionPermitted(extension, session)) {
    //   await allowedExtensionsMessage(file.name)

    //   return
    // }

    uploadingFiles.value = true

    const newEvidenceFile: CourseContentResource = {
      id: newFiles.value.length + 1,
      uuid: '',
      url: URL.createObjectURL(file),
      metadata: {
        type: extension,
        originalName: file.name,
        extension,
        size: file.size,
        unit: 'MB',
      },
    }

    const newFile = ref({
      file: {
        metaData: newEvidenceFile,
        file,
      },
      progress: 0,
    })

    newFiles.value.push(newFile.value)

    const chunks = chunkFile(file, CHUNK_SIZE)
    const chunkUid = uid(16)
    let countResponse = 0
    

    chunks.forEach((chunk, index) => {
      const promise = FileService.uploadFile({
        model: 'training_answer',
        model_id: props.answer.id,
        chunk,
        chunk_uid: chunkUid,
        chunk_number: index + 1,
        chunk_total: chunks.length,
        chunk_name: file.name,
      }).then(response => {
        countResponse++
        newFile.value.progress = Math.round((countResponse) / chunks.length * 100)
        if (Array.isArray(response.data)) {
          lastData = response.data
        }
      }).catch(error => {
        ToastService.error(error)
      })

      promises.push(promise)
    })

  }
  await Promise.all(promises).then(() => {
    newFiles.value = []
    uploadingFiles.value = false
    if(lastData)
      emit('updateFilesAnswer', lastData)

    if (addEvidence.value)
      addEvidence.value.clearFileInput()
  })
}

const removeFile = (id: number) => {
  removingFile.value = id
  FileService.deleteFile('training_answer', id).then(() => {
    emit('removeResource', id)
  }).catch(error => {
    ToastService.error(error)
  }).finally(() => {
    removingFile.value = null
  })
}

// Link actions
const addLink = (link: string) => {
  newLink.value = {
    id: 1,
    url: link,
  }

  uploadingFiles.value = true
  LinkService.createLink({ model: 'training_answer', model_id: props.answer.id, link }).then(response => {
    emit('updateLinksAnswer', response.data)
  }).catch(error => {
    ToastService.error(error)
  }).finally(() => {
    newLink.value = null
    uploadingFiles.value = false
  })
}

const removeLink = (id: number) => {
  removingFile.value = id
  LinkService.deleteLink('training_answer', id).then(() => {
    emit('removeLink', id)
  }).catch(error => {
    ToastService.error(error)
  }).finally(() => {
    removingFile.value = null
  })
}

// Task actions
const changeStatus = async (type: 'delivered' | 'cancel') => {
  if (type === 'cancel') {
    const confirm = await modalService.confirmation({
      title: '¿Estás seguro de cancelar la entrega de la tarea?',
      content: 'Esta acción no se puede deshacer',
    })

    if (!confirm)
      return
  }

  changingStatus.value = true
  AnswerService.changeStatus(props.answer.id)
    .then(response => {
      emit('changeStatus', response.data)
      ToastService.success('Estado actualizado')
    })
    .catch(error => {
      ToastService.error(error)
    }).finally(() => {
      changingStatus.value = false
    })
}

// Mounted
onMounted(() => {
  if(props.formUuid)
    formEvaluationLink.value = {
      id: 0,
      url: `${window.location.origin}/evaluation-form/training/${props.formUuid}`,
    }
})
</script>

<template>
  <VCard
    class="px-4 py-4"
    variant="elevated"
  >
    <VRow>
      <VCol
        cols="6"
        class="text-h5"
      >
        Evidencias
      </VCol>
      <VCol
        cols="6"
        class="text-right"
        :class="{
          'text-success': answer?.status === 'delivered',
          'text-warning': answer?.status === 'pending',
          'text-error': answer?.status === 'overdue',
        }"
      >
        {{ answer?.status === 'delivered' ? 'Completada' : answer?.status === 'pending' ? 'Pendiente' : answer?.status === 'overdue' ? 'Entregada con retraso' : 'Evaluada' }}
      </VCol>
    </VRow>
    <VRow>
      <VCol
        cols="12"
        class="py-0"
      >
        <VRow class="pt-2 pb-4">
          <VCol
            v-if="formEvaluationLink"
            cols="12"
            lg="12"
            md="4"
            sm="6"
            class="py-1"
          >
            <LinkItem
              :content-link="formEvaluationLink"
              :disabled="changingStatus"
            />
          </VCol>
          <VCol
            v-for="resource in answer?.files || []"
            :key="resource.id"
            cols="12"
            lg="12"
            md="4"
            sm="6"
            class="py-1"
          >
            <ResourceItem
              :content-resource="resource"
              :removable="answer?.status === 'pending'"
              :disabled="removingFile !== null || changingStatus"
              @remove="removeFile"
            />
          </VCol>
          <VCol
            v-for="link in answer?.links || []"
            :key="link.id"
            cols="12"
            lg="12"
            md="4"
            sm="6"
            class="py-1"
          >
            <LinkItem
              :content-link="link"
              :removable="answer?.status === 'pending'"
              :disabled="removingFile !== null || changingStatus"
              @remove="removeLink"
            />
          </VCol>
          <VCol
            v-for="(file, index) in newFiles"
            :key="index"
            cols="12"
            lg="12"
            md="4"
            sm="6"
            class="py-1"
          >
            <ResourceItem
              :content-resource="file.file.metaData"
              :disabled="uploadingFiles"
              :progress="file.progress"
              @remove="emit('removeResource', $event)"
            />
          </VCol>
          <VCol
            v-if="!!newLink"
            cols="12"
            lg="12"
            md="4"
            sm="6"
            class="py-1"
          >
            <LinkItem
              :content-link="newLink"
              removable
              :disabled="uploadingFiles"
            />
          </VCol>
          <VCol
            v-if="answer?.status === 'pending' && !formUuid"
            cols="12"
            class="py-1"
          >
            <AddEvidence
              ref="addEvidence"
              :disabled="!isOpen || uploadingFiles || removingFile !== null || changingStatus"
              :loading="uploadingFiles"
              @add-files="addFile"
              @add-link="addLink"
            />
          </VCol>
        </VRow>
      </VCol>
    </VRow>
    <VRow v-if="!formUuid" class="py-2">
      <template v-if="answer?.status === 'delivered' || answer?.status === 'overdue'">
        <VCol
          cols="12"
          class="py-0"
        >
          <VBtn
            text="Anular entrega"
            variant="elevated"
            style="text-transform: none;"
            width="100%"
            :disabled="!isOpen || changingStatus"
            :loading="changingStatus"
            @click="changeStatus('cancel')"
          />
        </VCol>
      </template>
      <template v-else>
        <VCol
          cols="12"
          class="py-0"
        >
          <VBtn
            variant="elevated"
            style="text-transform: none;"
            width="100%"
            :disabled="!isOpen || answer.status !== 'pending' || uploadingFiles || removingFile !== null || changingStatus"
            text="Marcar como completada"
            class="text-none"
            :loading="changingStatus"
            @click="changeStatus('delivered')"
          />
        </VCol>
        <VCol
          cols="12"
          class="pb-0 pt-2 text-body-2 text-center"
        >
          <span v-if="isOpen && answer.status === 'pending'">No se pueden entregar trabajos después de la fecha de entrega.</span>
          <span v-else-if="!isOpen && answer.status === 'evaluated'">La tarea ha sido evaluada, ya no se pueden realizar entregas.</span>
          <span v-else>La entrega de tareas está desactivada.</span>
        </VCol>
      </template>
    </VRow>
  </VCard>
</template>
