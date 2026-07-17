<script setup lang="ts">
import { SessionStore } from '@/common/store'
import { ToastService } from '@/common/util/toast.service'
import CourseContentItem from '@/components/courses/content/CourseContentItem.vue'
import type { CourseContentGroup, CourseContentResource, Syllabus } from '@/models/courses'
import { ContentService } from '@/services/content.service'
import { FileService } from '@/services/file.service'
import { CHUNK_SIZE, chunkFile, downloadFile } from '@/utils/file-utils'
import { uid } from 'uid'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'

// Initial
const props = defineProps<{
  classroomId: number
}>()

const emit = defineEmits<{
  (e: 'selected', args: { id: number; typeSubPage: 'content-detail' | 'evaluations' }): void
}>()

const session = SessionStore()
const fileInput = ref<HTMLInputElement | null>(null)
const loadingFile = ref(false)
const loadingDownload = ref(false)

const newFile = ref<{
  file: CourseContentResource
  progress: number
} | null>(null)

// Data
const syllabus = ref<Syllabus>()
const contentGroups = ref<Array<CourseContentGroup> | null>(null)

const getCourseList = () => {
  ContentService.getContentList(props.classroomId)
    .then(response => {
      syllabus.value = response.data.syllabus
      contentGroups.value = response.data.content_groups
    })
    .catch(error => {
      console.error(error)
    })
}

// Syllabus
const openInputFile = () => {
  if (fileInput.value)
    fileInput.value.click()
}

const addFile = async (event: any) => {
  if (event.target.files.length > 0) {
    const user = session.get().user
    if (user !== null && session.get().user?.maximumFileSizeToUpload !== undefined) {
      // const maxSizeInBytes = user.maximumFileSizeToUpload * 1024 * 1024

      const file = event.target.files[0]
      // if (file.size > maxSizeInBytes) {
      //   ToastService.error(`El archivo ${file.name} excede el tamaño máximo permitido de ${user.maximumFileSizeToUpload} MB`)

      //   return
      // }

      newFile.value = {
        file: {
          id: 0,
          url: '',
          uuid: '',
          metadata: {
            extension: file.name.split('.').pop(),
            originalName: file.name,
            size: file.size,
            type: 'file',
            unit: 'bytes',
          },
        },
        progress: 0,
      }

      const chunks = chunkFile(file, CHUNK_SIZE)
      const chunkUid = uid(16)
      let countResponse = 0
      let lastData: any = null
      const promises: Promise<any>[] = []

      loadingFile.value = true
      chunks.forEach((chunk, index) => {
        const prommise = FileService.uploadFile({
          model_id: syllabus.value!.id,
          model: 'content_group',
          chunk,
          chunk_uid: chunkUid,
          chunk_number: index + 1,
          chunk_total: chunks.length,
          chunk_name: file.name,
        }).then(response => {
          countResponse++
          newFile.value!.progress = Math.round((countResponse) / chunks.length * 100)
          if (Array.isArray(response.data)) {
            lastData = response.data
          }
        }).catch(error => {
          console.error(error)
        })

        promises.push(prommise)
      })

      await Promise.all(promises).then(() => {
        newFile.value = null
        if(lastData)
          syllabus.value!.files = lastData
        loadingFile.value = false
        if (fileInput.value)
          fileInput.value.value = ''
      })
    }
  }
}

const deleteFile = (id: number) => {
  loadingFile.value = true
  FileService.deleteFile('content_group', id).then(() => {
    console.log(syllabus.value?.files)
    syllabus.value!.files = syllabus.value!.files.filter(file => file.id !== id)
    console.log(syllabus.value?.files)
  }).catch(error => {
    ToastService.error(error)
  }).finally(() => {
    loadingFile.value = false
  })
}

// Mounted
onBeforeMount(() => {
  getCourseList()
})

// Utils
const downloadList = async (type: 'xlsx' | 'pdf') => {
  loadingDownload.value = true
  ContentService.downloadContentList(type, props.classroomId).then(response => {
    downloadFile(response)
  }).catch(error => {
    ToastService.error(error)
  }).finally(() => {
    loadingDownload.value = false
  })
}
</script>

<template>
  <div v-if="contentGroups === null">
    <VRow>
      <VCol cols="12">
        <VSkeletonLoader type="list-item-three-line,list-item-three-line,list-item-three-line" />
      </VCol>
    </VRow>
  </div>
  <div v-else-if="contentGroups.length === 0 && syllabus === undefined">
    <VRow>
      <VCol
        cols="12"
        class="text-center"
      >
        Aún no se ha agregado contenido a esta clase.
      </VCol>
    </VRow>
  </div>
  <div v-else>
    <VRow
      class="mb-4"
      justify="space-between"
    >
      <VCol
        cols="12"
        md="6"
        class="py-0"
      >
        <DownloadReportBtn
          text="Descargar listado"
          variant="outlined"
          :loading="loadingDownload"
          @download="downloadList"
        />
      </VCol>
    </VRow>
    <VExpansionPanels multiple>
      <VExpansionPanel v-if="syllabus !== undefined">
        <VExpansionPanelTitle>
          <h3>{{ syllabus.title }}</h3>
        </VExpansionPanelTitle>
        <VExpansionPanelText class="pt-4">
          <VRow class="pt-0 pb-2 px-4">
            <VCol
              v-for="(resource) in syllabus.files"
              :key="resource.id"
              cols="12"
              md="4"
              sm="6"
            >
              <ResourceItem
                :content-resource="resource"
                :disabled="loadingFile"
                removable
                @remove="deleteFile($event)"
              />
            </VCol>
            <VCol
              v-if="newFile !== null"
              cols="12"
              md="4"
              sm="6"
            >
              <ResourceItem
                :content-resource="newFile.file"
                disabled
                :progress="newFile.progress"
                removable
              />
            </VCol>
            <VCol
              cols="12"
              md="4"
              sm="6"
              class="d-flex justify-center align-center"
              style="min-height: 60.4px;"
            >
              <VBtn
                icon="tabler-plus"
                variant="outlined"
                color="primary"
                text="Agregar recurso"
                @click="openInputFile"
              />
              <input
                ref="fileInput"
                type="file"
                style="display: none;"
                @change="addFile"
              >
              <!-- style="min-height: 60.4px;" -->
            </VCol>
          </VRow>
        </VExpansionPanelText>
      </VExpansionPanel>
      <VExpansionPanel
        v-for="contentGroup in contentGroups"
        :key="contentGroup.id"
      >
        <VExpansionPanelTitle>
          <h3>{{ contentGroup.title }}</h3>
        </VExpansionPanelTitle>
        <VExpansionPanelText class="pt-4">
          <CourseContentItem
            v-for="(item) in contentGroup.contents"
            :key="item.id"
            :content-item="item"
            :content-group-id="contentGroup.id"
            @selected="($event) => emit('selected', $event)"
          />
        </VExpansionPanelText>
      </VExpansionPanel>
    </VExpansionPanels>
  </div>
</template>
