<script setup lang="ts">
import { ToastService } from '@/common/util/toast.service'
import type { CapacitationContentDetailForStudent, ContentDetailForStudent } from '@/models/content'
import { DateFormatting } from '@/utils/date-formatting'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'
import ResourceItem from '../../resources/ResourceItem.vue'
import AddComments from './partials/AddComments.vue'
import CommentsList from './partials/CommentsList.vue'
import TaskEvidence from './partials/TaskEvidence.vue'
import { CapacitationContentService } from '@/services/capacitation-content.service'
import { CommentService } from '@/services/comment.service'

// Inital
const props = defineProps<{
  contentId: number
}>()

const emit = defineEmits<{
  (e: 'toBack'): void
}>()

const sendingComment = ref<boolean>(false)

// Data
const contentDetail = ref<CapacitationContentDetailForStudent | null>(null)

const getContentDetail = async () => {
  CapacitationContentService.getContentDetailForStudent(props.contentId)
    .then(response => {
      contentDetail.value = response.data
    })
    .catch(error => {
      ToastService.error(error)
      emit('toBack')
    })
}

onBeforeMount(() => {
  getContentDetail()
})

// Task Actions
const updateEvidenceFiles = (files: ContentDetailForStudent['answer']['files']) => {
  contentDetail.value!.answer.files = files
}

const removeEvidenceResource = (id: number) => {
  if (contentDetail.value && contentDetail.value.answer)
    contentDetail.value.answer.files = contentDetail.value.answer.files.filter(resource => resource.id !== id)
}

const updateEvidenceLinks = (links: ContentDetailForStudent['answer']['links']) => {
  contentDetail.value!.answer.links = links
}

const removeEvidenceLink = (id: number) => {
  if (contentDetail.value && contentDetail.value.answer)
    contentDetail.value.answer.links = contentDetail.value.answer.links.filter(resource => resource.id !== id)
}

// Comments Actions
const addComment = (comment: string) => {
  sendingComment.value = true
  CommentService.addCapacitationComment({ model: 'training_content', model_id: props.contentId, comment })
    .then(response => {
      contentDetail.value!.comments.push(response.data)
      ToastService.success('Comentario agregado')
    })
    .catch(error => {
      ToastService.error(error)
    }).finally(() => {
      sendingComment.value = false
    })
}

// Computed
const publicationDate = computed(() => {
  return DateFormatting.formatDayOfMonth(new Date(contentDetail.value!.date))
})

const initDate = computed(() => {
  return DateFormatting.formatDayOfMonth(new Date(contentDetail.value!.date_start!))
})

const finishDate = computed(() => {
  return DateFormatting.formatDayOfMonth(new Date(contentDetail.value!.date_limit!))
})
</script>

<template>
  <VRow v-if="contentDetail === null">
    <VCol cols="12">
      <VSkeletonLoader type="list-item,list-item-three-line,list-item-three-line,list-item-three-line,list-item-three-line" />
    </VCol>
  </VRow>
  <VCard
    v-else
    class="px-6 py-6"
  >
    <VRow>
      <VCol
        cols="12"
        :lg="contentDetail.type !== 'content' ? 9 : 12"
      >
        <VCard
          class=""
          variant="text"
        >
          <div class="pb-4">
            <div class="d-flex align-center mb-1">
              <VBtn
                variant="tonal"
                icon="tabler-chevron-left"
                class="mr-2"
                density="compact"
                rounded="sm"
                @click="emit('toBack')"
              />
              <div class="text-h4">
                {{ contentDetail.title }}
              </div>
            </div>
            <template
              v-if="contentDetail.type === 'content'"
            >
              <div class="text-body-2">
                Fecha de publicación: {{ publicationDate }}
              </div>
            </template>
            <template v-else>
              <div class="text-body-2" v-if="contentDetail.date_start!=null">
                Fecha de inicio: {{ initDate }}
              </div>
              <div
                class="text-body-2  d-flex w-100 justify-space-between"
              >
                <div class="font-weight-bold">
                  Fecha de entrega: {{ finishDate }}
                </div>
                <div>
                  <span
                    v-if="contentDetail.answer.status !== 'evaluated'"
                    class="font-weight-bold"
                  >{{ contentDetail.score }} puntos</span>
                  <span v-else><span class="font-weight-bold">{{ contentDetail.answer.score }}</span>/{{ contentDetail.score }}</span>
                </div>
              </div>
            </template>
          </div>
          <VDivider />
          <div
            class="pt-2 ql-editor"
            v-html="contentDetail.description"
          />
          <VRow class="my-2 mx-1">
            <VCol
              v-for="contentResource in contentDetail.files"
              :key="contentResource.id"
              cols="6"
              lg="3"
              sm="4"
            >
              <ResourceItem :content-resource="contentResource" />
            </VCol>
            <VCol
              v-for="link in contentDetail.links"
              :key="link.id"
              cols="6"
              lg="3"
              sm="4"
            >
              <LinkItem :content-link="link" />
            </VCol>
          </VRow>
          <VRow class="px-0 py-2">
            <VCol
              cols="12"
              class="px-0"
            >
              <CommentsList :comments="contentDetail.comments" />
            </VCol>
          </VRow>
        </VCard>
      </VCol>
      <VCol
        v-if="contentDetail.type !== 'content'"
        cols="12"
        lg="3"
      >
        <TaskEvidence
          :content-id="props.contentId"
          :is-open="contentDetail.is_open"
          :answer="contentDetail.answer"
          :form-uuid="contentDetail.form_uuid"
          @update-files-answer="updateEvidenceFiles($event)"
          @update-links-answer="updateEvidenceLinks($event)"
          @remove-resource="removeEvidenceResource($event)"
          @change-status="contentDetail!.answer.status = $event"
          @remove-link="removeEvidenceLink"
        />
        <AddComments
          :loading="sendingComment"
          @add-comment="addComment($event)"
        />
      </VCol>
    </VRow>
  </VCard>
</template>
