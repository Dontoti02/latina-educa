<script setup lang="ts">
import { ToastService } from "@/common/util/toast.service";
import { CourseService } from "@/services/courses.service";
import { CourseAdminItem, CourseFormParamItem } from "@/models/courses";
import ModalBasic from "@/common/components/Modal.vue";

const props = defineProps<{
  modelValue: boolean;
  item?: CourseAdminItem | null;
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
const studyPrograms = ref<CourseFormParamItem[]>([]);
const modules = ref<CourseFormParamItem[]>([]);
const courseTypes = ref<CourseFormParamItem[]>([]);

const form = ref<{
  study_program_id: number | null;
  module_id: number | null;
  type_id: number | null;
  code: string;
  name: string;
  year: string;
  credits: number | null;
  hours: number | null;
  description: string;
}>({
  study_program_id: null,
  module_id: null,
  type_id: null,
  code: "",
  name: "",
  year: String(new Date().getFullYear()),
  credits: null,
  hours: null,
  description: "",
});

const resetForm = () => {
  form.value = {
    study_program_id: props.item?.study_program_id ?? null,
    module_id: props.item?.module_id ?? null,
    type_id: props.item?.type_id ?? null,
    code: props.item?.code ?? "",
    name: props.item?.name ?? "",
    year: props.item?.year ?? String(new Date().getFullYear()),
    credits:
      props.item?.credits != null ? Math.trunc(props.item.credits) : null,
    hours: props.item?.hours ?? null,
    description: props.item?.description ?? "",
  };
};

const loadFormParams = () => {
  isLoadingParams.value = true;
  CourseService.getFormParams()
    .then((response) => {
      studyPrograms.value = response.data.study_programs;
      modules.value = response.data.modules;
      courseTypes.value = response.data.types;
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
      resetForm();
      loadFormParams();
    } else {
      form.value = {
        study_program_id: null,
        module_id: null,
        type_id: null,
        code: "",
        name: "",
        year: String(new Date().getFullYear()),
        credits: null,
        hours: null,
        description: "",
      };
    }
  },
);

const filteredModules = computed(() =>
  form.value.study_program_id
    ? modules.value.filter(
        (m) => m.study_program_id === form.value.study_program_id,
      )
    : [],
);

watch(
  () => form.value.study_program_id,
  () => {
    form.value.module_id = null;
  },
);

const isFormValid = computed(
  () =>
    form.value.study_program_id !== null &&
    form.value.type_id !== null &&
    !!form.value.code.trim() &&
    !!form.value.name.trim() &&
    !!form.value.year &&
    form.value.credits !== null &&
    form.value.hours !== null,
);

const close = () => {
  isOpen.value = false;
};

const onSubmit = () => {
  if (!isFormValid.value) return;

  isLoading.value = true;

  const payload = {
    study_program_id: form.value.study_program_id!,
    module_id: form.value.module_id,
    type_id: form.value.type_id!,
    code: form.value.code.trim(),
    name: form.value.name.trim(),
    year: form.value.year,
    credits: form.value.credits!,
    hours: form.value.hours!,
    description: form.value.description?.trim() || null,
  };

  const request = isEditMode.value
    ? CourseService.update(props.item!.id, payload)
    : CourseService.create(payload);

  const successMessage = isEditMode.value
    ? "Curso actualizado correctamente"
    : "Curso creado correctamente";

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
  <ModalBasic :visible="isOpen" max-width="700">
    <VCard>
      <VCardTitle class="pa-4">
        {{ isEditMode ? "Editar curso" : "Nuevo curso" }}
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
              v-model="form.module_id"
              :items="filteredModules"
              item-title="name"
              item-value="id"
              label="Módulo"
              :loading="isLoadingParams"
              :disabled="!form.study_program_id || filteredModules.length === 0"
              clearable
            />
          </VCol>
          <VCol cols="12" sm="6">
            <VAutocomplete
              v-model="form.type_id"
              :items="courseTypes"
              item-title="name"
              item-value="id"
              label="Tipo de curso *"
              :loading="isLoadingParams"
              :rules="[(v: any) => !!v || 'El tipo de curso es requerido']"
            />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField
              v-model="form.code"
              label="Código *"
              :rules="[(v: any) => !!v?.trim() || 'El código es requerido']"
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
              v-model="form.year"
              label="Año *"
              type="number"
              :min="2000"
              :rules="[
                (v: any) => !!v || 'El año es requerido',
                (v: any) => /^\d{4}$/.test(v) || 'Debe tener 4 dígitos',
              ]"
            />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField
              v-model.number="form.credits"
              label="Créditos *"
              type="number"
              :min="1"
              :rules="[
                (v: any) => !!v || 'Los créditos son requeridos',
                (v: any) =>
                  (Number.isInteger(Number(v)) && Number(v) >= 1) ||
                  'Debe ser un número entero positivo',
              ]"
              @keypress="
                (e: KeyboardEvent) => {
                  if (!/[0-9]/.test(e.key)) e.preventDefault();
                }
              "
            />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField
              v-model.number="form.hours"
              label="Horas *"
              type="number"
              :min="1"
              :rules="[(v: any) => !!v || 'Las horas son requeridas']"
            />
          </VCol>
          <VCol cols="12">
            <VTextarea
              v-model="form.description"
              label="Descripción"
              rows="3"
              auto-grow
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
