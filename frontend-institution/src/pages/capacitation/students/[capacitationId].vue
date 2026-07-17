<script setup lang="ts">
import AppTextField from "@/@core/components/app-form-elements/AppTextField.vue";
import { ToastService } from "@/common/util/toast.service";
import ModalAddUser from "@/components/capacitations/modal-add-user.vue";
import ModalEnableStudent from "@/components/capacitations/modal-enable-student.vue";
import ModalSearchStudent from "@/components/capacitations/modal-search-student.vue";
import {
  CapacitationUserForm,
  ListStudentsBody,
  Pagination,
  StudentsSummary,
  Users,
} from "@/models/capacitations";
import { CapacitationService } from "@/services/capacitations.service";
import { downloadFile } from "@/utils/file-utils";
import {
  VAvatar,
  VCard,
  VCardTitle,
  VDivider,
  VExpansionPanel,
  VExpansionPanels,
  VExpansionPanelText,
  VExpansionPanelTitle,
  VIcon,
  VMenu,
  VPagination,
  VSelect,
} from "vuetify/lib/components/index.mjs";
import { VDataTable, VSkeletonLoader } from "vuetify/lib/labs/components.mjs";
import { CapacitationForm } from "../../../models/capacitations";
import BtnBack from "@/common/components/BtnBack.vue";
import { ref } from "vue";
import {
  ParticipantStateEnum,
  TrainingStateEnum,
} from "@/common/enum/participant-state.enum";

//SearchTimeout
const searchTimeout = ref<any | null>(null);

//Reference to enrouter
const router = useRouter();

// Capacitation ID
const capacitationId = ref<number | null>(null);

//Show modals
const showSearchModal = ref(false);
const showAddStudent = ref(false);
const showEnableStudent = ref(false);

//General Loading
const loading = ref(true);

//General Loading
const loadingTable = ref(true);

// Loading for the modals
const loadingCreateStudent = ref(false);
const loadingAddStudent = ref(false);
const loadingEnableStudent = ref(false);

// Summary items for the card
const summary = ref<StudentsSummary>();

//Training id
const trainingId = ref<number | null>(null);

const textBtnActionModal = ref<string>("");
// Filters list
const rolesList = ref<Array<{ key?: string; name: string }>>([]);
const statuskeyst = ref<Array<{ key: string | null; name: string }>>([]);

//Data for the table
const students = ref<Array<Users>>();

// Pagination variable
const pagination = ref<Pagination>({
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 10,
});

//Body request
const requestBody = ref<ListStudentsBody>({
  page: pagination.value.currentPage,
  size: pagination.value.itemsPerPage,
  training_id: trainingId.value!,
  search: "",
  status: null,
});

const capacitationDetail = ref<CapacitationForm>();

// Filters
const filters = ref({
  role: null,
  status: null,
  search: "",
  show: 10,
});

// Summary texts
const summaryItems = ref<
  Array<{
    title: string;
    icon: string;
    key: keyof StudentsSummary;
    color: string;
  }>
>([
  {
    title: "Usuarios internos",
    icon: "tabler-user",
    key: "internal_users",
    color: "success",
  },
  {
    title: "Usuarios externos",
    icon: "tabler-user",
    key: "external_users",
    color: "warning",
  },
  {
    title: "Usuarios totales",
    icon: "tabler-user",
    key: "total_users",
    color: "primary",
  },
]);

// Headers for the table
const headers = ref([
  { title: "NOMBRES", key: "names" },
  { title: "DNI", key: "document_number", align: "center", sortable: false },
  { title: "FALTAS", key: "absences", align: "center", sortable: false },
  {
    title: "TIPO USUARIO",
    key: "is_internal",
    align: "center",
    sortable: false,
  },
  { title: "ESTADO", key: "status", align: "center", sortable: false },
  { title: "", key: "actions", sortable: false },
]);

const titleAssignedParticipant = ref<string>("");
const subtitleAssignedParticipant = ref<string>("");

const dictionaryState: {
  [key: string]: string;
} = {
  [ParticipantStateEnum.ACTIVE]: "Activo",
  [ParticipantStateEnum.SUSPENDED]: "Suspendido",
  [ParticipantStateEnum.RETIRED]: "Retirado",
};

const retiredStudent = (userId: number) => {
  titleAssignedParticipant.value = "Retirar estudiante";
  subtitleAssignedParticipant.value =
    "¿Estás seguro de retirar a este estudiante de la capacitación?";
  studentEnablingId.value = userId;
  showEnableStudent.value = true;
  textBtnActionModal.value = "Retirar";
};

const activedStudent = (userId: number) => {
  titleAssignedParticipant.value = "Habilitar estudiante";
  subtitleAssignedParticipant.value =
    "¿Estás seguro de habilitar a este estudiante de la capacitación?";
  studentEnablingId.value = userId;
  showEnableStudent.value = true;
  textBtnActionModal.value = "Habilitar";
};

// Get training id from the route
const getTrainingId = () => {
  const param = router.currentRoute.value.params.capacitationId;

  if (param) {
    trainingId.value = Number(router.currentRoute.value.params.capacitationId);
    requestBody.value.training_id = trainingId.value;
  }
};

// Get filters for the search
const getfilters = async () => {
  await CapacitationService.getCapacitationStudentsFilters()
    .then((response) => {
      if (response.success) {
        rolesList.value = response.data.roles;
        statuskeyst.value = [
          {
            key: null,
            name: "Todos",
          },
          ...response.data.status,
        ];
      } else {
        ToastService.error(response.message);
        router.push({ path: "/capacitation/welcome/home" });
      }
    })
    .catch((error) => {
      ToastService.error(error);
    });
};

// Download the certificate of the student
const downloadCertificate = async (userId: number) => {
  loading.value = true;
  await CapacitationService.downloadCertificate(trainingId.value!, userId)
    .then((response) => {
      downloadFile(response);
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      loading.value = false;
    });
};

// Get Data for the table
const getCapacitationStudents = async () => {
  if (!trainingId.value) {
    router.push({ path: "/capacitation/list" });
    return;
  }
  loadingTable.value = true;
  await CapacitationService.getCapacitationStudents(requestBody.value)
    .then((response) => {
      if (response.success) {
        summary.value = response.data.summary;
        summary.value.total_users =
          response.data.summary.external_users +
          response.data.summary.internal_users;
        students.value = response.data.data;
        pagination.value = {
          currentPage: response.data.page,
          itemsPerPage: response.data.size,
          totalItems: response.data.total,
        };
      } else {
        ToastService.error(response.message);
        router.push({ path: "/capacitation/welcome/home" });
      }
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      loadingTable.value = false;
    });
};

// Download the students list
const downloadStudents = async () => {
  loading.value = true;
  await CapacitationService.downloadCapacitationStudents({
    training_id: requestBody.value.training_id,
    search: requestBody.value.search,
    status: requestBody.value.status!,
  })
    .then((response) => {
      downloadFile(response);
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      loading.value = false;
    });
};

// Download all the certificates
const downloadAllCertificates = async () => {
  loading.value = true;
  await CapacitationService.downloadAllCertificates(
    requestBody.value.training_id
  )
    .then((response) => {
      downloadFile(response);
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      loading.value = false;
    });
};

const newStudentId = ref<number | null>(null);
// Create a new user on the app
const createNewStudent = async (formBody: CapacitationUserForm) => {
  loadingCreateStudent.value = true;
  await CapacitationService.createPerson(formBody)
    .then((response) => {
      if (response.success) {
        newStudentId.value = response.data;
      } else ToastService.error(response.message);
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      loadingCreateStudent.value = false;
    });
};

// Add the student to the capacitation
const addStudent = async (userId: number) => {
  loadingCreateStudent.value = true;
  await CapacitationService.addStudent({
    training_id: trainingId.value!,
    person_id: userId,
  })
    .then((response) => {
      if (response.success) {
        ToastService.success(response.message);
        getCapacitationStudents();
      } else ToastService.error(response.message);
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      loadingCreateStudent.value = false;
    });
};

// Create a new student and assign to the capacitation (createNewStudent + addStudent)
const saveStudent = async (formBody: CapacitationUserForm) => {
  try {
    loadingAddStudent.value = true;
    await createNewStudent(formBody);
    await addStudent(newStudentId.value!);
    loadingAddStudent.value = false;
  } finally {
    loadingAddStudent.value = false;
    loading.value = false;
    showAddStudent.value = false;
  }
};

const removeStudent = async (userId: number) => {
  loadingTable.value = true;
  await CapacitationService.removeStudent({
    training_id: trainingId.value!,
    person_id: userId,
  })
    .then((response) => {
      if (response.success) {
        ToastService.success(response.message);
        getCapacitationStudents();
      } else ToastService.error(response.message);
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      loadingTable.value = false;
    });
};

// Enable the student to the capacitation
const studentEnablingId = ref<number | null>(null);
const enableStudent = async (justification: string) => {
  loadingTable.value = true;
  await CapacitationService.enableStudent({
    training_id: trainingId.value!,
    person_id: studentEnablingId.value!,
    justification,
  })
    .then((response) => {
      if (response.success) {
        ToastService.success(response.message);
        getCapacitationStudents();
      } else ToastService.error(response.message);
    })
    .catch((error) => {
      loading.value = false;
      ToastService.error(error);
    })
    .finally(() => {
      loadingTable.value = false;
      showEnableStudent.value = false;
    });
};

const init = async () => {
  getTrainingId();
  loading.value = true;
  await getCapacitationDetail();
  await getfilters();
  await getCapacitationStudents();
  loading.value = false;
};

const getCapacitationDetail = async () => {
  await CapacitationService.getCapacitationDetails(trainingId.value!)
    .then(({ data, success }) => {
      if (success) {
        capacitationDetail.value = data;
      }
    })
    .catch((error) => {
      ToastService.error(error);
    });
};

const debounceSearch = (value: string) => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
  searchTimeout.value = setTimeout(() => {
    requestBody.value.search = value;
    getCapacitationStudents();
  }, 500);
};

onMounted(() => {
  init();
});
</script>
<template>
  <div v-if="loading" class="mt-4 w-100 d-flex justify-center rounded-lg">
    <VRow>
      <VCol v-for="index in 4" :key="index" cols="12" sm="6" md="3">
        <VSkeletonLoader class="w-100 gap-4" type="article" />
      </VCol>
      <VCol cols="12">
        <VSkeletonLoader class="w-100 gap-4" type="table" />
      </VCol>
    </VRow>
  </div>
  <div v-else>
    <VCard
      :loading="loading"
      :disabled="loading"
      class="pa-6 mb-6 d-md-block d-none"
    >
      <VCardTitle class="d-flex gap-4 px-0 py-2">
        <BtnBack />
        <h2>
          {{ capacitationDetail?.name }}
        </h2>
      </VCardTitle>
      <VRow class="my-0 mt-2">
        <template
          v-for="(item, index) in summaryItems"
          :key="`summary-item-${index}`"
        >
          <VCol
            class="d-flex justify-space-between align-center"
            md="4"
            sm="6"
            cols="12"
          >
            <div>
              <h2 class="text-h3">{{ summary![item.key] }}</h2>
              <p class="mb-0">{{ item.title }}</p>
            </div>
            <VAvatar :color="item.color" rounded="sm">
              <VIcon :icon="item.icon" />
            </VAvatar>
          </VCol>
          <VDivider v-if="index < summaryItems.length - 1" vertical />
        </template>
      </VRow>
    </VCard>
    <VExpansionPanels class="mb-6 d-md-none d-block">
      <VExpansionPanel class="pa-2">
        <VExpansionPanelTitle>
          <VCardTitle class="pa-0">
            <BtnBack />
            Usuarios inscritos
          </VCardTitle>
        </VExpansionPanelTitle>
        <VExpansionPanelText>
          <VRow class="my-0 mt-2">
            <template
              v-for="(item, index) in summaryItems"
              :key="`summary-item-${index}`"
            >
              <VCol
                class="d-flex justify-space-between align-center"
                md="3"
                sm="6"
                cols="12"
              >
                <div>
                  <h2 class="text-h3">{{ summary![item.key] }}</h2>
                  <p class="mb-0">{{ item.title }}</p>
                </div>
                <VAvatar :color="item.color" rounded="sm">
                  <VIcon :icon="item.icon" />
                </VAvatar>
              </VCol>
            </template>
          </VRow>
        </VExpansionPanelText>
      </VExpansionPanel>
    </VExpansionPanels>
    <VExpansionPanels class="mb-6 d-md-none d-block">
      <VExpansionPanel class="pa-2">
        <VExpansionPanelTitle>
          <VCardTitle class="pa-0">
            <BtnBack />
            Filtros
          </VCardTitle>
        </VExpansionPanelTitle>
        <VExpansionPanelText>
          <VRow class="my-0 mt-2">
            <VCol :md="true" cols="12" class="d-flex align-center">
              <VSelect
                v-model="requestBody.size"
                label="Mostrando"
                density="compact"
                :items="[10, 25, 50, 100]"
                @update:modelValue="getCapacitationStudents()"
              />
            </VCol>
            <VCol
              :md="true"
              sm="6"
              cols="12"
              order-md="2"
              order="5"
              class="d-flex align-center"
            >
              <VBtn block @click="showSearchModal = true">
                Agregar estudiante
              </VBtn>
            </VCol>
            <VCol
              :md="true"
              sm="6"
              cols="12"
              order-md="3"
              order="6"
              class="d-flex align-center"
            >
              <VBtn block variant="tonal" @click="downloadStudents">
                Descargar reporte
              </VBtn>
            </VCol>
            <VCol
              :md="true"
              sm="6"
              cols="12"
              order-md="3"
              order="6"
              class="d-flex align-center"
            >
              <VBtn block variant="tonal" @click="downloadAllCertificates">
                Descargar certificados
              </VBtn>
            </VCol>
            <VCol :md="true" sm="6" cols="12" class="d-flex align-center">
              <AppTextField
                v-model="requestBody.search"
                placeholder="Buscar..."
                density="compact"
                clearable
                @update:modelValue="debounceSearch($event)"
              />
            </VCol>
            <VCol :md="true" sm="6" cols="12" class="d-flex align-center">
              <VSelect
                v-model="requestBody.status"
                :items="statuskeyst"
                item-value="key"
                item-title="name"
                placeholder="Condición del estudiante"
                density="compact"
                clearable
                @update:modelValue="getCapacitationStudents()"
              />
            </VCol>
          </VRow>
        </VExpansionPanelText>
      </VExpansionPanel>
    </VExpansionPanels>
    <VCard :loading="loading" :disabled="loading" class="pa-6 mb-6">
      <VRow class="my-0 mt-2 d-md-flex d-none justify-space-between">
        <VCol :md="3" sm="6" cols="12" class="d-flex align-center">
          <h2>Usuarios inscritos</h2>
        </VCol>

        <VCol :md="9" sm="6" cols="12" class="d-flex align-center justify-end">
          <VCol :lg="3" :md="4" sm="6" cols="12" class="d-flex align-center">
            <VBtn block @click="showSearchModal = true">
              Agregar estudiante
            </VBtn>
          </VCol>
          <VCol :lg="3" :md="4" sm="6" cols="12" class="d-flex align-center">
            <VBtn block variant="tonal" @click="downloadStudents">
              Descargar reporte
            </VBtn>
          </VCol>

          <VCol :lg="3" :md="4" sm="6" cols="12" class="d-flex align-center">
            <VBtn block variant="tonal" @click="downloadAllCertificates">
              Descargar certificados
            </VBtn>
          </VCol>
        </VCol>
      </VRow>
      <VRow class="my-0 mt-2 d-md-flex d-none">
        <VCol :md="2" cols="12" class="d-flex align-center">
          <VSelect
            v-model="requestBody.size"
            label="Mostrando"
            density="compact"
            :items="[10, 25, 50, 100]"
            @update:modelValue="getCapacitationStudents()"
          />
        </VCol>

        <VCol :md="3" sm="4" cols="12" class="d-flex align-center">
          <VSelect
            v-model="requestBody.status"
            :items="statuskeyst"
            item-value="key"
            item-title="name"
            placeholder="Condición del estudiante"
            density="compact"
            clearable
            @update:modelValue="getCapacitationStudents()"
          />
        </VCol>

        <VCol :md="true" sm="4" cols="12" class="d-flex align-center">
          <AppTextField
            v-model="requestBody.search"
            placeholder="Buscar..."
            density="compact"
            clearable
            @update:modelValue="debounceSearch($event)"
          />
        </VCol>
      </VRow>
      <VDataTable
        hide-default-footer
        :items="students"
        :headers="headers"
        :items-per-page="10"
        :loading="loadingTable"
      >
        <template #item.names="{ item }">
          <div class="d-flex align-center">
            <VAvatar color="success" class="mr-2">
              <VIcon icon="tabler-user" size="24" />
            </VAvatar>
            <div>
              <p class="mb-0 font-weight-bold">
                <span class=""> {{ item.names }} </span><br />
                <span class="text-xs">
                  {{ item.email }}
                </span>
              </p>
              <p class="mb-0 text-caption">{{ item.role }}</p>
            </div>
          </div>
        </template>
        <template #item.is_internal="{ item }">
          {{ item.is_internal === 1 ? "Interno" : "Externo" }}
        </template>
        <template #item.status="{ item }">
          <v-chip
            variant="tonal"
            :color="
              item.status === ParticipantStateEnum.ACTIVE
                ? 'success'
                : item.status === ParticipantStateEnum.SUSPENDED
                ? 'warning'
                : 'error'
            "
          >
            {{ dictionaryState[item.status] }}
          </v-chip>
        </template>
        <template #item.actions="{ item }">
          <VMenu>
            <template v-slot:activator="{ props }">
              <v-btn
                icon="mdi-dots-vertical"
                variant="text"
                v-bind="props"
              ></v-btn>
            </template>

            <v-list>
              <v-list-item
                v-if="item.status !== ParticipantStateEnum.RETIRED"
                @click="retiredStudent(item.id)"
                link
              >
                <v-list-item-title>Retirar</v-list-item-title>
              </v-list-item>
              <v-list-item
                v-if="item.status === ParticipantStateEnum.RETIRED"
                @click="activedStudent(item.id)"
                link
              >
                <v-list-item-title>Habilitar</v-list-item-title>
              </v-list-item>
              <v-list-item
                v-if="
                  item.status === ParticipantStateEnum.ACTIVE &&
                  capacitationDetail?.status_id === TrainingStateEnum.FINISHED
                "
                link
                @click="downloadCertificate(item.id)"
              >
                <v-list-item-title>Descargar certificado</v-list-item-title>
              </v-list-item>
            </v-list>
          </VMenu>
        </template>
        <template #bottom>
          <VDivider class="mt-md-0 mt-2 d-md-block d-none" />
          <VRow class="mt-1">
            <VCol md="6" cols="12" class="d-flex align-center">
              Mostrando del
              {{ (pagination.currentPage - 1) * pagination.itemsPerPage + 1 }}
              al
              {{ pagination.currentPage * pagination.itemsPerPage }}
              de {{ pagination.totalItems }} registros
            </VCol>
            <VCol md="6" cols="12" class="d-flex justify-md-end justify-center">
              <VPagination
                v-if="pagination"
                v-model="pagination.currentPage"
                :length="
                  Math.ceil(
                    (pagination.totalItems ?? 1) /
                      (pagination.itemsPerPage ?? 1)
                  )
                "
                :total-visible="
                  $vuetify.display.xs
                    ? 1
                    : Math.ceil(
                        (pagination.totalItems ?? 1) /
                          (pagination.itemsPerPage ?? 1)
                      )
                "
                show-first-last-page
                last-icon="tabler-chevrons-right"
                first-icon="tabler-chevrons-left"
                @update:modelValue="
                  requestBody.page = pagination.currentPage;
                  getCapacitationStudents();
                "
              ></VPagination>
            </VCol>
          </VRow>
        </template>
      </VDataTable>
    </VCard>
    <ModalSearchStudent
      v-if="showSearchModal"
      :show="showSearchModal"
      :loading="loadingCreateStudent"
      title="Agregar nuevo estudiante"
      subtitle="Busque un usuario existente por DNI o crea uno nuevo"
      :capacitation-id="capacitationId!"
      @close="showSearchModal = false"
      @submit="addStudent($event.id)"
      @open-add="showAddStudent = true"
    />
    <ModalAddUser
      v-if="showAddStudent"
      :show="showAddStudent"
      :loading="loadingAddStudent"
      title="Crear nuevo usuario"
      subtitle="Completa el formulario para crear un nuevo estudiante para esta capacitación"
      type="student"
      @close="showAddStudent = false"
      @submit="saveStudent"
    />
    <ModalEnableStudent
      v-if="showEnableStudent"
      :show="showEnableStudent"
      :loading="loadingEnableStudent"
      :title="titleAssignedParticipant"
      :btnTitle="textBtnActionModal"
      :subtitle="subtitleAssignedParticipant"
      @close="showEnableStudent = false"
      @submit="enableStudent"
    />
  </div>
</template>

<route lang="yaml">
meta:
  action: read
  subject: CapacitationStudents
</route>
