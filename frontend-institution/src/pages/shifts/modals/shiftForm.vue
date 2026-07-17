<script setup lang="ts">
import { ToastService } from "@/common/util/toast.service";
import { ShiftService } from "@/services/shift.service";
import type { ShiftItem, ShiftPayload } from "@/models/shift";
import ModalBasic from "@/common/components/Modal.vue";

const props = defineProps<{
  modelValue: boolean;
  item?: ShiftItem | null;
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

const form = ref<ShiftPayload>({ name: "" });

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      form.value = { name: props.item?.name ?? "" };
    } else {
      form.value = { name: "" };
    }
  },
);

const isFormValid = computed(() => !!form.value.name.trim());

const close = () => {
  isOpen.value = false;
};

const onSubmit = () => {
  if (!isFormValid.value) return;

  isLoading.value = true;

  const payload: ShiftPayload = { name: form.value.name.trim() };

  const request = isEditMode.value
    ? ShiftService.update(props.item!.id, payload)
    : ShiftService.create(payload);

  const successMessage = isEditMode.value
    ? "Turno actualizado correctamente"
    : "Turno creado correctamente";

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
  <ModalBasic :visible="isOpen" max-width="500">
    <VCard>
      <VCardTitle class="pa-4">
        {{ isEditMode ? "Editar turno" : "Nuevo turno" }}
      </VCardTitle>
      <VDivider />
      <VCardText class="pa-4">
        <VRow>
          <VCol cols="12">
            <VTextField
              v-model="form.name"
              label="Nombre *"
              :rules="[(v: any) => !!v?.trim() || 'El nombre es requerido']"
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
