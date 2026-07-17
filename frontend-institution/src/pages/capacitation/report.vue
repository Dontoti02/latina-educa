<script setup lang="ts">
import { ToastService } from "@/common/util/toast.service";
import {
  CapacitationFilter,
  Pagination,
  ReportBody,
  ReportRow,
  Users,
} from "@/models/capacitations";
import router from "@/router";
import { CapacitationService } from "@/services/capacitations.service";
import { DateFormatting } from "@/utils/date-formatting";
import { downloadFile } from "@/utils/file-utils";
import {
  VAvatar,
  VCardTitle,
  VExpansionPanel,
  VExpansionPanels,
  VExpansionPanelText,
  VExpansionPanelTitle,
} from "vuetify/lib/components/index.mjs";
import { VDataTable, VSkeletonLoader } from "vuetify/lib/labs/components.mjs";
const loading = ref(false);

//SearchTimeout
const searchTimeout = ref<any | null>(null);

// Pagination variable
const pagination = ref<Pagination>({
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 10,
});

//Data for the table
const reportData = ref<Array<ReportRow>>();

// Filters
const filters = ref({
  role: null,
  status: null,
  search: "",
  show: 10,
});

//General Loading
const loadingTable = ref(true);

// Headers for the table
const headers = ref([
  { title: "CAPACITACIÓN", key: "name", sortable: false },
  { title: "INSCRITOS", key: "enrolled", align: "center", sortable: false },
  { title: "SUSPENDIDOS", key: "suspended", align: "center", sortable: false },
  { title: "APROBADOS", key: "approved", align: "center", sortable: false },
  { title: "DESAPROBADOS", key: "failed", align: "center", sortable: false },
  { title: "SESIONES", key: "sessions", align: "center", sortable: false },
  { title: "ESTADO", key: "status_name", align: "center", sortable: false },
  { title: "", key: "actions", sortable: false },
]);

const statusList = ref<Array<CapacitationFilter>>([]);

//Body request
const requestBody = ref<ReportBody>({
  page: pagination.value.currentPage,
  size: pagination.value.itemsPerPage,
  search: "",
  training_status_id: null,
});

const summary = ref();
const summaryText = ref([
  {
    title: "Inscritos",
    icon: "tabler-user",
    color: "primary",
    key: "enrolled",
  },
  {
    title: "Certificados",
    icon: "tabler-user",
    color: "secondary",
    key: "certificates",
  },
  {
    title: "Desaprobados",
    icon: "tabler-user",
    color: "success",
    key: "failed",
  },
  {
    title: "Suspendidos",
    icon: "tabler-user",
    color: "warning",
    key: "suspended",
  },
]);

// Get filters for the search
const getfilters = async () => {
  await CapacitationService.reportFilters()
    .then((response) => {
      if (response.success) {
        statusList.value = response.data.status;
      } else {
        ToastService.error(response.message);
      }
    })
    .catch((error) => {
      ToastService.error(error);
    });
};

//Get the data
const getData = async () => {
  loadingTable.value = true;
  await CapacitationService.reportList(requestBody.value)
    .then((response) => {
      if (response.success) {
        pagination.value.totalItems = response.data.total;
        reportData.value = response.data.data;
        summary.value = response.data.summary;
      } else {
        ToastService.error(response.message);
      }
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      loadingTable.value = false;
    });
};

// Download the report
const downloadReport = async () => {
  loading.value = true;
  await CapacitationService.reportDownload({
    training_status_id: requestBody.value.training_status_id,
    search: requestBody.value.search,
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

const downloadAllCertificates = async (item:ReportRow) => {
  loading.value = true;
  await CapacitationService.downloadAllCertificates(item.id)
    .then((response) => {
      console.log({response})
      downloadFile(response);
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      loading.value = false;
    });
};


const debounceSearch = () => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value);
  }
  searchTimeout.value = setTimeout(() => {
    getData();
  }, 500);
};

const formatDate = (date: string) => {
  const myDate = new Date(date);
  console.log({myDate})
  const dateFormat = DateFormatting.formatShortDayOfMonth(myDate);
  return dateFormat;
};

const init = async () => {
  loading.value = true;

  try {
    await getfilters();
    await getData();
  } catch (error) {
    ToastService.error("Ocurrió un error inesperado");
  } finally {
    loading.value = false;
  }
};

const countFilters = computed(() => {
  var count = 0;
  if (requestBody.value.search && requestBody.value.search !== "") {
    count++;
  }
  if (requestBody.value.training_status_id) {
    count++;
  }

  return count;
});

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
    <VRow class="d-md-flex d-none">
      <VCol v-for="item in summaryText" md="3" sm="6" cols="12">
        <VCard class="d-flex px-6 py-7">
          <div class="mr-auto">
            <p class="mb-0">{{ item.title }}</p>
            <div class="d-flex align-center">
              <h3 class="text-h4 font-weight-bold">
                {{ summary ? summary[item.key] : "Metrica" }}
              </h3>
              <!-- <p class="text-body-2 ml-2 mb-0">({{ item.variation }})</p> -->
            </div>
            <p class="text-caption mb-0">Total del mes</p>
          </div>
          <VAvatar :color="item.color" rounded="sm">
            <VIcon :icon="item.icon" />
          </VAvatar>
        </VCard>
      </VCol>
    </VRow>
    <VExpansionPanels class="mb-6 d-md-none d-block">
      <VExpansionPanel class="pa-2">
        <VExpansionPanelTitle>
          <VCardTitle class="pa-0"> Resumen </VCardTitle>
        </VExpansionPanelTitle>
        <VExpansionPanelText>
          <VRow class="my-0 mt-2">
            <VCol v-for="item in summaryText" md="3" sm="6" cols="12">
              <VCard class="d-flex px-6 py-7">
                <div class="mr-auto">
                  <p class="mb-0">{{ item.title }}</p>
                  <div class="d-flex align-center">
                    <h3 class="text-h4 font-weight-bold">
                      {{ summary ? summary[item.key] : "Metrica" }}
                    </h3>
                    <!-- <p class="text-body-2 ml-2 mb-0">({{ item.variation }})</p> -->
                  </div>
                  <p class="text-caption mb-0">Total del mes</p>
                </div>
                <VAvatar :color="item.color" rounded="sm">
                  <VIcon :icon="item.icon" />
                </VAvatar>
              </VCard>
            </VCol>
          </VRow>
        </VExpansionPanelText>
      </VExpansionPanel>
    </VExpansionPanels>
    <VExpansionPanels class="mb-6 d-md-none d-block">
      <VExpansionPanel class="pa-2">
        <VExpansionPanelTitle>
          <VCardTitle class="pa-0">
            Filtros
            <VChip v-if="countFilters > 0" color="error" rounded="circle">{{
              countFilters
            }}</VChip>
          </VCardTitle>
        </VExpansionPanelTitle>
        <VExpansionPanelText>
          <VRow class="my-0 mt-2">
            <VCol xl="1" md="2" sm="6" cols="12" class="d-flex align-center">
              <VSelect
                v-model="requestBody.size"
                label="Mostrando"
                density="compact"
                :items="[10, 25, 50, 100]"
                @update:modelValue="getData"
              />
            </VCol>
            <VCol
              xl="2"
              md="2"
              sm="6"
              cols="12"
              order-md="2"
              order="5"
              class="d-flex align-center"
            >
              <VBtn block @click="downloadReport"> Descargar </VBtn>
            </VCol>
            <VCol :cols="true" class="d-md-flex d-none"> </VCol>
            <VCol
              xl="2"
              lg="3"
              md="3"
              sm="6"
              cols="12"
              class="d-flex align-center"
            >
              <AppTextField
                v-model="requestBody.search"
                placeholder="Buscar..."
                density="compact"
                clearable
                @update:modelValue="debounceSearch"
              />
            </VCol>
            <VCol
              xl="2"
              lg="3"
              md="3"
              sm="6"
              cols="12"
              class="d-flex align-center"
            >
              <VSelect
                v-model="requestBody.training_status_id"
                :items="statusList"
                item-value="id"
                item-title="name"
                placeholder="Todos los estados"
                density="compact"
                clearable
                @update:modelValue="getData"
              />
            </VCol>
          </VRow>
        </VExpansionPanelText>
      </VExpansionPanel>
    </VExpansionPanels>
    <VCard
      :loading="loadingTable"
      :disabled="loadingTable"
      class="pa-6 mb-6 mt-8"
    >
      <VRow class="my-0 mt-2 d-md-flex d-none">
        <VCol xl="1" md="2" sm="6" cols="12" class="d-flex align-center">
          <VSelect
            v-model="requestBody.size"
            label="Mostrando"
            density="compact"
            :items="[10, 25, 50, 100]"
            @update:modelValue="getData"
          />
        </VCol>
        <VCol
          xl="2"
          md="2"
          sm="6"
          cols="12"
          order-md="2"
          order="5"
          class="d-flex align-center"
        >
          <VBtn block @click="downloadReport"> Descargar </VBtn>
        </VCol>
        <VCol :cols="true" class="d-md-flex d-none"> </VCol>
        <VCol xl="2" lg="3" md="3" sm="6" cols="12" class="d-flex align-center">
          <AppTextField
            v-model="requestBody.search"
            placeholder="Buscar..."
            density="compact"
            clearable
            @update:modelValue="debounceSearch"
          />
        </VCol>
        <VCol xl="2" lg="3" md="3" sm="6" cols="12" class="d-flex align-center">
          <VSelect
            v-model="requestBody.training_status_id"
            :items="statusList"
            item-value="id"
            item-title="name"
            placeholder="Todos los estados"
            density="compact"
            clearable
            @update:modelValue="getData"
          />
        </VCol>
      </VRow>
      <VDataTable
        hide-default-footer
        :items="reportData"
        :headers="headers"
        :items-per-page="10"
        :loading="loadingTable"
      >
        <template #item.name="{ item }">
          <div class="d-flex align-center my-2">
            <VAvatar color="success" variant="tonal" class="mr-2" size="32">
              <VIcon icon="tabler-school" size="20" />
            </VAvatar>
            <div>
              <p class="mb-0 font-weight-bold">{{ item.name }}</p>
              <p class="mb-0 text-body-2">
                {{
                  `Del ${item.start_date} al ${item.end_date}`
                }}
              </p>
            </div>
          </div>
        </template>
        <template #item.status_name="{ item }">
          <v-chip
            variant="tonal"
            :color="
              item.status_name === 'En curso'
                ? 'success'
                : item.status_name === 'Finalizado'
                ? 'warning'
                : 'error'
            "
          >
            {{ item.status_name }}
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
                link
                @click="router.push(`/capacitation/students/${item.id}`)"
              >
                <v-list-item-title>Ver estudiantes</v-list-item-title>
              </v-list-item>
              <v-list-item
                link
                @click="router.push(`/capacitation/manage/${item.id}`)"
              >
                <v-list-item-title>Configurar capacitación</v-list-item-title>
              </v-list-item>
              <v-list-item link @click="downloadAllCertificates(item)">
                <v-list-item-title>Descargar certificados</v-list-item-title>
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
                  getData();
                "
              ></VPagination>
            </VCol>
          </VRow>
        </template>
      </VDataTable>
    </VCard>
  </div>
</template>

<route lang="yaml">
  meta:
    action: read
    subject: ReportCapacitation
</route>
