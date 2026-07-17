<template>
  <v-card border="left" :id="question.id">
    <v-card-text>
      <VRow class="">
        <VCol cols="8">
          <v-icon class="handle" color="primary"> tabler-arrows-move-vertical</v-icon>
          &nbsp;&nbsp;&nbsp;
          <v-btn
            icon="mdi-trash"
            variant="text"
            color="primary"
            @click="emit('delete', question)"
          ></v-btn>
        </VCol>
        <VCol cols="4">
          <VSelect
            v-model="inputTypeKey"
            :items="list"
            item-title="name"
            item-value="key"
            dense
            variant="underlined"
            class="select-question"
            solo
            :full-width="true"
            :hide-details="true"
            label="Seleccione Tipo de Pregunta"
            @update:modelValue="changeInputType()"
          ></VSelect>
        </VCol>
      </VRow>

      <VRow class="mt-2">
        <VCol cols="12">
          <radio-input
            v-if="inputTypeKey === inputTypesEnum.OPTION"
            :question.sync="question"
            @update:questionData="emit('change', $event)"
          ></radio-input>

          <MultipleChoiseInput
            v-if="inputTypeKey === inputTypesEnum.OPTION_MULTIPLE"
            :question.sync="question"
            @update:questionData="emit('change', $event)"
          ></MultipleChoiseInput>
        </VCol>
      </VRow>
    </v-card-text>
    <v-overlay :absolute="true" :value="overlay"></v-overlay>
  </v-card>
</template>

<script lang="ts" setup>
import { defineEmits, defineProps, ref, watch } from "vue";
import MultipleChoiseInput from "./inputs/MultipleChoiseInput.vue";
import RadioInput from "./inputs/Radio.vue";
import { QuestionType, TrainingFormQuestion } from "@/models/evalution-form";
import { InputTypesEnum } from "./enums/InputTypes";

// Initial
const props = defineProps<{
  list: Array<QuestionType>;
  question: TrainingFormQuestion;
}>();

const emit = defineEmits<{
  (e: "change", data: TrainingFormQuestion): void;
  (e: "delete", data: TrainingFormQuestion): void;
}>();

// Variables
const inputTypeKey = ref<string>(props.question.training_question_type_key);
const overlay = ref(false);
const inputTypesEnum = InputTypesEnum;

// Methods
const changeInputType = () => {
  emit("change", {
    ...props.question,
    training_question_type_key: inputTypeKey.value,
  });
};

// Watchers
watch(
  () => props.question,
  (newValue) => {
    if (newValue && !inputTypeKey.value) {
      inputTypeKey.value = props.question.training_question_type_key;
    }
  },
  { immediate: true, deep: true }
);
</script>

<style lang="scss">
.switch {
  margin-block: 4px !important;
  padding-block: 0 !important;
}

.handle {
  cursor: move;
}
</style>
