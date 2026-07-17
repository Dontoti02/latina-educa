<script setup lang="ts">
import { ToastService } from '@/common/util/toast.service'
import type { CourseContentGroup, Syllabus } from '@/models/courses'
import { ContentService } from '@/services/content.service'
import { downloadFile } from '@/utils/file-utils'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'
import CourseContentItem from '../content/CourseContentItem.vue'

// Initial
const props = defineProps<{
  classroomId: number
  contentId: number | null
}>()

const emit = defineEmits<{
  (e: 'selected', args: { id: number; typeSubPage: 'content-detail' | 'evaluations' }): void
}>()

const loadingDownload = ref(false)

// Data
const syllabus = ref<Syllabus>()
const contentGroups = ref<Array<CourseContentGroup> | null>(null)

const getCourseList = () => {
  ContentService.getContentList(props.classroomId)
    .then(response => {
      syllabus.value = response.data.syllabus

      if (props.contentId) {
        const contentGroup = response.data.content_groups.find(group => group.contents.some(content => content.id === props.contentId))
        if (contentGroup) {
          emit('selected', { id: props.contentId, typeSubPage: 'content-detail' })
        }
      }

      contentGroups.value = response.data.content_groups
    })
    .catch(error => {
      console.error(error)
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
              <ResourceItem :content-resource="resource" />
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
