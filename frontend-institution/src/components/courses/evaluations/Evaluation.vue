<script setup lang="ts">
import { ToastService } from '@/common/util/toast.service'
import type { GetAnswerList } from '@/models/answers'
import { AnswerService } from '@/services/answer.service'
import { EvaluationService } from '@/services/evaluation.service'
import { ImageUtils } from '@/utils/images'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'

// Inital
const props = defineProps<{
  contentId: number
}>()

const emit = defineEmits<{
  (e: 'toBack'): void
}>()

// Tabs
const currentTab = ref(0)

// Get Evaluation
const evaluationDetails = ref<GetAnswerList | null>(null)
const loadEvaluationIndexes = ref<Array<boolean>>(new Array(0).fill(false))

const getEvaluationDetails = async () => {
  AnswerService.list(props.contentId).then(response => {
    evaluationDetails.value = response.data
    loadEvaluationIndexes.value = new Array(response.data.answers.length).fill(false)
  }).catch(error => {
    ToastService.error(error)
  })
}

// Evaluation actions
const loadEvaluation = (index: number) => {
  if (evaluationDetails.value === null
    || evaluationDetails.value.answers.length <= index
    || evaluationDetails.value.answers[index].score === null
    || evaluationDetails.value.answers[index].score === ''
    || isNaN(evaluationDetails.value.answers[index].score)
    || evaluationDetails.value.answers[index].score > evaluationDetails.value.score) {
    ToastService.error('Ingrese una nota válida')

    return
  }

  if (loadEvaluationIndexes.value[index])
    return

  loadEvaluationIndexes.value[index] = true

  EvaluationService.evaluate({ answer_id: evaluationDetails.value.answers[index].id, score: evaluationDetails.value.answers[index].score })
    .then(response => {
      evaluationDetails.value!.answers[index].status = 'evaluated'
      evaluationDetails.value!.answers[index].final_note = response.data.final_note
      ToastService.success('Evaluación exitosa')
    }).catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loadEvaluationIndexes.value[index] = false
    })
}

// Mounted
onBeforeMount(() => {
  getEvaluationDetails()
})
</script>

<template>
  <VRow v-if="evaluationDetails === null">
    <VCol cols="12">
      <VSkeletonLoader type="list-item,list-item-three-line,list-item-three-line,list-item-three-line,list-item-three-line" />
    </VCol>
  </VRow>
  <VCard
    v-else
    class="px-6 py-6"
  >
    <VRow>
      <VCol cols="12">
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
                {{ evaluationDetails.title }}
              </div>
            </div>
          </div>
          <VCard variant="text">
            <div class="d-flex">
              <div 
                v-if="evaluationDetails.answers.length === 0"
                class="text-center w-100 py-4 text-h6"  
              >Ningún estudiante ha respondido aún.</div>
              <div v-else>
                <VTabs
                  v-model="currentTab"
                  direction="vertical"
                  :style="{
                    'min-width': evaluationDetails.has_evaluation_form ? '350px' : '380px',
                    'max-width': evaluationDetails.has_evaluation_form ? '400px' : '450px',
                  }"
                >
                  <VTab
                    v-for="(evaluationDetail, index) in evaluationDetails.answers"
                    :key="evaluationDetail.id"
                    class="align-end"
                  >
                    <div class="d-flex align-center gap-2">
                      <div style="overflow: hidden;max-width: 240px; text-overflow: ellipsis; white-space: nowrap;">
                        {{ evaluationDetail.person }}
                      </div>
                      <div class="d-flex align-center">
                        <div>
                          <div v-if="evaluationDetails.has_evaluation_form">
                            {{ evaluationDetail.score }}
                          </div>
                          <input
                            v-else-if="index === currentTab"
                            v-model="evaluationDetail.score"
                            class="custom-input"
                            type="number"
                            min="0"
                            :max="evaluationDetails.score"
                            :disabled="loadEvaluationIndexes[index]"
                            @blur="loadEvaluation(index)"
                            @keyup.enter="loadEvaluation(index)"
                          >
                          <div v-else>
                            {{ evaluationDetail.status !== 'evaluated' ? '_' : evaluationDetail.score }}
                          </div>
                        </div>
                        <div>/{{ evaluationDetails.score }}</div>
                        <VBtn 
                          v-if="index === currentTab && !evaluationDetails.has_evaluation_form"
                          icon="tabler-device-floppy"
                          density="compact"
                          size="small"
                          class="ml-4"
                          rounded="sm"
                          :loading="loadEvaluationIndexes[index] ? 'white' : false"
                          @click="loadEvaluation(index)"
                          />
                      </div>
                    </div>
                  </VTab>
                </VTabs>
              </div>

              <VCardText class="py-0 px-2">
                <VWindow
                  v-model="currentTab"
                  class="ms-3"
                >
                  <VWindowItem
                    v-for="evaluationDetail in evaluationDetails.answers"
                    :key="evaluationDetail.id"
                  >
                    <VRow class="my-0 mx-1">
                      <VCol
                        cols="12"
                        class="d-flex align-center"
                      >
                        <VAvatar
                          size="36"
                          class="mr-2"
                        >
                          <VImg
                            v-if="evaluationDetail.photo"
                            :src="ImageUtils.getUrlImage(evaluationDetail.photo)"
                            alt="avatar"
                          />
                          <VChip
                            v-else
                            variant="tonal"
                            class="w-100 h-100 d-flex align-center justify-center"
                            color="primary"
                          >
                            <VIcon icon="tabler-user" />
                          </VChip>
                        </VAvatar>
                        <div class="ml-2">
                          <span class="text-h5 ">{{ evaluationDetail.person }}</span>
                          &nbsp;-&nbsp;
                          <span
                            :class="{
                              'text-success': evaluationDetail.status === 'evaluated',
                              'text-warning': evaluationDetail.status !== 'evaluated',
                            }"
                          >
                            {{ evaluationDetail.status === 'evaluated' ? 'Evaluado' : 'Sin evaluar' }}
                          </span>
                        </div>
                        <div v-if="evaluationDetails.has_evaluation_form" class="ml-2">
                          <VBtn 
                            icon="tabler-external-link"
                            :to="`/evaluation-form/${evaluationDetails.form_uuid}?number=${evaluationDetail.person_id}`"
                            target="_blank"
                            variant="text"
                            density="compact"
                          />
                        </div>
                      </VCol>
                      <VCol
                        v-for="resource in evaluationDetail.files"
                        :key="resource.id"
                        cols="6"
                        lg="3"
                        sm="4"
                      >
                        <ResourceItem :content-resource="resource" />
                      </VCol>
                      <VCol
                        v-for="link in evaluationDetail.links"
                        :key="link.id"
                        cols="6"
                        lg="3"
                        sm="4"
                      >
                        <LinkItem :content-link="link" />
                      </VCol>
                      <VCol
                        v-if="evaluationDetail.files.length === 0 && evaluationDetail.links.length === 0"
                        cols="12"
                      >
                        Esta respuesta no contiene archivos adjuntos.
                      </VCol>
                      <VCol
                        cols="12"
                        class="d-flex justify-end"
                      >
                        Nota final:&nbsp;<b>{{ evaluationDetail.final_note }}</b>
                      </VCol>
                    </VRow>
                  </VWindowItem>
                </VWindow>
              </VCardText>
            </div>
          </VCard>
        </VCard>
      </VCol>
    </VRow>
  </VCard>
</template>

<style lang="css" scoped>
.custom-input {
  border: none;
  border-block-end: 2px solid rgb(var(--v-theme-primary));
  color: rgb(var(--v-theme-primary));
  inline-size: 25px;
  outline: none;
}

.custom-input::-webkit-outer-spin-button,
.custom-input::-webkit-inner-spin-button {
  margin: 0;
  appearance: none;
}
</style>
