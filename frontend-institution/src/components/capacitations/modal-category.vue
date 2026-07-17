<script setup lang="ts">
import AppTextField from "@/@core/components/app-form-elements/AppTextField.vue";
import {
  requiredValidator,
} from "@/@core/utils/validators";
import ModalBasic from "@/common/components/Modal.vue";
import { ToastService } from "@/common/util/toast.service";
import { CapacitationService } from "@/services/capacitations.service";
import {
  VBtn,
  VCard,
  VCardActions,
  VCardText,
  VCol,
  VForm,
  VRow,
  VSpacer,
} from "vuetify/lib/components/index.mjs";
import { load } from "webfontloader";

const props = defineProps<{
  show: boolean;
  categoryId?: number;
}>();

const emits = defineEmits<{
  (e: "close"): void;
  (e: "submit", formBody: {
    id: number | null,
    name: string | null
  }): void;
}>();

const form = ref<{
  id : number | null,
  name:string | null
}>({
  id : null,
  name: null

});
const formValue = ref();

const loading = ref(false);

const title = computed(() => {
  return form.value.id ? "Editar Categoría" : "Crear Categoría";
});

const submit = async () => {
  loading.value = true;
  const { valid } = await formValue.value.validate();
  
  if (!valid) {
    loading.value = false;
    return;
  };

  const {success, data } = await CapacitationService.saveCategory({
    id: form.value.id!,
    name: form.value.name!,
  });

  loading.value = false;

  if (!success)  {
    ToastService.error("Ocurrió un error al guardar la categoría");
    return;
  }

  ToastService.success("Categoría guardada correctamente");
  emits("submit", data);
};

onMounted(() => {});
</script>

<template>
  <ModalBasic :visible="props.show" is-persistent width="600" is-scrollable>
    <VForm ref="formValue" @submit.prevent="submit">
      <VCard :loading="loading" :disabled="loading">
        <VToolbar>
          <div class="mx-5 mt-5">
            <VToolbarTitle>{{ title }}</VToolbarTitle>
          </div>
          <VSpacer />
          <VBtn icon @click="emits('close')">
            <VIcon>mdi-close</VIcon>
          </VBtn>
        </VToolbar>
        <VCardText class="px-4 pb-4">
          <VRow>
            <VCol cols="12">
              <AppTextField
                v-model="form.name"
                label="Nombre"
                density="compact"
                :rules="[requiredValidator]"
              />
            </VCol>
          </VRow>
        </VCardText>
        <VCardActions>
          <div class="d-flex gap-4 justify-end w-100">
            <VBtn
              class="px-4"
              color="primary"
              variant="outlined"
              text="Cancelar"
              @click="emits('close')"
            >
              Cancelar
            </VBtn>
            <VBtn
              class="px-4"
              color="primary"
              text="Crear"
              variant="flat"
              type="submit"
              :loading="loading"
            />
          </div>
        </VCardActions>
      </VCard>
    </VForm>
  </ModalBasic>
</template>
