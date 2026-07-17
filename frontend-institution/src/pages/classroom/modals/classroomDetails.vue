<script setup lang="ts">
import { VSkeletonLoader } from "vuetify/labs/VSkeletonLoader";
import { ToastService } from "@/common/util/toast.service";
import { ClassroomService } from "@/services/classroom.service";
import ModalBasic from "@/common/components/Modal.vue";
import type { ClassroomDetail } from "@/models/classroom";

const props = defineProps<{
  modelValue: boolean;
  classroomId: number | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const isLoading = ref(false);
const detail = ref<ClassroomDetail | null>(null);
const pendingFile = ref<File | null>(null);
const previewUrl = ref<string | null>(null);
const isSavingImage = ref(false);
const fileInputRef = ref<HTMLInputElement | null>(null);

const openFilePicker = () => fileInputRef.value?.click();

const onFileSelected = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  pendingFile.value = file;
  previewUrl.value = URL.createObjectURL(file);
  // reset so same file can be re-selected
  input.value = "";
};

const saveImage = () => {
  if (!pendingFile.value || !detail.value) return;
  isSavingImage.value = true;
  ClassroomService.uploadImage(detail.value.id, pendingFile.value)
    .then(() => {
      ToastService.success("Imagen actualizada correctamente");
      if (detail.value && previewUrl.value) {
        detail.value.image = previewUrl.value;
      }
      pendingFile.value = null;
      previewUrl.value = null;
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      isSavingImage.value = false;
    });
};

const loadDetail = () => {
  if (!props.classroomId) return;
  isLoading.value = true;
  detail.value = null;
  ClassroomService.getDetail(props.classroomId)
    .then((response) => {
      detail.value = response.data;
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      isLoading.value = false;
    });
};

watch(
  () => props.modelValue,
  (val) => {
    if (val) loadDetail();
    else {
      detail.value = null;
      pendingFile.value = null;
      previewUrl.value = null;
    }
  },
);

const close = () => {
  isOpen.value = false;
};
</script>

<template>
  <ModalBasic :visible="isOpen" width="620px">
    <VCard>
      <VCardTitle class="pa-4 d-flex align-center justify-space-between">
        <span>Detalle de clase</span>
        <VBtn icon size="small" variant="text" @click="close">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>
      <VDivider />

      <VCardText class="pa-4">
        <!-- Loading skeleton -->
        <template v-if="isLoading">
          <VSkeletonLoader v-for="value in 5" :key="value" type="list-item-two-line" class="mb-2" />
          <VSkeletonLoader type="list-item" />
        </template>

        <template v-else-if="detail">
          <!-- hidden file input -->
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            style="display: none"
            @change="onFileSelected"
          />

          <div class="d-flex flex-column align-center mb-4">
            <div class="image-wrapper mb-2" style="width: 100%">
              <VImg
                v-if="previewUrl || detail.image"
                :src="previewUrl ?? detail.image!"
                height="160"
                width="100%"
                cover
                rounded="lg"
              />
              <div
                v-else
                class="d-flex align-center justify-center bg-primary rounded-lg"
                style="height: 160px; width: 100%"
              >
                <VIcon icon="tabler-chalkboard" size="56" color="white" />
              </div>
            </div>

            <!-- image action buttons -->
            <div class="d-flex gap-2 mb-4">
              <VBtn
                size="small"
                variant="tonal"
                color="primary"
                prepend-icon="tabler-photo"
                @click="openFilePicker"
              >
                Cambiar imagen
              </VBtn>
              <VBtn
                v-if="pendingFile"
                size="small"
                variant="tonal"
                color="success"
                prepend-icon="tabler-device-floppy"
                :loading="isSavingImage"
                @click="saveImage"
              >
                Guardar imagen
              </VBtn>
            </div>

            <h2 class="text-h6 font-weight-bold text-center">{{ detail.course }}</h2>
          </div>

          <VDivider class="mb-4" />

          <VRow dense>
            <VCol cols="12" sm="6">
              <div class="info-row">
                <span class="text-caption text-medium-emphasis">Docente</span>
                <span class="text-body-2 font-weight-medium">
                  {{ detail.teacher ?? 'Sin asignar' }}
                </span>
              </div>
            </VCol>
            <VCol cols="12" sm="3">
              <div class="info-row">
                <span class="text-caption text-medium-emphasis">Ciclo</span>
                <span class="text-body-2 font-weight-medium">{{ detail.cycle }}</span>
              </div>
            </VCol>
            <VCol cols="12" sm="3">
              <div class="info-row">
                <span class="text-caption text-medium-emphasis">Estudiantes</span>
                <span class="text-body-2 font-weight-medium">{{ detail.students }}</span>
              </div>
            </VCol>
          </VRow>
        </template>
      </VCardText>

      <VDivider />
      <VCardActions class="pa-4 d-flex justify-end">
        <VBtn variant="tonal" color="secondary" @click="close">Cerrar</VBtn>
      </VCardActions>
    </VCard>
  </ModalBasic>
</template>

<style scoped>
.info-row {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 0;
}
</style>
