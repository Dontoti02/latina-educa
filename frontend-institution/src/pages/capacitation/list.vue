<script setup lang="ts">
import { SessionStore } from "@/common/store";
import { ToastService } from "@/common/util/toast.service";
import ListTemplate from "@/components/capacitations/list-template.vue";
import {
  CapacitationsList,
  CapacitationsListRequest,
  FilterModel,
} from "@/models/capacitations";
import { SessionDTO } from "@/models/login";
import { CapacitationService } from "@/services/capacitations.service";

//Reference to enrouter
const router = useRouter();

//Text for the template
const studentTextTemplate = ref({
  title: `Descubre todas las capacitaciones que tenemos para ti. 
        <label style="color: #7367f0">Todo en un solo lugar.</label>`,
  description: `Mejora tus habilidades, certificate e impulsa tu carrera profesional gracias
              a las capacitaciones que te ofrecemos, descubre todo el conocimiento
              que la plataforma tiene para ti.`,
});

const adminTextTemplate = ref({
  title: `Administra todas las capacitaciones que hay en la plataforma.
        <label style="color: #7367f0">Todo en un solo lugar. </label>`,
  description: `Crea, edita y elimina las capacitaciones disponibles en la
              plataforma, descubre las herramientas para hacerlo y ofrece las
              capacitaciones más solicitadas en el mundo profesional.`,
});

//Const for the body of the request
const bodyCapacitations = ref<CapacitationsListRequest>({
  page: 1,
  size: 10,
  search: "",
  only_completed: false,
  training_category_id: null,
});

//Roles Variables
const user = ref<SessionDTO | null>(null);
const sessionStore = SessionStore();

//Loading state
const loading = ref(true);

//Data variable, contains the list of capacitations
const capacitationsList = ref<CapacitationsList>();

//Data variable, contains the list of filters
const filters = ref<Array<FilterModel>>([]);

//Is admin flag
const isAdmin = ref(false);

//Function to get the list of filters and admin flag
const getFilters = async () => {
  await CapacitationService.getFilters().then((response) => {
    filters.value = response.data.categories;
    isAdmin.value = response.data.is_admin;
  });
};

//Function to get the list of capacitations, paginated, searched, filtered by category and status
const getCapacitationsList = async () => {
  loading.value = true;
  CapacitationService.getCapacitationsList(bodyCapacitations.value)
    .then((response) => {
      if (response.success) {
        capacitationsList.value = response.data;
      } else ToastService.error(response.message);
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      loading.value = false;
    });
};

const init = async () => {
  loading.value = true;
  try {
    await getFilters();
    await getCapacitationsList();
  } catch (error) {
    ToastService.error("Ocurrió un error al cargar la información");
    loading.value = false;
  }
  loading.value = false;
};

//Function to emit the certification of the selected capacitation
const certification = (capacitationId: number) => {
  console.log(capacitationId);
};

//Function to search a capacitation
const search = (search: string) => {
  bodyCapacitations.value.search = search;
  getCapacitationsList();
};

//Function to hide the completed capacitations
const hideCompleted = (hide: boolean) => {
  bodyCapacitations.value.only_completed = hide;
  getCapacitationsList();
};

//Function to filter by category
const category = (category: number) => {
  bodyCapacitations.value.training_category_id = category;
  getCapacitationsList();
};

//Function to change the page
const changePage = (page: number) => {
  bodyCapacitations.value.page = page;
  getCapacitationsList();
};

//Mounted hook
onMounted(async () => {
  init();
});
</script>
<template>
  <div>
    <ListTemplate
      :text="isAdmin ? adminTextTemplate : studentTextTemplate"
      :isAdmin="isAdmin"
      :capacitations-list="capacitationsList"
      :loading="loading"
      :filters="filters!"
      @certification="certification($event)"
      @hide-completed="hideCompleted"
      @search="search"
      @category="category"
      @changePage="changePage"
    />
  </div>
</template>
<style scoped lang="css"></style>

<route lang="yaml">
meta:
  action: read
  subject: AdminCapacitationList
</route>
