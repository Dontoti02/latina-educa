<script setup lang="ts">
import { requiredValidator } from "@core/utils/validators";
import ModalBasic from "@/common/components/Modal.vue";
import {
  VBtn,
  VCard,
  VCardText,
  VCol,
  VForm,
  VRow,
  VSpacer,
} from "vuetify/lib/components/index.mjs";
import { CapacitationService } from "@/services/capacitations.service";
import { ToastService } from "@/common/util/toast.service";
import AppAutocomplete from "@/@core/components/app-form-elements/AppAutocomplete.vue";
import { Teacher } from "../../models/capacitations";

// Initial
const props = defineProps<{
  show: boolean;
  title: string;
  loading: boolean;
  subtitle: string;
  capacitationId: number;
}>();

const emits = defineEmits<{
  (e: "close"): void;
  (e: "openAdd"): void;
  (e: "submit", user: Teacher): void;
}>();

const userformValue = ref();

const searchLoading = ref(false);
const search = ref("");
const selectedUser = ref();
const userList = ref<Array<Teacher>>([]);
const makeSearch = ref(true);
const searchTimeout = ref<any | null>(null);

const searchUsers = async () => {
  searchLoading.value = true;
  await CapacitationService.getPeopleList(search.value)
    .then((response) => {
      if (response.success) {
        userList.value = response.data as Array<Teacher>;
      } else ToastService.error(response.message);
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      searchLoading.value = false;
    });
};

const addStudent = async () => {
  const { valid } = await userformValue.value.validate();

  if (!valid) return;

  emits("submit", selectedUser.value);
};

const debounceSearch = (value: string) => {
  if (makeSearch.value) {
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value);
    }
    searchTimeout.value = setTimeout(() => {
      search.value = value;
      makeSearch.value = true;
      searchUsers();
    }, 500);
  } else {
    makeSearch.value = true;
  }
};

// watcher for loading props
watch(
  () => props.loading,
  (value) => {
    if (!value) {
      selectedUser.value = null;
    }
  }
);
</script>

<template>
  <ModalBasic :visible="props.show" is-persistent width="600" is-scrollable>
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
        <VForm ref="userformValue" @submit.prevent="addStudent">
          <VRow class="my-0">
            <VCol class="pb-0" cols="12">
              <AppAutocomplete
                v-model="selectedUser"
                :items="userList"
                item-title="names"
                item-value="id"
                label="Nombre"
                density="compact"
                no-filter
                hide-selected
                return-object
                :loading="searchLoading"
                :rules="[requiredValidator]"
                clearable
                @update:modelValue="makeSearch = false"
                @update:search="debounceSearch($event)"
              >
                <template v-if="selectedUser" #prepend-inner>{{
                  `(${selectedUser?.document_number})`
                }}</template>
              </AppAutocomplete>

              <div class="d-flex justify-end">
                <VBtn
                  class="px-0 mt-3"
                  size="small"
                  color="primary"
                  variant="plain"
                  @click="emits('openAdd')"
                >
                  <div style="text-transform: none">
                    O da click aquí para agregar un nuevo estudiante
                  </div>
                </VBtn>
              </div>
            </VCol>
            <VCol cols="12">
              <div class="d-flex gap-3 justify-end w-100">
                <VBtn color="primary" type="submit"> Agregar </VBtn>
                <VBtn @click="emits('close')" color="secondary">
                  Cancelar
                </VBtn>
              </div>
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
    </VCard>
  </ModalBasic>
</template>
