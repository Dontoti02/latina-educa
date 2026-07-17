<script setup lang="ts">
import AppSelect from "@/@core/components/app-form-elements/AppSelect.vue";
import AppTextField from "@/@core/components/app-form-elements/AppTextField.vue";
import {
  emailValidator,
  phoneValidator,
  positiveValidator,
  requiredValidator,
} from "@/@core/utils/validators";
import ModalBasic from "@/common/components/Modal.vue";
import { CapacitationUserForm } from "@/models/capacitations";
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
  subtitle: string;
  loading: boolean;
  type: string;
}>();

const emits = defineEmits<{
  (e: "close"): void;
  (e: "submit", formBody: CapacitationUserForm): void;
}>();

const form = ref<CapacitationUserForm>({
  type: props.type,
  names: null,
  document_number: null,
  document_type: null,
  email: null,
  phone: null,
});
const formValue = ref();

const submit = async () => {
  const { valid } = await formValue.value.validate();

  if (!valid) return;

  emits("submit", form.value);
};

// Watchers
onMounted(() => {});
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
            <VCol cols="6">
              <AppTextField
                v-model="form.names"
                label="Nombres" 
                density="compact"
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol cols="6">
              <AppSelect
                v-model="form.document_type"
                label="Tipo de documento"
                :items="[`D.N.I.`]"
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol cols="6">
              <AppTextField
                v-model="form.document_number"
                label="Número de documento"
                type="number"
                density="compact"
                :rules="[requiredValidator, positiveValidator]"
              />
            </VCol>
            <VCol cols="6">
              <AppTextField
                v-model="form.email"
                label="Correo electronico"
                density="compact"
                :rules="[requiredValidator, emailValidator]"
              />
            </VCol>
            <VCol cols="6">
              <AppTextField
                v-model="form.phone"
                label="Telefono"
                type="number"
                density="compact"
                :rules="[requiredValidator, phoneValidator, positiveValidator]"
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
            />
          </div>
        </VCardActions>
      </VCard>
    </VForm>
  </ModalBasic>
</template>
