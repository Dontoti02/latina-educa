<script setup lang="ts">
import { ToastService } from "@/common/util/toast.service";
import { TeacherService } from "@/services/teacher.service";
import type {
  TeacherItem,
  TeacherParamOption,
  TeacherPayload,
} from "@/models/teacher";
import ModalBasic from "@/common/components/Modal.vue";

const props = defineProps<{
  modelValue: boolean;
  item?: TeacherItem | null;
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

const workingConditions = ref<TeacherParamOption[]>([]);
const studyPrograms = ref<TeacherParamOption[]>([]);

const sexOptions = [
  { title: "Masculino", value: "M" },
  { title: "Femenino", value: "F" },
];

// DD/MM/YYYY → YYYY-MM-DD (para input type="date")
const toInputDate = (date: string | null): string | null => {
  if (!date) return null;
  const parts = date.split("/");
  if (parts.length === 3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
  return date;
};

const emptyForm = (): TeacherPayload => ({
  names: "",
  document_number: "",
  email: "",
  phone: null,
  sex: null,
  birth_date: null,
  native_language: null,
  working_condition_id: null,
  study_program_id: null,
  registration_date: null,
  resolution_number: null,
});

const form = ref<TeacherPayload>(emptyForm());

const loadParams = () => {
  if (workingConditions.value.length && studyPrograms.value.length) return;
  isLoadingParams.value = true;
  TeacherService.getParams()
    .then((response) => {
      workingConditions.value = response.data.working_conditions;
      studyPrograms.value = response.data.study_programs;
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
      loadParams();
      form.value = {
        names: props.item?.names ?? "",
        document_number: props.item?.document_number ?? "",
        email: props.item?.email ?? "",
        phone: props.item?.phone ?? null,
        sex: props.item?.sex ?? null,
        birth_date: toInputDate(props.item?.birth_date ?? null),
        native_language: props.item?.native_language ?? null,
        working_condition_id: props.item?.working_condition_id ?? null,
        study_program_id: props.item?.study_program_id ?? null,
        registration_date: toInputDate(props.item?.registration_date ?? null),
        resolution_number: props.item?.resolution_number ?? null,
      };
    } else {
      form.value = emptyForm();
    }
  },
);

const isFormValid = computed(() => {
  const baseValid =
    !!form.value.working_condition_id && !!form.value.registration_date;

  if (isEditMode.value) return baseValid;

  return (
    baseValid &&
    !!form.value.names.trim() &&
    !!form.value.document_number.trim() &&
    !!form.value.email.trim() &&
    !!form.value.phone?.trim()
  );
});

const close = () => {
  isOpen.value = false;
};

const onSubmit = () => {
  if (!isFormValid.value) return;

  isLoading.value = true;

  const request = isEditMode.value
    ? TeacherService.update(props.item!.id, {
        working_condition_id: form.value.working_condition_id,
        study_program_id: form.value.study_program_id,
        registration_date: form.value.registration_date,
        resolution_number: form.value.resolution_number,
      })
    : TeacherService.create(form.value);

  const successMessage = isEditMode.value
    ? "Docente actualizado correctamente"
    : "Docente creado correctamente";

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
        {{ isEditMode ? "Editar docente" : "Nuevo docente" }}
      </VCardTitle>
      <VDivider />
      <VCardText class="pa-4">
        <VRow>
          <!-- Nombres -->
          <VCol cols="12">
            <VTextField
              v-model="form.names"
              label="Nombres *"
              :disabled="isEditMode"
              :rules="[
                (v: any) =>
                  isEditMode || !!v?.trim() || 'El nombre es requerido',
              ]"
            />
          </VCol>

          <!-- Número de documento -->
          <VCol cols="12" md="6">
            <VTextField
              v-model="form.document_number"
              label="N° Documento *"
              :disabled="isEditMode"
              :rules="[
                (v: any) =>
                  isEditMode || !!v?.trim() || 'El documento es requerido',
              ]"
            />
          </VCol>

          <!-- Email -->
          <VCol cols="12" md="6">
            <VTextField
              v-model="form.email"
              label="Correo electrónico *"
              type="email"
              :disabled="isEditMode"
              :rules="[
                (v: any) =>
                  isEditMode || !!v?.trim() || 'El correo es requerido',
              ]"
            />
          </VCol>

          <!-- Teléfono -->
          <VCol cols="12" md="6">
            <VTextField
              v-model="form.phone"
              label="Teléfono *"
              :disabled="isEditMode"
              :rules="[
                (v: any) =>
                  isEditMode || !!v?.trim() || 'El teléfono es requerido',
              ]"
            />
          </VCol>

          <!-- Sexo -->
          <VCol cols="12" md="6">
            <VSelect
              v-model="form.sex"
              :items="sexOptions"
              item-title="title"
              item-value="value"
              label="Sexo"
              :disabled="isEditMode"
              clearable
            />
          </VCol>

          <!-- Fecha de nacimiento -->
          <VCol cols="12" md="6">
            <VTextField
              v-model="form.birth_date"
              label="Fecha de nacimiento"
              type="date"
              :disabled="isEditMode"
            />
          </VCol>

          <!-- Lengua materna -->
          <VCol cols="12" md="6">
            <VTextField
              v-model="form.native_language"
              label="Lengua materna"
              :disabled="isEditMode"
            />
          </VCol>

          <!-- Condición laboral -->
          <VCol cols="12" md="6">
            <VSelect
              v-model="form.working_condition_id"
              :items="workingConditions"
              item-title="name"
              item-value="id"
              label="Condición laboral *"
              :loading="isLoadingParams"
              :rules="[(v: any) => !!v || 'La condición laboral es requerida']"
            />
          </VCol>

          <!-- Programa de estudio -->
          <VCol cols="12" md="6">
            <VSelect
              v-model="form.study_program_id"
              :items="studyPrograms"
              item-title="name"
              item-value="id"
              label="Programa de estudio"
              :loading="isLoadingParams"
              clearable
            />
          </VCol>

          <!-- Fecha de registro -->
          <VCol cols="12" md="6">
            <VTextField
              v-model="form.registration_date"
              label="Fecha de registro *"
              type="date"
              :rules="[(v: any) => !!v || 'La fecha de registro es requerida']"
            />
          </VCol>

          <!-- Número de resolución -->
          <VCol cols="12" md="6">
            <VTextField
              v-model="form.resolution_number"
              label="Número de resolución"
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
