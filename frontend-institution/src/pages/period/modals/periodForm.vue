<script setup lang="ts">
import { ToastService } from "@/common/util/toast.service";
import { PeriodService } from "@/services/period.service";
import type { PeriodItem, PeriodPayload } from "@/models/period";
import ModalBasic from "@/common/components/Modal.vue";

const props = defineProps<{
  modelValue: boolean;
  item?: PeriodItem | null;
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

const numberToFailOptions = [
  { title: "Cantidad de cursos", value: 0 },
  { title: "Porcentaje de cantidad de cursos", value: 1 },
  { title: "Porcentaje de créditos", value: 2 },
];

const emptyForm = (): PeriodPayload => ({
  name: "",
  start_date: null,
  end_date: null,
  enrollment_start_date: null,
  enrollment_end_date: null,
  classroom_start_date: null,
  classroom_end_date: null,
  is_number_to_fail: 0,
  classroom_max_to_fail: null,
  is_required_enrollment_payment: false,
});

const form = ref<PeriodPayload>(emptyForm());

const toDateInput = (val: string | null): string | null =>
  val ? val.slice(0, 10) : null;

watch(
  () => props.modelValue,
  (val) => {
    if (val && props.item) {
      form.value = {
        name: props.item.name,
        start_date: toDateInput(props.item.start_date),
        end_date: toDateInput(props.item.end_date),
        enrollment_start_date: toDateInput(props.item.enrollment_start_date),
        enrollment_end_date: toDateInput(props.item.enrollment_end_date),
        classroom_start_date: toDateInput(props.item.classroom_start_date),
        classroom_end_date: toDateInput(props.item.classroom_end_date),
        is_number_to_fail: props.item.is_number_to_fail,
        classroom_max_to_fail: props.item.classroom_max_to_fail,
        is_required_enrollment_payment:
          props.item.is_required_enrollment_payment,
      };
    } else {
      form.value = emptyForm();
    }
  },
);

const isFormValid = computed(
  () =>
    !!form.value.name.trim() &&
    !!form.value.start_date &&
    !!form.value.end_date &&
    !!form.value.enrollment_start_date &&
    !!form.value.enrollment_end_date &&
    !!form.value.classroom_start_date &&
    !!form.value.classroom_end_date,
);

const close = () => {
  isOpen.value = false;
};

const onSubmit = () => {
  if (!isFormValid.value) return;

  isLoading.value = true;

  const payload: PeriodPayload = {
    ...form.value,
    name: form.value.name.trim(),
    classroom_max_to_fail:
      form.value.classroom_max_to_fail !== null
        ? Number(form.value.classroom_max_to_fail)
        : null,
  };

  const request = isEditMode.value
    ? PeriodService.update(props.item!.id, payload)
    : PeriodService.create(payload);

  const successMessage = isEditMode.value
    ? "Período actualizado correctamente"
    : "Período creado correctamente";

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
  <ModalBasic :visible="isOpen" max-width="800">
    <VCard>
      <VCardTitle class="pa-4">
        {{ isEditMode ? "Editar período" : "Nuevo período" }}
      </VCardTitle>
      <VDivider />
      <VCardText class="pa-4">
        <VRow>
          <!-- Nombre -->
          <VCol cols="12">
            <VTextField
              v-model="form.name"
              label="Nombre *"
              :rules="[(v: any) => !!v?.trim() || 'El nombre es requerido']"
            />
          </VCol>

          <!-- Fechas del período -->
          <VCol cols="12" class="pb-0">
            <p
              class="text-subtitle-2 font-weight-bold text-medium-emphasis mb-0"
            >
              Fechas del período
            </p>
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField
              v-model="form.start_date"
              label="Fecha inicio *"
              type="date"
              :rules="[(v: any) => !!v || 'La fecha de inicio es requerida']"
            />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField
              v-model="form.end_date"
              label="Fecha fin *"
              type="date"
              :rules="[
                (v: any) => !!v || 'La fecha de fin es requerida',
                (v: any) =>
                  !form.start_date ||
                  v > form.start_date ||
                  'Debe ser posterior a la fecha de inicio',
              ]"
            />
          </VCol>

          <!-- Fechas de matrícula -->
          <VCol cols="12" class="pb-0">
            <p
              class="text-subtitle-2 font-weight-bold text-medium-emphasis mb-0"
            >
              Fechas de matrícula
            </p>
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField
              v-model="form.enrollment_start_date"
              label="Inicio de matrícula *"
              type="date"
              :rules="[
                (v: any) =>
                  !!v || 'La fecha de inicio de matrícula es requerida',
              ]"
            />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField
              v-model="form.enrollment_end_date"
              label="Fin de matrícula *"
              type="date"
              :rules="[
                (v: any) => !!v || 'La fecha de fin de matrícula es requerida',
                (v: any) =>
                  !form.enrollment_start_date ||
                  v > form.enrollment_start_date ||
                  'Debe ser posterior al inicio de matrícula',
              ]"
            />
          </VCol>

          <!-- Fechas de aula -->
          <VCol cols="12" class="pb-0">
            <p
              class="text-subtitle-2 font-weight-bold text-medium-emphasis mb-0"
            >
              Fechas de aula
            </p>
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField
              v-model="form.classroom_start_date"
              label="Inicio de aula *"
              type="date"
              :rules="[
                (v: any) => !!v || 'La fecha de inicio de aula es requerida',
              ]"
            />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField
              v-model="form.classroom_end_date"
              label="Fin de aula *"
              type="date"
              :rules="[
                (v: any) => !!v || 'La fecha de fin de aula es requerida',
                (v: any) =>
                  !form.classroom_start_date ||
                  v > form.classroom_start_date ||
                  'Debe ser posterior al inicio de aula',
              ]"
            />
          </VCol>

          <!-- Configuración -->
          <VCol cols="12" class="pb-0">
            <p
              class="text-subtitle-2 font-weight-bold text-medium-emphasis mb-0"
            >
              Configuración
            </p>
          </VCol>
          <VCol cols="12" sm="6">
            <VSelect
              v-model="form.is_number_to_fail"
              label="Número para reprobar *"
              :items="numberToFailOptions"
              item-title="title"
              item-value="value"
            />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField
              v-model="form.classroom_max_to_fail"
              label="Máximo de reprobado *"
              type="number"
              min="0"
              :rules="[
                (v: any) =>
                  (v !== '' && v !== null) || 'Este campo es requerido',
                (v: any) => Number(v) >= 0 || 'Debe ser mayor o igual a 0',
              ]"
            />
          </VCol>
          <VCol cols="12" sm="6">
            <VCheckbox
              v-model="form.is_required_enrollment_payment"
              label="Requiere pago de matrícula"
              color="primary"
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
