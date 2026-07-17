<script setup lang="ts">
import { requiredValidator } from '@/@core/utils/validators'
import AddEvidence from '@/components/resources/AddEvidence.vue'
import { uid } from 'uid'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'
import ModalBasic from '@/common/components/Modal.vue'
import { ToastService } from '@/common/util/toast.service'
import ResourceItem from '@/components/resources/ResourceItem.vue'
import type { ContentDetailForTeacher, CourseContentCreate, CourseContentLink, DateContentForm, LoadingsContentForm } from '@/models/content'
import type { CourseContentResource } from '@/models/courses'
import type { GetEvaluationGroup } from '@/models/evaluation-group'
import { FormEvaluationBuild } from '@/models/evalution-form'
import type { FileResource } from '@/models/forum'
import { ContentService } from '@/services/content.service'
import { EvaluationGroupService } from '@/services/evaluation-group.service'
import { FileService } from '@/services/file.service'
import { LinkService } from '@/services/link.service'
import { CHUNK_SIZE, chunkFile } from '@/utils/file-utils'
// Initial
const props = withDefaults(
  defineProps<{
    classroomId: number
    groupId: number
    contentId: number | null
    contentDetail?: ContentDetailForTeacher
    show: boolean
  }>(), 
  {
    show: false,
  },
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'updateContent', content: ContentDetailForTeacher): void
  (e: 'updateLinks', links: Array<CourseContentLink>): void
  (e: 'deleteLink', id: number): void
  (e: 'updateFiles', files: Array<CourseContentResource>): void
  (e: 'deleteFile', id: number): void
  (e: 'updateWindow'): void
}>()

// Form
const formRef = ref<HTMLFormElement | null>()

// Quill
const quillToolbar = [[{ size: ['small', false, 'large', 'huge'] }], ['bold', 'italic'], [{ list: 'bullet' }, { list: 'ordered' }]]

// Loading
const loadingParams = ref<boolean>(false)
const loadingContent = ref<boolean>(false)

const loadingUpload = ref<LoadingsContentForm>({
  uploadContent: false,
  uploadFiles: false,
  deleteFiles: false,
  uploadLinks: false,
  deleteLinks: false,
})

// Files
const existingFiles = ref<CourseContentResource[]>([])

const newFiles = ref<{
  file: FileResource
  progress: number | undefined
}[]>([])

const deleteFileIds: number[] = []

const existingLinks = ref<Array<CourseContentLink>>([])
const newLinks = ref<Array<CourseContentLink>>([])
const deleteLinkIds: number[] = []

// Variables
const hasCompetencies = ref<boolean>(false)
const evaluations = ref< Array<GetEvaluationGroup>>([])
const openModalEvaluationForm = ref(false)
const formEvaluationModified = ref<boolean>(false)
const contentCreateForm = ref<CourseContentCreate>({
  content_group_id: props.groupId,
  evaluation_group_id: null,
  title: '',
  description: '',
  type: 'content',
  date_limit: '',
  score: 20,
  is_active: 1,
  has_evaluation_form: false,
  form: null,
})

const dateStart = ref<DateContentForm>({
  date: '',
  time: '',
})

const dateLimit = ref<DateContentForm>({
  date: '',
  time: '',
})

// Form actions
const formatDates = () => {
  if (contentCreateForm.value && contentCreateForm.value.date_limit && contentCreateForm.value.date_limit.includes(' ')) {
    dateLimit.value.date = contentCreateForm.value.date_limit.split(' ')[0]
    dateLimit.value.time = contentCreateForm.value.date_limit.split(' ')[1]
  }

  if (contentCreateForm.value && contentCreateForm.value.date_start && contentCreateForm.value.date_start.includes(' ')) {
    dateStart.value.date = contentCreateForm.value.date_start.split(' ')[0]
    dateStart.value.time = contentCreateForm.value.date_start.split(' ')[1]
  }
}

const clearForm = () => {
  contentCreateForm.value = {
    content_group_id: null,
    evaluation_group_id: null,
    title: '',
    description: '',
    type: 'content',
    date_limit: '',
    score: 20,
    is_active: 1,
    has_evaluation_form: false,
    form: null,
  }

  dateStart.value.date = ''
  dateStart.value.time = ''

  dateLimit.value.date = ''
  dateLimit.value.time = ''

  existingFiles.value = []
  newFiles.value = []

  existingLinks.value = []
  newLinks.value = []

  formEvaluationModified.value = false
}

const completeForm = (contentDetail: ContentDetailForTeacher) => {
  contentCreateForm.value = {
    content_group_id: contentDetail.content_group_id,
    evaluation_group_id: contentDetail.evaluation_group_id,
    title: contentDetail.title,
    description: contentDetail.description,
    type: contentDetail.type,
    date_limit: contentDetail.date_limit,
    score: contentDetail.score,
    is_active: contentDetail.is_visible,
    date_start: contentDetail.date_start,
    has_evaluation_form: contentDetail.has_evaluation_form,
    form: contentDetail.form,
  }

  existingFiles.value = contentDetail.files
  existingLinks.value = contentDetail.links
  formatDates()
}

const setup = async () => {
  await getEvaluationGroups()
  if (props.contentId !== null) {
    loadingContent.value = true
    if (props.contentDetail) {
      completeForm(props.contentDetail)
      hasCompetencies.value = props.contentDetail.hasCompetencies
      loadingContent.value = false
    } else {
      ContentService.getContentDetailForTeacher(props.contentId).then(response => {
        completeForm(response.data)
        hasCompetencies.value = response.data.hasCompetencies
      }).catch(error => {
        ToastService.error(error)
      }).finally(() => {
        loadingContent.value = false
      })
    }
  }
  else {
    contentCreateForm.value.content_group_id = props.groupId
    hasCompetencies.value = evaluations.value.length > 0
  }
}

const getEvaluationGroups = async () => {
  loadingParams.value = true
  await EvaluationGroupService.getEvaluationGroupList(props.classroomId).then(response => {
    evaluations.value = response.data
  }).catch(error => {
    ToastService.error(error)
  }).finally(() => {
    loadingParams.value = false
  })
}

// File actions
const addFile = async (event: any) => {
  for (let i = 0; i < event.target.files.length; i++) {
    const file = event.target.files[i]

    const extension = file.name.split('.').pop()
    if (!extension)
      return

    // if (!isExtensionPermitted(extension, session)) {
    //   await allowedExtensionsMessage(file.name)

    //   return
    // }

    const newEvidenceFile: CourseContentResource = {
      id: newFiles.value.length + 1,
      uuid: uid(16),
      url: URL.createObjectURL(file),
      metadata: {
        type: file.type,
        extension,
        size: file.size,
        originalName: file.name,
        unit: 'MB',
      },
    }

    newFiles.value.push({
      file: {
        metaData: newEvidenceFile,
        file,
      },
      progress: undefined,
    })
  }
}

const deleteFile = (id: number, index: number, type: 'new' | 'existing') => {
  if (type === 'new') {
    newFiles.value.splice(index, 1)
  }
  else {
    deleteFileIds.push(id)
    existingFiles.value = existingFiles.value.filter(file => file.id !== id)
  }
}

// Link actions
const addLink = (link: string) => {
  const maxId = newLinks.value.reduce((max, current) => Math.max(max, current.id), 0)

  newLinks.value.push({
    id: maxId + 1,
    url: link,
  })
}

const deleteLink = (id: number, type: 'new' | 'existing') => {
  if (type === 'new') {
    newLinks.value = newLinks.value.filter(link => link.id !== id)
  }
  else {
    deleteLinkIds.push(id)
    existingLinks.value = existingLinks.value.filter(file => file.id !== id)
  }
}

const hideInputDontHasCriteriesForTaskAndEvaluation = computed(() => {
  return contentCreateForm.value.type !== 'content' && !hasCompetencies.value
})

// Submit form
const syncFiles = async (contentId: number) => {
  if (newFiles.value.length > 0) {
    loadingUpload.value.uploadFiles = true

    const promises: Promise<any>[] = []
    let lastData: any = null

    newFiles.value.forEach(file => {
      const chunks = chunkFile(file.file.file, CHUNK_SIZE)
      const chunkUid = uid(16)
      let countResponse = 0

      chunks.forEach((chunk, index) => {
        const promise = FileService.uploadFile({
          model: 'content',
          model_id: contentId,
          chunk,
          chunk_uid: chunkUid,
          chunk_number: index + 1,
          chunk_total: chunks.length,
          chunk_name: file.file.file.name,
        }).then(response => {
          countResponse++
          file.progress = Math.round((countResponse) / chunks.length * 100)
          if (Array.isArray(response.data)) {
            ToastService.success(`${file.file.file.name} subido correctamente`)
            lastData = response.data
          }
        }).catch(error => {
          ToastService.error(error)
          newFiles.value = newFiles.value.filter(f => f.file.metaData.uuid !== file.file.metaData.uuid)
        })

        promises.push(promise)
      })
    })

    await Promise.all(promises).then(() => {
      loadingUpload.value.uploadFiles = false
      emit('updateFiles', lastData)
      newFiles.value = []
    })
  }

  if (deleteFileIds.length > 0) {
    loadingUpload.value.deleteFiles = true
    const promises: Promise<any>[] = []

    deleteFileIds.forEach((id) => {
      const promise = FileService.deleteFile('content', id).then(() => {
        emit('deleteFile', id)
      }).catch(error => {
        ToastService.error(error)
      })

      promises.push(promise)
    })

    await Promise.all(promises).then(() => {
      loadingUpload.value.deleteFiles = false
    })
  }
}

const syncLinks = async (contentId: number) => {
  if (newLinks.value.length > 0) {
    loadingUpload.value.uploadLinks = true

    const promises: Promise<any>[] = []
    let lastData: any = null

    newLinks.value.forEach((link) => {
      const promise = LinkService.createLink({
        model: 'content',
        model_id: contentId,
        link: link.url,
      }).then(response => {
        lastData = response.data
      }).catch(error => {
        ToastService.error(error)
      })

      promises.push(promise)
    })

    await Promise.all(promises).then(() => {
      loadingUpload.value.uploadLinks = false
      emit('updateLinks', lastData)
    })
  }

  if (deleteLinkIds.length > 0) {
    loadingUpload.value.deleteLinks = true
    const promises: Promise<any>[] = []

    deleteLinkIds.forEach(id => {
      const promise = LinkService.deleteLink('content', id).then(() => {
        emit('deleteLink', id)
      }).catch(error => {
        ToastService.error(error)
      })

      promises.push(promise)
    })

    await Promise.all(promises).then(() => {
      loadingUpload.value.deleteLinks = false
    })
  }
}

const createContent = async (args: CourseContentCreate) => {
  await ContentService.createContent(args).then(async (response) => {
    emit('updateContent', response.data)
    await syncFiles(response.data.id)
    await syncLinks(response.data.id)
    emit('updateWindow')
    emit('close')
  }).catch(error => {
    ToastService.error(error)
  }).finally(() => {
    loadingUpload.value.uploadContent = false
  })
}

const updateContent = async (args: CourseContentCreate) => {
  await ContentService.updateContent(props.contentId!, args).then(async (response) => {
    emit('updateContent', response.data)
    await syncFiles(props.contentId!)
    await syncLinks(props.contentId!)
    emit('updateWindow')
    emit('close')
  }).catch(error => {
    ToastService.error(error)
  }).finally(() => {
    loadingUpload.value.uploadContent = false
  })
}

const submit = async () => {
  const { valid } = await formRef.value!.validate()
  if (!valid)
    return

  loadingUpload.value.uploadContent = true

  const args: CourseContentCreate = {
    content_group_id: contentCreateForm.value.content_group_id,
    title: contentCreateForm.value.title,
    description: contentCreateForm.value.description,
    type: contentCreateForm.value.type,
    is_active: contentCreateForm.value.is_active,
    has_evaluation_form: contentCreateForm.value.has_evaluation_form,
  }

  if (contentCreateForm.value.type !== 'content') {
    args.evaluation_group_id = contentCreateForm.value.evaluation_group_id

    args.date_start = `${dateStart.value.date} ${dateStart.value.time}${dateStart.value.time.split(':').length === 2 ? ':00' : ''}`
    args.date_limit = `${dateLimit.value.date} ${dateLimit.value.time}${dateLimit.value.time.split(':').length === 2 ? ':59' : ''}`
    args.score = contentCreateForm.value.score
  }

  if(contentCreateForm.value.has_evaluation_form) {
    if(!contentCreateForm.value.form) {
      ToastService.error('Debes crear un formulario de evaluación')
      return
    }
    args.form = contentCreateForm.value.form
  }

  if (props.contentId === null)
    await createContent(args)
  else await updateContent(args)
}

const updateFormEvaluation = (formEvaluationUpdated: FormEvaluationBuild) => {
  contentCreateForm.value.form = formEvaluationUpdated
  formEvaluationModified.value = true
}

const closeModalEvaluationForm = () => {
  openModalEvaluationForm.value = false
  if(!contentCreateForm.value.form) {
    contentCreateForm.value.has_evaluation_form = false
  }
}

// Computed
const loadingSubmit = computed(() => {
  return loadingUpload.value.uploadContent || loadingUpload.value.uploadFiles || loadingUpload.value.deleteFiles || loadingUpload.value.uploadLinks || loadingUpload.value.deleteLinks
})

// Watchers
watch(() => props.show, () => {
  if (props.show)
    setup()
  else clearForm()
})

watch(() => contentCreateForm.value.has_evaluation_form, (newValue) => {
  if (newValue && !contentCreateForm.value.form) openModalEvaluationForm.value = true
})
</script>

<template>
  <ModalBasic
    :visible="props.show"
    is-persistent
    width="1000"
  >
    <VCard>
      <VToolbar>
        <VToolbarTitle> {{ contentId === null ? 'Creación' : 'Edición' }} de contenido</VToolbarTitle>
        <VSpacer />
        <VBtn
          icon
          @click="emit('close')"
        >
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VToolbar>
      <VForm
        ref="formRef"
        class="w-100"
        @submit.prevent="submit"
      >
        <VCardText class="px-4 pb-4 custom-form">
          <VRow v-if="loadingParams || loadingContent">
            <VCol cols="12">
              <VSkeletonLoader type="list-item-three-line,list-item-three-line,list-item-three-line,list-item-three-line" />
            </VCol>
          </VRow>
          <VRow v-else>
            <VCol cols="12">
              <AppTextField
                v-model="contentCreateForm.title"
                :disabled="loadingSubmit"
                label="Título"
                placeholder="Título del contenido"
                prepend-inner-icon="tabler-letter-case"
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol cols="12">
              <AppSelect
                v-model="contentCreateForm.type"
                item-value="value"
                item-title="text"
                :disabled="loadingSubmit"
                label="Tipo de contenido"
                :items="[
                  { text: 'Contenido', value: 'content' },
                  { text: 'Tarea', value: 'task' },
                  { text: 'Evaluación', value: 'evaluation' },
                ]"
                :rules="[requiredValidator]"
              />
            </VCol>
            <template v-if="contentCreateForm.type !== 'content'">
              <template v-if="!hasCompetencies">
                <VCol cols="12">
                  <VAlert
                    color="light-warning"
                    class="text-warning"
                  >
                    <span class="text-lg font-weight-medium">
                      Aún no registras tus competencias
                    </span>
                    <p class="mb-2">
                      Antes de registrar una tarea o evaluación asegurate de crear tus competencias o
                      criterios de evalución para el curso.
                    </p>
                    <p class="font-weight-semibold">
                      Puedes hacerlo en la pestaña de <strong class="font-weight-bold">competencias</strong>
                    </p>
                  </VAlert>
                </VCol>
              </template>
              <template v-if="!hideInputDontHasCriteriesForTaskAndEvaluation">
                <VCol cols="6">
                  <AppSelect
                    v-model="contentCreateForm.evaluation_group_id"
                    item-value="id"
                    item-title="title"
                    label="Grupo de evaluación"
                    :disabled="loadingSubmit"
                    :items="evaluations"
                    theme="success"
                  />
                </VCol>
                <VCol cols="6">
                  <AppTextField
                    v-model="contentCreateForm.score"
                    label="Nota máxima"
                    :disabled="loadingSubmit"
                    placeholder="Nota máxima"
                    :rules="[requiredValidator]"
                    prepend-inner-icon="tabler-number"
                    type="number"
                  />
                </VCol>
                <VCol cols="12">
                  <VRow>
                    <VCol
                      cols="6"
                      style="position: relative;"
                    >
                      <AppDateTimePicker
                        v-model="dateStart.date"
                        label="Fecha de inicio"
                        prepend-inner-icon="tabler-calendar-event"
                      />
                      <div
                        v-if="loadingSubmit"
                        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #ffff; opacity: 0.5;"
                      />
                    </VCol>
                    <VCol
                      cols="6"
                      style="position: relative;"
                    >
                      <AppTimePicker
                        v-model="dateStart.time"
                        label="Hora de inicio"
                        prepend-inner-icon="tabler-clock"
                        :config="{ enableTime: true, noCalendar: true, dateFormat: 'H:i' }"
                      />
                      <div
                        v-if="loadingSubmit"
                        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #ffff; opacity: 0.5;"
                      />
                    </VCol>
                  </VRow>
                </VCol>
                <VCol cols="12">
                  <VRow>
                    <VCol
                      cols="6"
                      style="position: relative;"
                    >
                      <AppDateTimePicker
                        v-model="dateLimit.date"
                        label="Fecha límite"
                        prepend-inner-icon="tabler-calendar-event"
                      />
                      <div
                        v-if="loadingSubmit"
                        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #ffff; opacity: 0.5;"
                      />
                    </VCol>
                    <VCol
                      cols="6"
                      style="position: relative;"
                    >
                      <AppTimePicker
                        v-model="dateLimit.time"
                        label="Hora de límite"
                        prepend-inner-icon="tabler-clock"
                        :config="{ enableTime: true, noCalendar: true, dateFormat: 'H:i' }"
                      />
                      <div
                        v-if="loadingSubmit"
                        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #ffff; opacity: 0.5;"
                      />
                    </VCol>
                  </VRow>
                </VCol>
              </template>
            </template>

            <VCol cols="12">
              <QuillEditor
                v-model:content="contentCreateForm.description"
                theme="snow"
                :toolbar="quillToolbar"
                style=" height: 80px;min-height: 5rem !important;"
                content-type="html"
                placeholder="Descripción..."
              />
              <div
                v-if="loadingSubmit"
                style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #ffff; opacity: 0.5;"
              />
            </VCol>
            <VCol cols="12">
              <VRow>
                <VCol
                  cols="12"
                  class=""
                >
                  <div class="text-body-2">
                    Recursos
                  </div>
                </VCol>
                <VCol
                  v-for="(resource, index) in existingFiles"
                  :key="resource.id"
                  cols="12"
                  md="4"
                  sm="6"
                  class="pt-0 pb-2"
                >
                  <ResourceItem
                    :content-resource="resource"
                    :disabled="loadingSubmit"
                    removable
                    @remove="deleteFile($event, index, 'existing')"
                  />
                </VCol>
                <VCol
                  v-for="(link) in existingLinks"
                  :key="link.id"
                  cols="12"
                  md="4"
                  sm="6"
                  class="pt-0 pb-2"
                >
                  <LinkItem
                    :content-link="link"
                    :disabled="loadingSubmit"
                    removable
                    @remove="deleteLink($event, 'existing')"
                  />
                </VCol>
                <VCol
                  v-for="(resource, index) in newFiles"
                  :key="index"
                  cols="12"
                  md="4"
                  sm="6"
                  class="pt-0 pb-2"
                >
                  <ResourceItem
                    :content-resource="resource.file.metaData"
                    :progress="resource.progress"
                    :disabled="loadingSubmit"
                    removable
                    @remove="deleteFile($event, index, 'new')"
                  />
                </VCol>
                <VCol
                  v-for="(link) in newLinks"
                  :key="link.id"
                  cols="12"
                  md="4"
                  sm="6"
                  class="pt-0 pb-2"
                >
                  <LinkItem
                    :content-link="link"
                    :disabled="loadingSubmit"
                    removable
                    @remove="deleteLink($event, 'new')"
                  />
                </VCol>
                <VCol
                  cols="12"
                  md="4"
                  sm="6"
                  class="pt-0 pb-2 d-flex justify-center align-center"
                  style="min-height: 60.4px;"
                >
                  <AddEvidence
                    :disabled="loadingSubmit"
                    style="min-height: 60.4px;"
                    @add-files="addFile"
                    @add-link="addLink"
                  >
                    <VIcon icon="tabler-plus" />
                  </AddEvidence>
                </VCol>
              </VRow>
            </VCol>
          </VRow>
          <VRow class="py-2" v-if="contentCreateForm.type === 'evaluation'">
            <VCol cols="12" class="d-flex justify-space-between align-center">
              <v-checkbox
                v-model="contentCreateForm.has_evaluation_form"
                color="primary"
                hide-details
                :disabled="loadingSubmit"
              >
                <template v-slot:label>
                  <span class="text-primary">Quiero crear una evaluación de respuesta automática</span>
                </template>
              </v-checkbox>
              <VBtn 
                v-if="contentCreateForm.has_evaluation_form && contentCreateForm.form"
                text="Editar fomulario"
                color="primary"
                variant="tonal"
                prepend-inner-icon="tabler-edit"
                size="small"
                :disabled="loadingSubmit"
                @click="openModalEvaluationForm = true"
              />
            </VCol>
          </VRow>
        </VCardText>
        <VCardActions v-if="!loadingParams && !loadingContent">
          <VRow>
            <VCol v-if="formEvaluationModified" cols="12">
              <VAlert
                color="light-warning"
                class="text-warning d-flex w-100 py-2 "
              >
                <p class="my-0">
                  Si cierras esta ventana sin guardar los cambios, perderás los cambios realizados en el formulario de evaluación.
                </p>
              </VAlert>
            </VCol>
            <VCol cols="12" class="d-flex justify-end">
              <VBtn
                class="px-4"
                color="primary"
                variant="outlined"
                :disabled="loadingSubmit"
                @click="emit('close')"
              >
                Cancelar
              </VBtn>
              <VBtn
                class="px-4"
                color="primary"
                text="Guardar"
                :loading="loadingSubmit"
                :disabled="hideInputDontHasCriteriesForTaskAndEvaluation"
                variant="flat"
                type="submit"
              />
            </VCol>
          </VRow>
        </VCardActions>
      </VForm>
    </VCard>
  </ModalBasic>
  
  <ModalEvaluationForm 
    v-if="openModalEvaluationForm && contentCreateForm.type === 'evaluation'"
    :content-id="contentId"
    :show="openModalEvaluationForm"
    :form-evaluation="contentCreateForm.form"
    :content_score_max="Number(contentCreateForm.score!)"
    @update:content_score_max="contentCreateForm.score = $event"
    @save="updateFormEvaluation($event)"
    @close="closeModalEvaluationForm()"
  />
</template>

<style scoped>
  .custom-form {
    max-block-size: 70vh;
    overflow-y: auto;
  }

  /* Customize the scrollbar */
  .custom-form::-webkit-scrollbar {
    inline-size: 4px;
  }

  .custom-form::-webkit-scrollbar-track {
    background-color: #f1f1f1;
  }

  .custom-form::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color: #afafaf;
  }

  .custom-form::-webkit-scrollbar-thumb:hover {
    background-color: #8f8f8f;
  }
  </style>
