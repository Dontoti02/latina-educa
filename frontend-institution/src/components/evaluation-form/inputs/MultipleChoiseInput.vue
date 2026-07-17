<template>
  <div>
    <VRow>
      <VCol cols="10">
        <v-text-field
          v-model="form.label"
          filled
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
          filled
          type="number"
          variant="underlined"
          :label="'puntos'"
          @blur="onBlur"
        ></v-text-field>
      </VCol>
    </VRow>
    <VContainer>
      <VCol cols="12" class="d-flex pt-0 align-center" v-for="(option, index) in listOptions" :key="option.key">
        <v-checkbox
          v-model="option.is_correct"
          @change="onBlur"
        ></v-checkbox>
        <v-text-field
          v-model="option.label"
          dense
          variant="underlined"
          placeholder="Escribe la opción aquí..."
          :rules="[requiredValidator]"
          @blur="onBlur"
        ></v-text-field>
        <v-btn icon="mdi-close"
            variant="text"
            size="small"
            color="error" @click="deleteOption(index)">
        </v-btn>
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
import { requiredValidator } from '@/@core/utils/validators';
import { v4 as uuidv4 } from 'uuid';
import { defineEmits, defineProps, ref } from 'vue';
import { FormQuestion, QuestionOption } from '../../../models/evalution-form';

const props = defineProps<{
  question: FormQuestion;
}>();
const emit = defineEmits<{
  (e: "update:questionData", data: FormQuestion): void;
}>();

const form = ref({ label: props.question.label, score_max: props.question.score_max });
const listOptions = ref<Array<QuestionOption>>(props.question.options || []);
const rules = [
  (v: string) => (v.length <= 1000 || "Max 1000 characters"),
  requiredValidator,
];

const addOption = () => {
  listOptions.value.push({ 
    key: uuidv4(), 
    label: '', 
    is_correct: false,
    is_selected: null,
    is_valid: null, 
  });
};

const deleteOption = (index: number) => {
  listOptions.value.splice(index, 1);
};

const onBlur = () => {
  const trimmedOptions = listOptions.value.map(option => ({
    ...option,
    label: option.label.trim(),
  }));

  emit('update:questionData', {
    ...props.question,
    label: form.value.label.trim(),
    score_max: Number(form.value.score_max),
    options: trimmedOptions,
  });
};
</script>
