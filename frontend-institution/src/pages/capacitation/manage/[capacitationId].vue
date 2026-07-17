<script setup lang="ts">
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
import AppDateTimePicker from "@/@core/components/app-form-elements/AppDateTimePicker.vue";
import { CapacitationService } from "@/services/capacitations.service";
import { ToastService } from "@/common/util/toast.service";
import {
  CapacitationFilter,
  CapacitationForm,
  CapacitationUserForm,
  Teacher,
} from "@/models/capacitations";
import { positiveValidator, requiredValidator } from "@/@core/utils/validators";
import AppAutocomplete from "@/@core/components/app-form-elements/AppAutocomplete.vue";
import ModalAddUser from "@/components/capacitations/modal-add-user.vue";
import ModalCategory from "@/components/capacitations/modal-category.vue";
import { ImageUtils } from "../../../utils/images";
import BtnBack from "@/common/components/BtnBack.vue";

//Reference to enrouter
const router = useRouter();

const loading = ref(false);
const openAddTeacher = ref(false);
const loadingAddTeacher = ref(false);
const confirmationCheck = ref(false);

//Filters for the form
const categories = ref<Array<CapacitationFilter>>([]);

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

const formValue = ref();

const trainingId = ref<number>();

// Variables for teacherForm
const teacherformValue = ref();

const makeSearch = ref(true);
const auxTeacher = ref<Teacher | null>(null);

// Search Bar
const search = ref();
const searchTimeout = ref<any | null>(null);

// List of teachers
const teachersList = ref<Array<Teacher>>([]);

// Variables for image
const fileInput = ref<HTMLInputElement | null>(null);
const frontPageUrl = ref();
const frontPageFile = ref();

//Method to clear the negative numbers
const clearNegative = (value: number | null) => {
  if (!value) return null;
  if (Number(value) === 0) return 0;
  return Math.abs(Number(value)) || null;
};

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
  if (!frontPageFile.value) return;
  await CapacitationService.changeFrontPage(
    frontPageFile.value,
    trainingId.value!
  )
    .then((response) => {
      if (!response.success) ToastService.error(response.message);
    })
    .catch((error) => {
      ToastService.error(error);
    });
};

// Delete image of training
const deleteImage = async () => {
  loading.value = true;
  await CapacitationService.deleteFrontPage(trainingId.value!)
    .then((response) => {
      if (response.success) ToastService.success(response.data);
      else ToastService.error(response.message);
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      restartImage();
      loading.value = false;
    });
};

// Upload the form to the server
const createCapacitation = async () => {
  await CapacitationService.saveCapacitation(form.value)
    .then(async (response) => {
      if (response.success) {
        ToastService.success(response.message);
        trainingId.value = response.data;
        await uploadImage();
        await router.push({ path: `/capacitation/list` });
        // window.location.reload();
      } else ToastService.error(response.message);
    })
    .catch((error) => {
      ToastService.error(error);
    });
};

// Edit the capacitation to the server
const updateCapacitation = async () => {
  await CapacitationService.updateCapacitation(form.value)
    .then(async (response) => {
      if (response.success) {
        await uploadImage();
        ToastService.success(response.message);
      } else ToastService.error(response.message);
    })
    .catch((error) => {
      ToastService.error(error);
    });
};

// Create a new capacitation
const handleCapacitation = async () => {
  const { valid } = await formValue.value.validate();

  if (!valid) return;

  loading.value = true;
  if (form.value.id) await updateCapacitation();
  else await createCapacitation();
  loading.value = false;
};

// Upload the form to the server
const deleteCapacitation = async () => {
  loading.value = true;
  await CapacitationService.deleteCapacitation(form.value.id!)
    .then((response) => {
      if (response.success) {
        router.push({ path: "/capacitation/list" });
        ToastService.success(response.data);
      } else ToastService.error(response.message);
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      loading.value = false;
    });
};

// Update the teacher of the capacitation
const updateTeacher = async () => {
  const { valid } = await teacherformValue.value.validate();

  if (!valid) return;

  loading.value = true;
  await CapacitationService.updateTeacher({
    person_id: selectedTeacher.value.id,
    training_id: form.value.id!,
  })
    .then((response) => {
      if (response.success) {
        ToastService.success(response.data);
        auxTeacher.value = selectedTeacher.value;
      } else ToastService.error(response.message);
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      loading.value = false;
    });
};

// Upload the new teacher from the modal
const createNewTeacher = async (formBody: CapacitationUserForm) => {
  await CapacitationService.createPerson(formBody)
    .then((response) => {
      if (response.success) {
        ToastService.success(response.message);
        selectedTeacher.value = {
          id: response.data,
          names: formBody.names,
          document_number: formBody.document_number,
        };
        teachersList.value.push(selectedTeacher.value);
      } else ToastService.error(response.message);
    })
    .catch((error) => {
      ToastService.error(error);
    });
};

// Create a new teacher and assign to the capacitation
const saveTeacher = async (formBody: CapacitationUserForm) => {
  try {
    loadingAddTeacher.value = true;
    await createNewTeacher(formBody);
    await updateTeacher();
    loadingAddTeacher.value = false;
  } finally {
    loadingAddTeacher.value = false;
    loading.value = false;
    openAddTeacher.value = false;
  }
};

// List all the teachers by the searchbar
const searchTeachers = async () => {
  CapacitationService.getPeopleList(search.value)
    .then((response) => {
      if (response.success) {
        teachersList.value = response.data as Array<Teacher>;
      } else ToastService.error(response.message);
    })
    .catch((error) => {
      ToastService.error(error);
    });
};

const debounceSearch = (value: string) => {
  if (makeSearch.value) {
    if (searchTimeout.value) {
      clearTimeout(searchTimeout.value);
    }
    searchTimeout.value = setTimeout(() => {
      search.value = value;
      makeSearch.value = true;
      searchTeachers();
    }, 500);
  } else {
    makeSearch.value = true;
  }
};

const getCapacitationDetails = async () => {
  const param = router.currentRoute.value.params.capacitationId;

  if (param && param !== "create") {
    const capacitationId = Number(
      router.currentRoute.value.params.capacitationId
    );

    trainingId.value = capacitationId;

    await CapacitationService.getCapacitationDetails(capacitationId)
      .then((response) => {
        if (response.success) {
          form.value = response.data;
          if (response.data.image)
            frontPageUrl.value = ImageUtils.getUrlImage(response.data.image);
          if (response.data.teacher) {
            selectedTeacher.value = {
              names: response.data.teacher,
              document_number: response.data.teacher_document_number,
            };
            auxTeacher.value = selectedTeacher.value;
            teachersList.value.push(response.data.teacher);
          }
        } else {
          ToastService.error(response.message);
          router.push({ path: "/capacitation/welcome/home" });
        }
      })
      .catch((error) => {
        ToastService.error(error);
      });
  }
};

const getCapacitationFormFilters = async () => {
  await CapacitationService.getFilters()
    .then((response) => {
      if (response.success) {
        categories.value = response.data.categories;
      } else ToastService.error(response.message);
    })
    .catch((error) => {
      ToastService.error(error);
    });
};

const modalCategory = ref(false);

const openModalCategory = () => {
  modalCategory.value = true;
};

const onSubmitCategory = (formValue: { id: number; name: string }) => {
  categories.value.push(formValue);
  form.value.training_category_id = formValue.id;
  modalCategory.value = false;
};

const minStartDate = computed(() => {
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split("T")[0];
  console.log({ formattedDate });
  return formattedDate;
});

const minEndDate = computed(() => {
  return new Date(form.value.end_date!).toISOString().split("T")[0];
});

onMounted(async () => {
  loading.value = true;
  await getCapacitationFormFilters();
  await getCapacitationDetails();
  loading.value = false;
  selectedTeacher.value = auxTeacher.value;
});

const selectedTeacher = ref();
</script>
<template>
  <div>
    <VCard :loading="loading" :disabled="loading" class="pa-6 mb-6">
      <VCardTitle class="pa-0">
        <BtnBack />
        Crea una nueva capacitación
      </VCardTitle>
      <VRow class="ma-0 py-5">
        <VCol class="px-0" lg="3" sm="4" cols="12">
          <VCard v-if="!frontPageUrl" elevation="0" color="#E9E7FD" class="py-8 d-flex justify-center">
            <VIcon icon="tabler-photo" color="primary" size="44px" />
          </VCard>
          <VImg v-else class="rounded-lg" :src="frontPageUrl" height="108px" cover />
        </VCol>
        <VCol class="py-0 px-sm-3 px-0 d-flex flex-column justify-center" lg="9" sm="8" cols="12">
          <VRow class="ma-0 flex-grow-0">
            <VCol sm="auto" cols="12">
              <VBtn block @click="$refs.fileInput.click()" color="primary">
                Cargar portada
              </VBtn>
              <input ref="fileInput" type="file" style="display: none" accept="image/png, image/jpeg, image/jpg"
                @change="handleFileChange($event)" />
            </VCol>
            <VCol v-if="trainingId" sm="auto" cols="12">
              <VBtn v-if="frontPageUrl" block @click="deleteImage" color="secondary">
                Restablecer
              </VBtn>
            </VCol>
          </VRow>
          <p class="px-3">Formato permitido JPG o PNG. Tamaño máximo 5 MB</p>
        </VCol>
      </VRow>
      <VForm ref="formValue" @submit.prevent="handleCapacitation">
        <VRow>
          <VCol lg="3" md="6" cols="12">
            <AppTextField v-model="form.name" label="Nombre de la capacitacion" density="compact"
              :rules="[requiredValidator]" />
          </VCol>
          <VCol lg="3" md="6" cols="12">
            <AppTextField v-model="form.min_participants" label="Cantidad mínima de participantes" density="compact"
              type="number" @update:modelValue="
                form.min_participants = clearNegative(form.min_participants)
                " :rules="[requiredValidator]" />
          </VCol>
          <VCol lg="3" md="6" cols="12">
            <AppTextField v-model="form.max_participants" label="Cantidad máxima de participantes" density="compact"
              type="number" @update:modelValue="
                form.max_participants = clearNegative(form.max_participants)
                " :rules="[requiredValidator]" />
          </VCol>
          <VCol lg="3" md="6" cols="12">
            <AppTextField v-model="form.num_max_absences" label="Inasistencias permitidas" density="compact"
              type="number" @update:modelValue="
                form.num_max_absences = clearNegative(form.num_max_absences)
                " :rules="[requiredValidator, positiveValidator]" />
          </VCol>
          <VCol lg="3" md="6" cols="12">
            <label class="d-flex w-full justify-space-between align-center">
              <span> Categoría </span>
              <VBtn variant="text" icon class="me-1" size="30px" @click="openModalCategory()">
                <VIcon color="primary" icon="tabler-plus" size="18px" />
              </VBtn>
            </label>
            <AppSelect v-model="form.training_category_id" :items="categories" item-title="name" item-value="id"
              :rules="[requiredValidator]">
              <template> </template>
            </AppSelect>
          </VCol>
          <VCol lg="3" md="6" cols="12">
            <AppDateTimePicker v-model="form.start_date" label="Fecha de inicio"
              :config="{ minDate: 'today', maxDate: form.end_date }" prepend-inner-icon="tabler-calendar-event"
              :rules="[requiredValidator]" />
          </VCol>
          <VCol lg="3" md="6" cols="12">
            <AppDateTimePicker v-model="form.end_date" :min="minEndDate" label="Fecha de finalización"
              prepend-inner-icon="tabler-calendar-event" :config="{ minDate: form.start_date }"
              :rules="[requiredValidator]" />
          </VCol>
          <VCol cols="12">
            <AppTextField v-model="form.short_description" label="Descripción corta" density="compact"
              :rules="[requiredValidator]" />
          </VCol>
          <VCol cols="12">
            <AppTextarea v-model="form.long_description" label="Descripción larga" density="compact"
              :rules="[requiredValidator]" />
          </VCol>
          <VCol cols="auto">
            <VBtn type="submit" color="primary"> Guardar </VBtn>
          </VCol>
          <VCol cols="auto">
            <VBtn @click="router.push({ path: '/capacitation/list' })" color="secondary">
              Cancelar
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCard>
    <VCard v-if="form.id" :loading="loading" :disabled="loading" class="pa-6 mb-6">
      <VCardTitle class="pa-0 mb-1"> Agregar docente </VCardTitle>
      <VForm ref="teacherformValue" @submit.prevent="updateTeacher">
        <VRow class="my-0">
          <VCol class="pb-0" cols="12">
            <AppAutocomplete v-model="selectedTeacher" placeholder="Buscar docente" :items="teachersList"
              item-title="names" item-value="id" label="Nombre del docente" density="compact" no-filter hide-selected
              return-object :rules="[requiredValidator]" @update:modelValue="makeSearch = false"
              @update:search="debounceSearch($event)">
              <template v-if="selectedTeacher" #prepend-inner>{{
                `(${selectedTeacher?.document_number})`
                }}</template>
            </AppAutocomplete>

            <VBtn class="px-0 mt-3" size="small" color="primary" variant="plain" @click="openAddTeacher = true">
              <div style="text-transform: none">
                O da click aquí para agregar un nuevo docente
              </div>
            </VBtn>
          </VCol>
          <VCol cols="auto">
            <VBtn color="primary" type="submit"> Actualizar </VBtn>
          </VCol>
          <VCol cols="auto">
            <VBtn @click="selectedTeacher = auxTeacher" color="secondary">
              Cancelar
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
    </VCard>
    <VCard v-if="form.id" :loading="loading" :disabled="loading" class="pa-6 mb-6">
      <VCardTitle class="pa-0 mb-1"> Eliminar capacitación </VCardTitle>
      <VRow class="my-0">
        <VCol cols="12">
          <VCard color="#FFF0E1" elevation="0" class="py-3">
            <VCardTitle style="color: #ff9f43" class="py-0">¿Estás seguro que deseas eliminar esta capacitación?
            </VCardTitle>
            <VCardSubtitle style="color: #ff9f43">Una vez eliminada la capacitación, no podrás volver atrás. Por
              favor confirma la eliminación.
            </VCardSubtitle>
          </VCard>
        </VCol>
        <VCol cols="12" class="py-0">
          <VCheckbox v-model="confirmationCheck" label="Confirmo la eliminación de la capacitación" />
        </VCol>
        <VCol cols="auto">
          <VBtn :disabled="!confirmationCheck" @click="deleteCapacitation" color="error">
            Eliminar capacitación
          </VBtn>
        </VCol>
      </VRow>
    </VCard>
    <ModalAddUser v-if="openAddTeacher" :show="openAddTeacher" :loading="loadingAddTeacher" title="Agregar docente"
      subtitle="Completa el formulario para añadir un nuevo docente a la plataforma" type="teacher"
      @close="openAddTeacher = false" @submit="saveTeacher" />

    <ModalCategory v-if="modalCategory" :show="modalCategory" @close="modalCategory = false"
      @submit="(form) => onSubmitCategory(form as any)" />
  </div>
</template>
<style scoped lang="css"></style>

<route lang="yaml">
meta:
  action: read
  subject: ManageCapacitation
</route>
