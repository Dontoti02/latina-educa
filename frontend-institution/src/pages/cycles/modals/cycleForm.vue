<script setup lang="ts">
import { ToastService } from "@/common/util/toast.service";
import { CycleService } from "@/services/cycle.service";
import { CycleItem } from "@/models/cycle";
import ModalBasic from "@/common/components/Modal.vue";

const props = defineProps<{
  modelValue: boolean;
  item?: CycleItem | null;
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

const form = ref<{ name: string }>({
  name: "",
});

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

const romanRegex = /^M{0,4}(CM|CD|D?C{0,3})(XC|XL|L?X{0,3})(IX|IV|V?I{0,3})$/i;

const isFormValid = computed(
  () => !!form.value.name.trim() && romanRegex.test(form.value.name.trim()),
);

const close = () => {
  isOpen.value = false;
};

const onSubmit = () => {
  if (!isFormValid.value) return;

  isLoading.value = true;

  const payload = { name: form.value.name.trim() };

  const request = isEditMode.value
    ? CycleService.update(props.item!.id, payload)
    : CycleService.create(payload);

  const successMessage = isEditMode.value
    ? "Ciclo actualizado correctamente"
    : "Ciclo creado correctamente";

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
        {{ isEditMode ? "Editar ciclo" : "Nuevo ciclo" }}
      </VCardTitle>
      <VDivider />
      <VCardText class="pa-4">
        <VRow>
          <VCol cols="12">
            <VTextField
              v-model="form.name"
              label="Número de ciclo *"
              hint="Escriba en números romanos p.e. I, V, VI, X"
              persistent-hint
              :rules="[
                (v: any) => !!v?.trim() || 'El nombre es requerido',
                (v: any) =>
                  romanRegex.test(v?.trim()) ||
                  'Debe ser un número romano válido (ej: I, IV, IX)',
              ]"
              @keypress="
                (e: KeyboardEvent) => {
                  if (!/[ivxlcdmIVXLCDM]/.test(e.key)) e.preventDefault();
                }
              "
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
