<script setup lang="ts">
import AppTextarea from "@/@core/components/app-form-elements/AppTextarea.vue";
import {
  requiredValidator,
} from "@/@core/utils/validators";
import ModalBasic from "@/common/components/Modal.vue";
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

// Initial
const props = defineProps<{
  show: boolean;
  title: string;
  btnTitle: string;
  subtitle: string;
  loading: boolean;
}>();

const emits = defineEmits<{
  (e: "close"): void;
  (e: "submit", formBody: string): void;
}>();


const justification = ref();

const formValue = ref();

const submit = async () => {
  const { valid } = await formValue.value.validate();

  if (!valid) return;

  emits("submit", justification.value);
};
</script>

<template>
  <ModalBasic :visible="props.show" is-persistent width="1000" is-scrollable>
    <VForm ref="formValue" @submit.prevent="submit">
      <VCard :loading="loading" :disabled="loading">
        <VToolbar>
          <div class="mx-5 mt-5">
            <VToolbarTitle>{{ title }}</VToolbarTitle>
            <p>{{ subtitle }}</p>
          </div>
          <VSpacer />
          <VBtn icon @click="emits('close')">
            <VIcon>mdi-close</VIcon>
          </VBtn>
        </VToolbar>
        <VCardText class="px-4 pb-4">
          <VRow>
            <VCol cols="12">
              <AppTextarea
                v-model="justification"
                label="Justificación"
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
              :text="props.btnTitle"
              variant="flat"
              type="submit"
            />
          </div>
        </VCardActions>
      </VCard>
    </VForm>
  </ModalBasic>
</template>
