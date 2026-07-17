<script setup lang="ts">
import { ToastService } from "@/common/util/toast.service";
import { StudyPlanTypeService } from "@/services/study-plan.service";
import { StudyPlanTypeItem } from "@/models/study-plan";
import ModalBasic from "@/common/components/Modal.vue";

const props = defineProps<{
  modelValue: boolean;
  item?: StudyPlanTypeItem | null;
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

const form = ref<{
  id?: number;
  name: string;
}>({
  name: "",
});

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      form.value = {
        id: props.item?.id,
        name: props.item?.name ?? "",
      };
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

  const payload = { name: form.value.name.trim() };

  const request = isEditMode.value
    ? StudyPlanTypeService.update(props.item!.id, payload)
    : StudyPlanTypeService.create(payload);

  const successMessage = isEditMode.value
    ? "Tipo de plan de estudio actualizado correctamente"
    : "Tipo de plan de estudio creado correctamente";

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
        {{
          isEditMode
            ? "Editar tipo de plan de estudio"
            : "Nuevo tipo de plan de estudio"
        }}
      </VCardTitle>
      <VDivider />
      <VCardText class="pa-4">
        <VRow>
          <VCol cols="12">
            <VTextField
              v-model="form.name"
              label="Nombre"
              :rules="[(v: any) => !!v || 'El nombre es requerido']"
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
