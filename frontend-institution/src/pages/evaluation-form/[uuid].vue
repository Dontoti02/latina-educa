<script setup lang="ts">
import { requiredValidator } from '@/@core/utils/validators';
import { SessionStore } from '@/common/store';
import { ToastService } from '@/common/util/toast.service';
import { InputTypesEnum } from '@/components/evaluation-form/enums/InputTypes';
import { AnsweredFormEvaluation, FormQuestion } from '@/models/evalution-form';
import { EvaluationFormService } from '@/services/evaluation-from.service';
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader';

// Router
const route = useRoute()
const formUuid = route.params.uuid as string
const personId: number | undefined = route.query.number ? +route.query.number : undefined;

// Initial
const session = SessionStore()
const loading = ref(false)
const loadingSubmit = ref(false)
const form = ref<AnsweredFormEvaluation>()
const formRef = ref<HTMLFormElement | null>(null)

// Variables Form
const multipleSelectErrors = ref<string[]>([]) 
const radioInputResponses = ref<{ [key: string]: string }>({})

// Mounted
onMounted(() => {
  getForm()
})

// Get data
const getForm = async () => {
  loading.value = true
  EvaluationFormService.getEvaluationForm(formUuid, personId)
    .then(response => {
      form.value = response.data
      if(form.value.questions && form.value.is_pending) {
        form.value.questions = response.data.questions.map(question => ({
          ...question,
          options: question.options.map(option => ({
            ...option,
            is_selected: false
          }))
        }))

      } else if (form.value.questions && !form.value.is_pending) {
        form.value.questions.forEach(question => {
          radioInputResponses.value[question.key] = question.options.find(option => option.is_selected)?.key ?? ''
        })
      }
    })
    .catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loading.value = false
    })
}

// Methods
const handleOptionChange = (question: FormQuestion, selectedValue: string) =>  {
  question.options.forEach(option => {
    option.is_selected = option.key === selectedValue;
  });
}

const validMultiselect = (question: FormQuestion) => {
  if(question.options.some(option => option.is_selected)) {
    multipleSelectErrors.value = multipleSelectErrors.value.filter(key => key !== question.key);
  } else {
    multipleSelectErrors.value = [...multipleSelectErrors.value, question.key];
  }
}

const submit = async () => {
  const { valid } = await formRef.value!.validate()

  const hasUnselectedOptions = form.value?.questions.some(question => {
    return question.question_type_key === InputTypesEnum.OPTION_MULTIPLE && !question.options.some(option => option.is_selected);
  });

  if(hasUnselectedOptions) {
    multipleSelectErrors.value = form.value?.questions
      .filter(question => question.question_type_key === InputTypesEnum.OPTION_MULTIPLE && !question.options.some(option => option.is_selected))
      .map(question => question.key) ?? [];
  }

  if (!valid || hasUnselectedOptions)
    return 
  
  loadingSubmit.value = true
  EvaluationFormService.sendEvaluationForm(formUuid, form.value?.questions!)
    .then(() => {
      ToastService.success('Formulario enviado con éxito')
      getForm()
    })
    .catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loadingSubmit.value = false
    })
}
</script>
<template>
  <div  class="w-100 d-flex justify-center mt-8">
    <div
      v-if="loading"
      class="w-75"
    >
      <VRow>
        <VCol cols="12">
          <VSkeletonLoader
            class="w-100 gap-4 "
            type="heading,subtitle"
          />
        </VCol>
        <VCol
          v-for="index in 6"
          :key="index"
          cols="12"
        >
          <VSkeletonLoader
            class="w-100 gap-4 "
            type="paragraph"
          />
        </VCol>
      </VRow>
    </div>
    <VCard
      v-else-if="form && !form.is_pending"
      class="w-75 px-4 py-4"
    >
      <VCardTitle class="d-flex justify-space-between align-start">
        <div>
          <div class="text-h3">
            {{ form.title }}
          </div>
          <div class="text-body-2">
            El formulario ya ha sido completado
          </div>
        </div>
        <div>
          <div
            class="text-end mt-4 text-h6"
            :class="form.score! < form.score_max / 2 ? 'text-error' : 'text-success'"
          >
            {{ form.score }} / {{ form.score_max }}
          </div>
        </div>
      </VCardTitle>
      <VCardText>
        <div v-if="!!form.description" class="pb-4 text-body-1">
          {{ form.description }}
        </div>
        <template v-if="form.questions">
          <VDivider />
          <VRow class="pt-2">
            <template v-for="(question, index) in form.questions" :key="index">
              <VCol
                cols="12"
              >
                <VCard variant="text">
                  <VCardTitle>
                    {{ question.label }}
                  </VCardTitle>
                  <VCardText class="pt-1 pb-1">
                    <VRow v-if="question.question_type_key === InputTypesEnum.OPTION" class="mx-0">
                      <VCol cols="12" class="py-0">
                        <VRadioGroup 
                          v-model="radioInputResponses[question.key]"
                          @change="handleOptionChange(question, $event)" 
                          row
                          readonly
                          :rules="[requiredValidator]"
                        >
                          <VRadio
                            v-for="(option, index) in question.options"
                            v-model="option.is_selected"
                            :key="index"
                            :label="option.label"
                            :value="option.key"
                            :style="{
                              'background-color': (option.is_correct) ? 'rgb(var(--v-theme-success), 0.42) !important' : (option.is_selected) ? 'rgb(var(--v-theme-error), 0.42) !important' : '',
                            }"
                          ></VRadio>
                        </VRadioGroup>
                      </VCol>
                    </VRow>
                    <VRow v-if="question.question_type_key === InputTypesEnum.OPTION_MULTIPLE" class="mx-0">
                      <VCol cols="12" class="py-0">
                        <VCheckbox
                          v-for="(option, index) in question.options"
                          v-model="option.is_selected"
                          :key="index"
                          :label="option.label"
                          readonly
                          :style="{
                            'background-color': (option.is_correct) ? 'rgb(var(--v-theme-success), 0.42) !important' : (option.is_selected) ? 'rgb(var(--v-theme-error), 0.42) !important' : '',
                          }"
                          @change="validMultiselect(question)"
                        />
                        <VMessages :active="multipleSelectErrors.includes(question.key)"  messages="Este campo es requerido" class="pt-2 pl-4" color="error" style="opacity: 1;" />
                      </VCol>
                    </VRow>
                  </VCardText>
                </VCard>
              </VCol>
            </template>
          </VRow>
        </template>
      </VCardText>
    </VCard>
    <VCard
      v-else-if="form && !form.is_open"
      class="w-75 px-4 py-4"
    >
      <VCardTitle class="d-flex justify-space-between align-start">
        <div>
          <div class="text-h3">
            {{ form.title }}
          </div>
          <div class="text-body-2 text-warning">
            El formulario ya no admite respuestas.
          </div>
        </div>
      </VCardTitle>
    </VCard>
    <VCard
      v-else-if="form && form.is_pending"
      class="w-75 px-4 py-4"
    >
      <VForm ref="formRef" @submit.prevent="submit">
        <VCardTitle class="text-h3">
          {{ form.title }}
        </VCardTitle>
        <VCardText>
          <div v-if="!!form.description" class="pb-4 text-body-1">
            {{ form.description }}
          </div>
          <VDivider />
          <VRow class="pt-2">
            <template v-for="(question, index) in form.questions" :key="index">
              <VCol
                cols="12"
              >
                <VCard variant="text">
                  <VCardTitle>
                    {{ question.label }}
                  </VCardTitle>
                  <VCardText class="pt-1 pb-1">
                    <VRow v-if="question.question_type_key === InputTypesEnum.OPTION" class="mx-0">
                      <VCol cols="12" class="py-0">
                        <VRadioGroup 
                          @update:modelValue="handleOptionChange(question, $event)" 
                          row
                          :rules="[requiredValidator]"
                        >
                          <VRadio
                            v-for="(option, index) in question.options"
                            v-model="option.is_selected"
                            :key="index"
                            :label="option.label"
                            :value="option.key"
                            :disabled="loadingSubmit"
                          ></VRadio>
                        </VRadioGroup>
                      </VCol>
                    </VRow>
                    <VRow v-if="question.question_type_key === InputTypesEnum.OPTION_MULTIPLE" class="mx-0">
                      <VCol cols="12">
                        <VCheckbox
                          v-for="(option, index) in question.options"
                          v-model="option.is_selected"
                          :key="index"
                          :label="option.label"
                          :disabled="loadingSubmit"
                          @change="validMultiselect(question)"
                        />
                        <VMessages :active="multipleSelectErrors.includes(question.key)"  messages="Este campo es requerido" class="pt-2 pl-4" color="error" style="opacity: 1;" />
                      </VCol>
                    </VRow>
                  </VCardText>
                </VCard>
              </VCol>
            </template>
          </VRow>
        </VCardText>
        <VCardActions class="d-flex justify-end pt-4">
          <VBtn
            type="submit"
            text="Enviar"
            variant="flat"
            :loading="loadingSubmit"
          />
        </VCardActions>
      </VForm>
    </VCard>
    
  </div>
</template>
<route lang="yaml">
  meta:
    layout: blank
    action: read
    subject: CurrentCourses
</route>
