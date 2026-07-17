<template>
  <div class="col-md-12 pa-0 ma-0">
    <VRow class="row pa-0">
      <VCol cols="10">
        <v-text-field
          v-model="form.label"
          :rules="[requiredValidator]"
          variant="underlined"
          :label="question.order_number + '.- Título de la pregunta'"
          placeholder="Escribe la pregunta aquí..."
          persistent-placeholder
          @blur="onBlur"
        ></v-text-field>
      </VCol>
      <VCol cols="2">
        <v-text-field
          v-model="form.score_max"
          type="number"
          variant="underlined"
          :label="'puntos'"
          @blur="onBlur"
        ></v-text-field>
      </VCol>
    </VRow>

    <VContainer class="row pt-2" v-if="listOptions">
      <span color="error" class="text-error text-caption">
        <strong>Nota:</strong> No olvides marcar la opción que contiene la
        respuesta correcta.
      </span>
      <VCol
        cols="12"
        class="pt-0 d-flex align-center"
        v-for="(option, i) in listOptions"
        :key="i"
      >
        <v-radio-group v-model="radios" @change="onBlur">
          <v-radio :value="option.key" class="custom-radio"/>
        </v-radio-group>
        <div style="display: flex; width: 100%;">
          <v-text-field
            v-model="option.label"
            dense
            variant="underlined"
            placeholder="Escribe la opción aquí..."
            :rules="[requiredValidator]"
            @blur="onBlur"
            ></v-text-field>
          <VBtn
            icon="mdi-close"
            variant="text"
            size="small"
            color="error"
            @click="deleteOption(i)"
            :disabled="listOptions.length <= 1"
          ></VBtn>
        </div>
      </VCol>

      <div
        class="col-md-12 text-center pa-0 ma-0 d-flex align-center justify-center"
      >
        <v-btn text color="primary" size="small" @click="addOption">
          <v-icon>mdi-plus</v-icon>&nbsp;añadir
        </v-btn>
      </div>
    </VContainer>
  </div>
</template>

<script lang="ts" setup>
import { requiredValidator } from "@/@core/utils/validators";
import { v4 as uuidv4 } from "uuid";
import { defineEmits, defineProps, ref, watch } from "vue";
import { InputTypesEnum } from "../enums/InputTypes";
import { CapacitationFormQuestion,QuestionOption } from "@/models/evalution-form";

const props = defineProps<{
  question: CapacitationFormQuestion;
}>();

const emit = defineEmits<{
  (e: "update:questionData", data: CapacitationFormQuestion): void;
}>();

const radios = ref<string | null>(null);

const form = ref({
  label: "",
  score_max: 0,
  questionKey: InputTypesEnum.OPTION,
});

const listOptions = ref<Array<QuestionOption>>([]);

onMounted(() => {
  form.value = {
    label: props.question.label,
    score_max: props.question.score_max,
    questionKey: props.question.training_question_type_key as InputTypesEnum,
  };

  props.question.options.map((item: QuestionOption) => {
    if(item.is_correct) radios.value = item.key;
    listOptions.value.push(item);
  });

  emit("update:questionData", getDataQuestion());
  
});

const addOption = () => {
  listOptions.value.push({
    key: uuidv4(),
    label: "",
    is_correct: false,
    is_selected: null,
    is_valid: null,
  });
};

const deleteOption = (index: number) => {
  if (index !== -1) {
    listOptions.value.splice(index, 1);
  }
};

const getDataQuestion = (): CapacitationFormQuestion => {
  const question = { ...props.question };
  const { label, questionKey } = form.value;

  const trimmedOptions = listOptions.value.map(option => ({
    ...option,
    label: option.label.trim(),
  }));

  question.label = label.trim();
  question.options = trimmedOptions;
  question.training_question_type_key = questionKey;
  question.score_max = Number(form.value.score_max);

  listOptions.value.map((item: QuestionOption) => {
    item.is_correct = item.key === radios.value;
  });

  return question;
};


watch(
  [form, listOptions],
  () => {
    emit("update:questionData", getDataQuestion());
  },
  { deep: true }
);

const onBlur = () => {
  emit("update:questionData", getDataQuestion());
};
</script>
