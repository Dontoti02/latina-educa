<!-- eslint-disable indent -->
<script setup lang="ts">
import { requiredValidator } from '@/@core/utils/validators'
import { SessionStore } from '@/common/store'
import emitter from '@/common/util/emitter.service'
import modalService from '@/common/util/modal.service'
import { ToastService } from '@/common/util/toast.service'
import CreateContentModal from '@/components/courses/teacher-panels/modals/CreateContentModal.vue'
import type { ContentItem, CourseContentGroup, CourseContentResource, Syllabus } from '@/models/courses'
import { ContentGroupService } from '@/services/content-group.service'
import { ContentService } from '@/services/content.service'
import { FileService } from '@/services/file.service'
import { CHUNK_SIZE, chunkFile, downloadFile } from '@/utils/file-utils'
import { uid } from 'uid'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'
import CourseContentItem from '../content/CourseContentItem.vue'

// Initial
const props = defineProps<{
  classroomId: number
  contentId: number | null
}>()

const emit = defineEmits<{
  (e: 'selected', args: { id: number; typeSubPage: 'content-detail' | 'evaluations' }): void
  (e: 'evaluateContent'): void
}>()

// Variables
const session = SessionStore()
const fileInput = ref<HTMLInputElement | null>(null)
const filters = ref<Array<string>>(['syllabus', 'content', 'evaluation', 'task'])

const loading = ref(false)
const loadingFile = ref(false)
const loadingDownload = ref(false)
const loadingIsVisibleId = ref<number | null>(null)
const loadingIsOpenId = ref<number | null>(null)
const loadingDelete = ref<number | null>(null)

const newFile = ref<{
  file: CourseContentResource
  progress: number
} | null>(null)

const itemSelected = ref<ContentItem | null>(null)

// Modals
const openCreateContentModal = ref(false)
const groupContentSelected = ref<number>(0)

// Data
const syllabus = ref<Syllabus>()
const contentGroups = ref<Array<CourseContentGroup> | null>(null)
const contentGroupsFiltered = ref<Array<CourseContentGroup> | null>(null)

const getContentGroups = () => {
  loading.value = true
  ContentService.getContentList(props.classroomId)
    .then(response => {
      syllabus.value = response.data.syllabus

      if (props.contentId !== null) {
        const content = response.data.content_groups.flatMap(group => group.contents).find(content => content.id === props.contentId)
        if (content !== undefined)
          emit('selected', { id: content.id, typeSubPage: 'content-detail' })
      }

      contentGroups.value = null
      contentGroups.value = response.data.content_groups
      contentGroupsFiltered.value = response.data.content_groups.map(group => {
        return {
          ...group,
          contents: group.contents.filter(content => filters.value.includes(content.type)),
        }
      })
    })
    .catch(error => {
      console.error(error)
    }).finally(() => {
      loading.value = false
    })
}

// Mounted
onBeforeMount(() => {
  getContentGroups()
})

onMounted(() => {
  emitter.on('updateListContent', () => {
    getContentGroups()
  })
})

// Filters
const realoadFiltered = () => {
  if (contentGroups.value === null)
    return

  contentGroupsFiltered.value = contentGroups.value.map(group => {
    return {
      ...group,
      contents: group.contents.filter(content => filters.value.includes(content.type)),
    }
  })
}

watch(filters, (newValue, oldValue) => {
  if (newValue.length === 0)
    filters.value = oldValue

  realoadFiltered()
})

// Content Item Actions
const deleteContent = async (contentId: number) => {
  const confirm = await modalService.confirmation({
    title: 'Eliminación de contenido',
    content: '¿Estás seguro de que deseas eliminar este contenido?',
  })
  
  loadingDelete.value = contentId
  if (confirm) {
    ContentService.deleteContent(contentId)
      .then(() => {
        ToastService.success('Contenido eliminado correctamente')
        getContentGroups()
      })
      .catch(error => ToastService.error(error))
      .finally(() => {
        loadingDelete.value = null
      })
  }
}

const contentItemActions = (event: { action: string; contentGroupId: number ; contentId: number }) => {
  if (event.action === 'evaluate') {
    emit('selected', { id: event.contentId, typeSubPage: 'evaluations' })
  }
  else if (event.action === 'create') {
    itemSelected.value = null
    groupContentSelected.value = event.contentGroupId
    openCreateContentModal.value = true
  }
  else if (event.action === 'edit') {
    groupContentSelected.value = event.contentGroupId
    itemSelected.value = contentGroups.value!.find(group => group.id === event.contentGroupId)?.contents.find(content => content.id === event.contentId) || null
    openCreateContentModal.value = true
  }
  else if (event.action === 'delete') {
    deleteContent(event.contentId)
  } 
  else if (event.action === 'toggleOpen') {
    loadingIsOpenId.value = event.contentId
    ContentService.toggleOpenContent(event.contentId).then(() => {
      const content = contentGroups.value!.find(group => group.id === event.contentGroupId)?.contents.find(content => content.id === event.contentId)
      if (content !== undefined)
        content.is_open = !content.is_open
    }).catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loadingIsOpenId.value = null
    })
  } 
  else if (event.action === 'toggleVisible') {
    loadingIsVisibleId.value = event.contentId
    ContentService.toggleVisibleContent(event.contentId).then(() => {
      const content = contentGroups.value!.find(group => group.id === event.contentGroupId)?.contents.find(content => content.id === event.contentId)
      if (content !== undefined)
        content.is_visible = !content.is_visible
    }).catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loadingIsVisibleId.value = null
    })
  }
}

// Create content group
const createContentGroupLoading = ref(false)

const newGroupContent = ref({
  active: false,
  title: '',
})

const createContentGroup = (title: string) => {
  if (createContentGroupLoading.value)
    return

  if (title.trim() === '') {
    newGroupContent.value = {
      active: false,
      title: '',
    }
    ToastService.error('El título del grupo de contenido no puede estar vacío')

    return
  }

  createContentGroupLoading.value = true
  ContentGroupService.createContentGroup({ title, classroom_id: props.classroomId }).then(response => {
    contentGroups.value!.push({
      id: response.data.id,
      title: response.data.title,
      contents: [],
    })

    realoadFiltered()
  }).catch(error => {
    ToastService.error(error)
  }).finally(() => {
    newGroupContent.value = {
      active: false,
      title: '',
    }
    createContentGroupLoading.value = false
  })
}

// Edit content group
const editContentGroupLoading = ref<number | null>(null)

const groupContentEdited = ref({
  id: -1,
  title: '',
})

const editContentGroup = (args: { id: number; title: string }) => {
  if (editContentGroupLoading.value !== null)
    return
  const index = contentGroups.value!.findIndex(item => item.id === args.id)

  if (contentGroups.value !== null && (contentGroups.value[index].title === args.title.trim() || args.title.trim() === '')) {
    groupContentEdited.value = {
      id: -1,
      title: '',
    }

    return
  }

  editContentGroupLoading.value = args.id

  ContentGroupService.updateContentGroup(args.id, { title: args.title }).then(response => {
    contentGroups.value![index].title = response.data.title

    realoadFiltered()
  }).catch(error => {
    ToastService.error(error)
  }).finally(() => {
    groupContentEdited.value.id = -1
    editContentGroupLoading.value = null
  })
}

// Delete content group
const deleteContentGroupLoading = ref<number | null>(null)

const deleteContentGroup = async (contentGroup: CourseContentGroup) => {
  const confirm = await modalService.confirmation({
    title: 'Eliminación de grupo de contenido',
    content: `¿Estás seguro de que deseas eliminar este grupo de contenido "${contentGroup.title}"?`,
  })

  if (confirm) {
    deleteContentGroupLoading.value = contentGroup.id

    ContentGroupService.deleteContentGroup(contentGroup.id).then(() => {
      const index = contentGroups.value!.findIndex(item => item.id === contentGroup.id)

      contentGroups.value!.splice(index, 1)

      realoadFiltered()
    }).catch(error => {
      ToastService.error(error)
    }).finally(() => {
      deleteContentGroupLoading.value = null
    })
  }
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
      const file = event.target.files[0]
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
        const promise = FileService.uploadFile({
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

        promises.push(promise)
      })

      await Promise.all(promises).then(() => {
        newFile.value = null
        loadingFile.value = false
        if(lastData)
          syllabus.value!.files = lastData

        if (fileInput.value)
          fileInput.value.value = ''
      })
    }
  }
}

const deleteFile = (id: number) => {
  loadingFile.value = true
  FileService.deleteFile('content_group', id).then(() => {
    syllabus.value!.files = syllabus.value!.files.filter(file => file.id !== id)
  }).catch(error => {
    ToastService.error(error)
  }).finally(() => {
    loadingFile.value = false
  })
}

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
  <div>
    <div v-if="loading || contentGroups === null || contentGroupsFiltered === null">
      <VRow>
        <VCol cols="12">
          <VSkeletonLoader type="list-item-three-line,list-item-three-line,list-item-three-line" />
        </VCol>
      </VRow>
    </div>
    <div v-else>
      <VRow
        class="mb-4 mt-4"
        justify="space-between"
      >
        <VCol
          cols="12"
          md="6"
          class="py-4"
        >
          <DownloadReportBtn
            text="Exportar contenido"
            variant="outlined"
            :loading="loadingDownload"
            @download="downloadList"
          />
        </VCol>
        <VCol
          cols="12"
          md="6"
          lg="4"
          class="d-flex justify-end py-0"
        >
          <VSelect
            v-model="filters"
            item-value="value"
            item-title="text"
            label="Tipo de contenido"
            name="select"
            density="comfortable"
            multiple
            :items="[
              { text: 'Sílabo', value: 'syllabus' },
              { text: 'Contenido', value: 'content' },
              { text: 'Tarea', value: 'task' },
              { text: 'Evaluación', value: 'evaluation' },
            ]"
            :rules="[requiredValidator]"
          />
        </VCol>
      </VRow>
      <VExpansionPanels multiple>
        <VExpansionPanel v-if="syllabus !== undefined && filters.includes('syllabus')">
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
              </VCol>
            </VRow>
          </VExpansionPanelText>
        </VExpansionPanel>
        <VExpansionPanel
          v-for="contentGroup in contentGroupsFiltered"
          :key="contentGroup.id"
        >
          <VExpansionPanelTitle>
            <div
              v-if="groupContentEdited.id === -1 || groupContentEdited.id !== contentGroup.id"
              class="d-flex align-center gap-3"
            >
              <h3>{{ contentGroup.title }}</h3>
              <div
                v-if="deleteContentGroupLoading !== contentGroup.id"
                class="d-flex gap-1"
              >
                <VBtn
                  icon="tabler-edit"
                  variant="plain"
                  density="compact"
                  size="sm"
                  :disabled="(groupContentEdited.id !== -1) || createContentGroupLoading || (deleteContentGroupLoading !== null)"
                  @click.stop="groupContentEdited = { id: contentGroup.id, title: contentGroup.title }"
                />
                <VBtn
                  icon="tabler-trash"
                  variant="plain"
                  color="error"
                  density="compact"
                  size="sm"
                  :disabled="(groupContentEdited.id !== -1) || createContentGroupLoading || (deleteContentGroupLoading !== null)"
                  @click.stop="deleteContentGroup(contentGroup)"
                />
              </div>
              <VProgressCircular
                v-else
                color="primary"
                size="15"
                indeterminate
              />
            </div>
            <template v-else>
              <div class="w-25">
                <VTextField
                  v-model="groupContentEdited.title"
                  label="Título del grupo de contenido"
                  density="compact"
                  autofocus
                  variant="underlined"
                  class="text-body-2"
                  :disabled="editContentGroupLoading !== null"
                  :rules="[requiredValidator]"
                  @click.stop=""
                  @blur="editContentGroup({ id: groupContentEdited.id, title: groupContentEdited.title })"
                  @keyup.enter="editContentGroup({ id: groupContentEdited.id, title: groupContentEdited.title })"
                />
              </div>
              <VProgressCircular
                v-if="editContentGroupLoading === contentGroup.id"
                color="primary"
                class="ml-2"
                indeterminate
              />
            </template>
          </VExpansionPanelTitle>
          <VExpansionPanelText class="pt-4">
            <CourseContentItem
              v-for="(item) in contentGroup.contents"
              :key="item.id"
              :content-group-id="contentGroup.id"
              :content-item="item"
              :loading-is-open="loadingIsOpenId === item.id"
              :loading-is-visible="loadingIsVisibleId === item.id"
              :disabled-is-open="loadingIsOpenId !== null"
              :disabled-is-visible="loadingIsVisibleId !== null"
              :loading-delete="loadingDelete === item.id"
              :disabled-delete="loadingDelete !== null"
              @selected="($event) => emit('selected', $event)"
              @action="contentItemActions($event)"
            />
            <div class="d-flex justify-center w-100% mt-2">
              <VBtn
                icon="tabler-plus"
                variant="tonal"
                color="primary"
                density="comfortable"
                @click="contentItemActions({ action: 'create', contentGroupId: contentGroup.id, contentId: 0 })"
              />
            </div>
          </VExpansionPanelText>
        </VExpansionPanel>
        <VExpansionPanel v-if="newGroupContent.active">
          <VExpansionPanelTitle>
            <div class="w-25 ">
              <VTextField
                v-model="newGroupContent.title"
                label="Título del grupo de contenido"
                density="compact"
                autofocus
                variant="underlined"
                class="text-body-2"
                :disabled="createContentGroupLoading"
                :rules="[requiredValidator]"
                @click.stop=""
                @blur="createContentGroup(newGroupContent.title)"
                @keyup.enter="createContentGroup(newGroupContent.title)"
              />
            </div>
            <VProgressCircular
              v-if="createContentGroupLoading"
              color="primary"
              class="ml-2"
              indeterminate
            />
          </VExpansionPanelTitle>
        </VExpansionPanel>
      </VExpansionPanels>
      <div class="d-flex justify-center w-100% mt-4">
        <VBtn
          class="text-none"
          prepend-icon="tabler-plus"
          variant="tonal"
          color="primary"
          text="Agregar nueva sección"
          @click="newGroupContent.active = true"
        />
      </div>
    </div>
    <CreateContentModal
      v-if="contentGroups !== null && contentGroupsFiltered !== null"
      :classroom-id="classroomId"
      :show="openCreateContentModal"
      :content-id="itemSelected?.id ?? null"
      :group-id="groupContentSelected"
      @close="openCreateContentModal = false"
      @update-window="getContentGroups"
    />
  </div>
</template>
