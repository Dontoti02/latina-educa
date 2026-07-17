<script setup lang="ts">
import { requiredValidator } from '@/@core/utils/validators';
import ModalBasic from "@/common/components/Modal.vue";
import modalService, { modalConfirmation } from "@/common/util/modal.service";
import {  CapacitationFormQuestion, QuestionType, TrainingFormEvaluationBuild } from "@/models/evalution-form";
import { EvaluationFormService } from "@/services/evaluation-from.service";
import { v4 as uuidv4 } from "uuid";
import Draggable from 'vuedraggable';
import { VSkeletonLoader } from "vuetify/labs/VSkeletonLoader";
import BuildQuestionForm from './BuildQuestionForm.vue';
import { toastError } from '@/common/util/toast.service';
import { InputTypesEnum } from './enums/InputTypes';

// Initial
const props = defineProps<{
  formEvaluation?: TrainingFormEvaluationBuild | null;
  contentId: number | null;
  content_score_max: number | null;
  show: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "save", form: TrainingFormEvaluationBuild): void;
  (e: "update:content_score_max", score: number): void;
}>();

// Variables
const loadingParams = ref(false);
const questionTypes = ref<QuestionType[]>([]);
const formEvaluationCopy = ref<TrainingFormEvaluationBuild>();
const formRef = ref<HTMLFormElement | null>(null)

// Methods
const createForm = () => {
  if(props.formEvaluation) {
    formEvaluationCopy.value = JSON.parse(JSON.stringify(props.formEvaluation));
  } else {
    formEvaluationCopy.value = {
      id: null,
      uuid: uuidv4(),
      content_id: props.contentId,
      title: "",
      description: "",
      score: null,
      score_max: 0,
      questions: [],
    };  
  }
}

const getInputTypes = async () => {
  try {
    const { data } = await EvaluationFormService.getInputTypes();
    questionTypes.value = data;
  } catch (error) {
    toastError((error as any).message);
  }
};

const newQuestion = async () => {
  const newQuestion: CapacitationFormQuestion = {
    id: null,
    form_id: formEvaluationCopy.value?.id ?? null,
    label: "",
    key: uuidv4(),
    training_question_type_key: InputTypesEnum.OPTION,
    order_number: 1,
    score: null,
    score_max: 1,
    options: [
      {
        key: uuidv4(),
        label: "",
        is_correct: true,
        is_selected: null,
        is_valid: null,
      },
      {
        key: uuidv4(),
        label: "",
        is_correct: false,
        is_selected: null,
        is_valid: null,
      },
    ],
  }

  formEvaluationCopy.value!.questions.push(newQuestion);
};

const updateQuestionsOrderNumber = () => {
  formEvaluationCopy.value!.questions.forEach((question, index) => {
    question.order_number = index + 1;
  });
}

const onChangeQuestion = (question: CapacitationFormQuestion, index: number) => {
  const findIndex = question.id === null ? index : formEvaluationCopy.value!.questions.findIndex(q => q.id === question.id);
  if(findIndex !== -1) {
    formEvaluationCopy.value!.questions[findIndex] = question;
  }

  updateQuestionsOrderNumber();
};

const onDeleteQuestion = (question: CapacitationFormQuestion, index: number) => {
  const findIndex = question.id === null ? index : formEvaluationCopy.value!.questions.findIndex(q => q.id === question.id);
  if(findIndex !== -1) {
    formEvaluationCopy.value!.questions.splice(findIndex, 1);
  }
};

const onSaveForm = async () => {
  // if (formEvaluationCopy.value!.title === null || formEvaluationCopy.value!.title.trim() === "") {
  //   modalService.error("El título de la evaluación no puede estar vacío.");
  //   return;
  // }

  // const hasInvalidQuestions = formEvaluationCopy.value!.questions.some(
  //   (question) =>
  //     !question.options.some((option) => option.is_correct === true)
  // );

  // if (hasInvalidQuestions) {
  //   modalService.error("Todas las preguntas deben tener al menos una opción correcta.");
  //   return;
  // }

  const { valid } = await formRef.value!.validate();

  if(!valid) return;

  if(props.content_score_max !== formScoreMax.value) {
    const confirm = await modalService.confirmation({
      title: "Atención",
      content: `La suma de los puntajes de las preguntas del formulario (${formScoreMax.value}) no coincide con la nota máxima del contenido (${props.content_score_max}), ¿Desea modificar la nota máxima del contenido?`,
    });
    if(!confirm) return;
    emit('update:content_score_max', formScoreMax.value);
  }

  formEvaluationCopy.value!.score_max = formScoreMax.value;

  emit("save", formEvaluationCopy.value!);
  emit("close");
};

const onClose = async () => {
  if(!formModified.value) {
    emit("close");
    return;
  }

  const confirm = await modalConfirmation({
    title: "Atención",
    content:
      "Si cierra la ventana se perdera lo que ha construido en el formulario, ¿Cerrar?",
  });

  if (confirm) emit("close");
};

// Computed
const formModified = computed(() => {
  if(props.formEvaluation) {
    return JSON.stringify(props.formEvaluation) !== JSON.stringify(formEvaluationCopy.value);
  } else {
    return true;
  }
});

const formScoreMax = computed(() => {
  return formEvaluationCopy.value?.questions.reduce((total, question) => total + question.score_max, 0) ?? 0;
});

const dragOptions = computed(() => {
  return {
    animation: 200,
    group: 'description',
    disabled: false,
    ghostClass: 'ghost',
    chosenClass: 'no-move',
  }
})

// Mounted
onMounted(async () => {
  loadingParams.value = true;
  await getInputTypes();
  createForm();
  loadingParams.value = false;
});

// Watchers

</script>

<template>
  <ModalBasic
    :visible="props.show"
    is-persistent
    width="1000"
    fullscreen
    scrollable
  >
    <VCard>
      <VToolbar color="primary">
        <VToolbarTitle>
          Creación de Formulario con evaluación automatica
        </VToolbarTitle>
        <VSpacer />
        <VBtn icon @click="onClose()" color="#FFFF">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VToolbar>
      <VCardText>
        <VForm ref="formRef">
          <VRow>
            <v-col cols="12" v-if="loadingParams">
              <VSkeletonLoader
                type="divider, list-item-three-line"
                :loading="loadingParams"
                height="240"
              ></VSkeletonLoader>
            </v-col>
    
            <template v-else-if="formEvaluationCopy">
              
              <v-col cols="8">
                <v-text-field
                  v-model="formEvaluationCopy.title"
                  :full-width="true"
                  variant="underlined"
                  label="Título de la evaluación"
                  :rules="[requiredValidator]"
                  hint="Ingresa el nombre con el que vás a identificar la evaluación"
                ></v-text-field>
              </v-col>
              <v-col cols="4" class="d-flex align-center justify-end">
                Nota máxima: {{ formScoreMax }}
              </v-col>
              <VCol cols="12">
                <v-textarea
                  v-model="formEvaluationCopy.description"
                  :full-width="true"
                  rows="3"
                  variant="underlined"
                  label="Descripción de la evaluación"
                ></v-textarea>
              </VCol>
    
              <v-col cols="12" v-if="formEvaluationCopy.questions.length === 0">
                [ No tiene preguntas configuradas en este formulario de evaluación ]
              </v-col>
    
              <template v-else>
                <Draggable
                  v-model="formEvaluationCopy.questions"
                  item-key="key"
                  class="list-group v-row"
                  v-bind="dragOptions"
                  :component-data="{
                    tag: 'v-row',
                    type: 'transition-group',
                    name: 'flip-list' ,
                  }"
                  handle=".handle"
                  @end="updateQuestionsOrderNumber"
                >
                  <template #item="{ element, index }">
                    <v-col cols="12">
                      <BuildQuestionForm
                        class="list-group-item"
                        :question="element"
                        :list="questionTypes"
                        @change="onChangeQuestion($event, index)"
                        @delete="onDeleteQuestion($event, index)"
                      />
                    </v-col>
                  </template>
                </Draggable>
              </template>
            </template>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>

    <!-- float button -->

    <div class="d-flex flex-column gap-2" style="position: fixed; right: 15px; bottom: 40px;">
      <v-btn
        color="success"
        dark
        absolute
        top
        right
        icon="mdi-plus"
        fab
        :disabled="loadingParams"
        @click="newQuestion()"
      />
      <v-btn
        color="primary"
        dark
        absolute
        top
        right
        icon="mdi-content-save"
        fab
        :disabled="loadingParams"
        @click="onSaveForm()"
      />
    </div>
  </ModalBasic>
</template>
