<script setup lang="ts">
import { ToastService } from "@/common/util/toast.service";
import { StudyProgramService } from "@/services/study-program.service";
import { StudyProgramItem } from "@/models/study-program";
import ModalBasic from "@/common/components/Modal.vue";

const props = defineProps<{
  modelValue: boolean;
  item?: StudyProgramItem | null;
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
const productiveFamilies = ref<Array<{ id: number; name: string }>>([]);
const isLoadingFamilies = ref(false);

const form = ref<{
  id?: number;
  productive_family_id: number | null;
  name: string;
}>({
  productive_family_id: null,
  name: "",
});

const loadProductiveFamilies = () => {
  isLoadingFamilies.value = true;
  StudyProgramService.getFormParams()
    .then((response) => {
      productiveFamilies.value = response.data.productive_families;
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      isLoadingFamilies.value = false;
    });
};

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      form.value = {
        id: props.item?.id,
        productive_family_id: props.item?.productive_family_id ?? null,
        name: props.item?.name ?? "",
      };
      loadProductiveFamilies();
    } else {
      form.value = {
        productive_family_id: null,
        name: "",
      };
    }
  },
);

const isFormValid = computed(
  () => !!form.value.name.trim() && form.value.productive_family_id !== null,
);

const close = () => {
  isOpen.value = false;
};

const onSubmit = () => {
  if (!isFormValid.value) return;

  isLoading.value = true;

  const payload = {
    productive_family_id: form.value.productive_family_id!,
    name: form.value.name.trim(),
  };

  const request = isEditMode.value
    ? StudyProgramService.update(props.item!.id, payload)
    : StudyProgramService.create(payload);

  const successMessage = isEditMode.value
    ? "Programa de estudio actualizado correctamente"
    : "Programa de estudio creado correctamente";

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
      <VToolbar flat color="primary" class="text-white">
        <VToolbarTitle>
          {{
            isEditMode
              ? "Editar programa de estudio"
              : "Nuevo programa de estudio"
          }}
          <VSpacer />
        </VToolbarTitle>
      </VToolbar>

      <VDivider />

      <VCardText class="pt-4">
        <VRow>
          <VCol cols="12">
            <VTextField
              v-model="form.name"
              label="Nombre"
              :rules="[(v: string) => !!v?.trim() || 'El nombre es requerido']"
              autofocus
              @keyup.enter="onSubmit"
            />
          </VCol>
          <VCol cols="12">
            <VSelect
              v-model="form.productive_family_id"
              label="Familia Productiva"
              :items="productiveFamilies"
              item-title="name"
              item-value="id"
              :loading="isLoadingFamilies"
              :rules="[
                (v: any) => v !== null || 'La familia productiva es requerida',
              ]"
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
