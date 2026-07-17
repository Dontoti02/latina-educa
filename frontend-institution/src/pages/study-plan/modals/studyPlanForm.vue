<script setup lang="ts">
import { ToastService } from "@/common/util/toast.service";
import { StudyPlanService } from "@/services/study-plan.service";
import { StudyPlanItem, StudyPlanFormParamItem } from "@/models/study-plan";
import ModalBasic from "@/common/components/Modal.vue";

const props = defineProps<{
  modelValue: boolean;
  item?: StudyPlanItem | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "saved"): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const isEditMode = computed(() => !!props.item?.id);

const isLoading = ref(false);
const isLoadingParams = ref(false);
const studyPrograms = ref<StudyPlanFormParamItem[]>([]);
const studyPlanTypes = ref<StudyPlanFormParamItem[]>([]);

const form = ref<{
  name: string;
  study_program_id: number | null;
  type_id: number | null;
  year: number | null;
  score_min_to_pass_number: number | null;
}>({
  name: "",
  study_program_id: null,
  type_id: null,
  year: new Date().getFullYear(),
  score_min_to_pass_number: null,
});

const loadFormParams = () => {
  isLoadingParams.value = true;
  StudyPlanService.getStudyPlanFormParams()
    .then((response) => {
      studyPrograms.value = response.data.study_programs;
      studyPlanTypes.value = response.data.types;
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      isLoadingParams.value = false;
    });
};

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      form.value = {
        name: props.item?.name ?? "",
        study_program_id: props.item?.study_program_id ?? null,
        type_id: props.item?.type_id ?? null,
        year: props.item?.year ?? new Date().getFullYear(),
        score_min_to_pass_number: props.item?.score_min_to_pass_number ?? null,
      };
      loadFormParams();
    } else {
      form.value = {
        name: "",
        study_program_id: null,
        type_id: null,
        year: new Date().getFullYear(),
        score_min_to_pass_number: null,
      };
    }
  },
);

const isFormValid = computed(
  () =>
    !!form.value.name.trim() &&
    form.value.study_program_id !== null &&
    form.value.type_id !== null &&
    form.value.year !== null,
);

const close = () => {
  isOpen.value = false;
};

const onSubmit = () => {
  if (!isFormValid.value) return;

  isLoading.value = true;

  const payload = {
    name: form.value.name.trim(),
    study_program_id: form.value.study_program_id!,
    type_id: form.value.type_id!,
    year: form.value.year?.toString()!,
    score_min_to_pass_number: form.value.score_min_to_pass_number,
  };

  const request = isEditMode.value
    ? StudyPlanService.updateStudyPlan(props.item!.id, payload)
    : StudyPlanService.createStudyPlan(payload);

  const successMessage = isEditMode.value
    ? "Plan de estudio actualizado correctamente"
    : "Plan de estudio creado correctamente";

  request
    .then(() => {
      ToastService.success(successMessage);
      emit("saved");
      close();
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      isLoading.value = false;
    });
};
</script>

<template>
  <ModalBasic :visible="isOpen" max-width="600">
    <VCard>
      <VCardTitle class="pa-4">
        {{ isEditMode ? "Editar plan de estudio" : "Nuevo plan de estudio" }}
      </VCardTitle>
      <VDivider />
      <VCardText class="pa-4">
        <VRow>
          <VCol cols="12" sm="6">
            <VAutocomplete
              v-model="form.study_program_id"
              :items="studyPrograms"
              item-title="name"
              item-value="id"
              label="Programa de estudio *"
              :loading="isLoadingParams"
              :rules="[
                (v: any) => !!v || 'El programa de estudio es requerido',
              ]"
            />
          </VCol>
          <VCol cols="12" sm="6">
            <VAutocomplete
              v-model="form.type_id"
              :items="studyPlanTypes"
              item-title="name"
              item-value="id"
              label="Tipo de plan *"
              :loading="isLoadingParams"
              :rules="[(v: any) => !!v || 'El tipo de plan es requerido']"
            />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField
              v-model="form.name"
              label="Nombre *"
              :rules="[(v: any) => !!v?.trim() || 'El nombre es requerido']"
            />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField
              v-model.number="form.year"
              label="Año *"
              type="number"
              :min="2000"
              :rules="[(v: any) => !!v || 'El año es requerido']"
            />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField
              v-model.number="form.score_min_to_pass_number"
              label="Puntaje mínimo para aprobar"
              type="number"
              min="0"
            />
          </VCol>
        </VRow>
      </VCardText>
      <VCardActions class="pa-4 d-flex justify-end gap-3">
        <VBtn variant="tonal" color="secondary" @click="close">Cerrar</VBtn>
        <VBtn
          variant="outlined"
          color="primary"
          :loading="isLoading"
          :disabled="!isFormValid"
          @click="onSubmit"
        >
          Guardar
        </VBtn>
      </VCardActions>
    </VCard>
  </ModalBasic>
</template>
<style>
.v-list-item--active .v-list-item-title {
  color: white !important;
}
</style>
