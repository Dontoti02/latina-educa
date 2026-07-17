<script setup lang="ts">
import { VSkeletonLoader } from "vuetify/lib/labs/components.mjs";
import AppTextField from "@/@core/components/app-form-elements/AppTextField.vue";
import {
  VBtn,
  VCard,
  VCardSubtitle,
  VCardTitle,
  VCheckbox,
  VCol,
  VIcon,
  VImg,
  VRow,
} from "vuetify/lib/components/index.mjs";
import AppSelect from "@/@core/components/app-form-elements/AppSelect.vue";
import AppTextarea from "@/@core/components/app-form-elements/AppTextarea.vue";
import AppCombobox from "@/@core/components/app-form-elements/AppCombobox.vue";
import AppDateTimePicker from "@/@core/components/app-form-elements/AppDateTimePicker.vue";
import { CapacitationService } from "@/services/capacitations.service";
import { ToastService } from "@/common/util/toast.service";
import { CapacitationForm } from "@/models/capacitations";

// const props = defineProps<{
//   text: {
//     title: string;
//     description: string;
//   };
//   isAdmin: boolean;
//   loading: boolean;
//   capacitationsList?: CapacitationsList;
// }>();

// const emits = defineEmits<{
//   (e: "certification", capacitationId: number): void;
//   (e: "search", search: string): void;
//   (e: "hideCompleted", hide: boolean): void;
//   (e: "category", category: number): void;
//   (e: "add"): void;
//   (e: "changePage", page: number): void;
// }>();

//Reference to enrouter
const router = useRouter();

const loading = ref(false);

// Varible for the form
const form = ref<CapacitationForm>({
  name: null,
  training_category_id: null,
  num_max_absences: null,
  start_date: null,
  end_date: null,
  min_participants: null,
  max_participants: null,
  short_description: null,
  long_description: null,
});

// Variables for image
const fileInput = ref<HTMLInputElement | null>(null);
const frontPageUrl = ref();
const frontPageFile = ref();

// Methods for handle the image on the template
const handleFileChange = (event: any) => {
  const file = event.target?.files[0];
  if (file) {
    frontPageFile.value = file;
    frontPageUrl.value = URL.createObjectURL(file);
    event.target.value = null;
  }
};

// Restart the image on the template
const restartImage = () => {
  frontPageUrl.value = null;
  frontPageFile.value = null;
};

// Upload the image to the server
const uploadImage = async () => {
  await CapacitationService.changeFrontPage(frontPageFile.value, tra)
    .then((response) => {
      if (!response.success) ToastService.error(response.message);
    })
    .catch((error) => {
      ToastService.error(error);
    });
};

// Upload the form to the server
const uploadForm = async () => {
  await CapacitationService.saveCapacitation(form.value)
    .then((response) => {
      if (response.success) ToastService.success(response.message);
      else ToastService.error(response.message);
    })
    .catch((error) => {
      ToastService.error(error);
    });
};

// Create a new capacitation
const createCapacitation = async () => {
  loading.value = true;
  await uploadImage();
  await uploadForm();
  loading.value = false;
};
</script>
<template>
  <!-- <div v-if="loading" class="mt-4 w-100 d-flex justify-center rounded-lg">
    <VRow>
      <VCol cols="12">
        <VSkeletonLoader class="w-100 gap-4" type="image,list-item-avatar" />
      </VCol>
      <VCol v-for="index in 6" :key="index" cols="12" sm="6" md="4">
        <VSkeletonLoader class="w-100 gap-4" type="card" />
      </VCol>
    </VRow>
  </div> -->
  <div>
    <VCard :loading="loading" :disabled="loading" class="pa-6 mb-6">
      <VCardTitle class="pa-0"> Crea una nueva capacitación </VCardTitle>
      <VRow class="ma-0 py-5">
        <VCol class="px-0" lg="3" sm="4" cols="12">
          <VCard
            v-if="!frontPageUrl"
            elevation="0"
            color="#E9E7FD"
            class="py-8 d-flex justify-center"
          >
            <VIcon icon="tabler-photo" color="primary" size="44px" />
          </VCard>
          <VImg
            v-else
            class="rounded-lg"
            :src="frontPageUrl"
            height="108px"
            cover
          />
        </VCol>
        <VCol
          class="py-0 px-sm-3 px-0 d-flex flex-column justify-center"
          lg="9"
          sm="8"
          cols="12"
        >
          <VRow class="ma-0 flex-grow-0">
            <VCol sm="auto" cols="12">
              <VBtn block @click="$refs.fileInput.click()" color="primary">
                Subir portada
              </VBtn>
              <input
                ref="fileInput"
                type="file"
                style="display: none"
                accept="image/png, image/jpeg, image/jpg"
                @change="handleFileChange($event)"
              />
            </VCol>
            <VCol sm="auto" cols="12">
              <VBtn block @click="restartImage" color="secondary">
                Restablecer
              </VBtn>
            </VCol>
          </VRow>
          <p class="px-3">Formato permitido JPG o PNG. Tamaño máximo 5 MB</p>
        </VCol>
      </VRow>
      <VForm ref="refVForm" @submit.prevent="">
        <VRow>
          <VCol lg="3" md="6" cols="12">
            <AppTextField
              v-model="form.name"
              label="Nombre de la capacitacion"
              density="compact"
            />
          </VCol>
          <VCol lg="3" md="6" cols="12">
            <AppSelect
              v-model="form.training_category_id"
              label="Categoría"
              item-title="name"
              item-value="id"
            />
          </VCol>
          <VCol lg="3" md="6" cols="12">
            <AppTextField
              v-model="form.num_max_absences"
              label="Inasistencias permitidas"
              density="compact"
            />
          </VCol>
          <VCol lg="3" md="6" cols="12">
            <AppDateTimePicker
              v-model="form.start_date"
              label="Fecha de inicio2"
              prepend-inner-icon="tabler-calendar-event"
            />
          </VCol>
          <VCol lg="3" md="6" cols="12">
            <AppDateTimePicker
              v-model="form.end_date"
              label="Fecha de finalización"
              prepend-inner-icon="tabler-calendar-event"
            />
          </VCol>
          <VCol lg="3" md="6" cols="12">
            <AppTextField
              v-model="form.min_participants"
              label="Cantidad mínima de participantes"
              density="compact"
            />
          </VCol>
          <VCol lg="3" md="6" cols="12">
            <AppTextField
              v-model="form.max_participants"
              label="Cantidad máxima de participantes"
              density="compact"
            />
          </VCol>
          <VCol cols="12">
            <AppTextField
              v-model="form.short_description"
              label="Descripción corta"
              density="compact"
            />
          </VCol>
          <VCol cols="12">
            <AppTextarea
              v-model="form.long_description"
              label="Descripción larga"
              density="compact"
            />
          </VCol>
          <VCol cols="auto">
            <VBtn @click="createCapacitation" color="primary"> Guardar </VBtn>
          </VCol>
          <VCol cols="auto">
            <VBtn
              @click="router.push({ path: '/capacitation/list' })"
              color="secondary"
            >
              Cancelar
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCard>
    <VCard :loading="loading" :disabled="loading" class="pa-6 mb-6">
      <VCardTitle class="pa-0 mb-1"> Agregar docente </VCardTitle>
      <VForm ref="refVForm" @submit.prevent="">
        <VRow class="my-0">
          <VCol cols="12">
            <AppCombobox label="Nombre del docente" density="compact" />
          </VCol>
          <VCol cols="auto">
            <VBtn @click="" color="primary"> Actualizar </VBtn>
          </VCol>
          <VCol cols="auto">
            <VBtn @click="" color="secondary"> Cancelar </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCard>
    <VCard :loading="loading" :disabled="loading" class="pa-6 mb-6">
      <VCardTitle class="pa-0 mb-1"> Eliminar capacitación </VCardTitle>
      <VForm ref="refVForm" @submit.prevent="">
        <VRow class="my-0">
          <VCol cols="12">
            <VCard color="#FFF0E1" elevation="0" class="py-3">
              <VCardTitle style="color: #ff9f43" class="py-0"
                >¿Estás seguro que deseas eliminar esta
                capacitación?</VCardTitle
              >
              <VCardSubtitle style="color: #ff9f43"
                >Una vez eliminada la capacitación, no podrás volver atrás. Por
                favor confirma la eliminación.
              </VCardSubtitle>
            </VCard>
          </VCol>
          <VCol cols="12" class="py-0">
            <VCheckbox label="Confirmo la eliminación de la capacitación" />
          </VCol>
          <VCol cols="auto">
            <VBtn @click="" color="error"> Eliminar capacitación </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCard>
  </div>
</template>
<style scoped lang="css"></style>
