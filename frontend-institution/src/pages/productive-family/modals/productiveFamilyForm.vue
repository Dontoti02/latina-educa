<script setup lang="ts">
import { ToastService } from "@/common/util/toast.service";
import { ProductiveFamilyService } from "@/services/productive-family.service";
import { ProductiveFamilyItem } from "@/models/productive-family";
import ModalBasic from "@/common/components/Modal.vue";

const props = defineProps<{
  modelValue: boolean;
  item?: ProductiveFamilyItem | null;
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
const form = ref<{ name: string }>({ name: "" });

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      form.value.name = props.item?.name ?? "";
    } else {
      form.value.name = "";
    }
  },
);

const close = () => {
  isOpen.value = false;
};

const onSubmit = () => {
  if (!form.value.name.trim()) return;

  isLoading.value = true;

  const request = isEditMode.value
    ? ProductiveFamilyService.update(props.item!.id, {
        name: form.value.name.trim(),
      })
    : ProductiveFamilyService.create({ name: form.value.name.trim() });

  const successMessage = isEditMode.value
    ? "Familia productiva actualizada correctamente"
    : "Familia productiva creada correctamente";

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
      <VToolbar flat color="primary" class="text-white">
        <VToolbarTitle>
          {{
            isEditMode
              ? "Editar familia productiva"
              : "Nueva familia productiva"
          }}
          <VSpacer />
        </VToolbarTitle>
      </VToolbar>

      <VDivider />

      <VCardText class="pt-4">
        <VTextField
          v-model="form.name"
          label="Nombre"
          :rules="[(v: string) => !!v?.trim() || 'El nombre es requerido']"
          autofocus
          @keyup.enter="onSubmit"
        />
      </VCardText>

      <VCardActions class="pa-4 d-flex justify-end gap-3">
        <VBtn variant="tonal" color="secondary" @click="close"> Cerrar </VBtn>
        <VBtn
          color="primary"
          :loading="isLoading"
          :disabled="!form.name.trim()"
          @click="onSubmit"
        >
          Guardar
        </VBtn>
      </VCardActions>
    </VCard>
  </ModalBasic>
</template>
