<script setup lang="ts">
import ModalBasic from "@/common/components/Modal.vue";
import modalService from "@/common/util/modal.service";
import { ToastService } from "@/common/util/toast.service";
import type { AcademicPeriodItem } from "@/models/academic-periods";
import { AcademicPeriodService } from "@/services/academic-period.service";
import BulbLightImg from "@images/illustrations/bulb-light.png";
import PencilRocketImg from "@images/illustrations/pencil-rocket.png";
import { VSkeletonLoader } from "vuetify/labs/VSkeletonLoader";
import EditPeriodDate from "./modals/EditPeriodDate.vue";
import PeriodForm from "./modals/PeriodForm.vue";

// Initial
const modalInfo = ref<boolean>(false);
const loading = ref(false);
const periods = ref<Array<AcademicPeriodItem>>([]);
const loadingStatus = ref<number | null>(null);
const showEditPeriodDate = ref(false);
const selectedPeriod = ref<AcademicPeriodItem | null>(null);
// Data
const getPeriods = () => {
  loading.value = true;
  AcademicPeriodService.getList()
    .then((response) => {
      periods.value = response.data;
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      loading.value = false;
    });
};

// Actions
const changeStatus = async (period: AcademicPeriodItem) => {
  const confirm = await modalService.confirmation({
    title: "Cambiar estado",
    content: `¿Está seguro de cambiar el estado del periodo académico ${period.name.value}?`,
  });

  if (!confirm) return;

  loadingStatus.value = period.id.value;
  AcademicPeriodService.toggleStatus(period.id.value)
    .then(() => {
      ToastService.success("Estado cambiado correctamente");
      getPeriods();
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      loadingStatus.value = null;
    });
};

const closePeriod = async (period: AcademicPeriodItem) => {
  const confirm = await modalService.confirmation({
    title: "Cerrar periodo",
    content: `¿Está seguro de cerrar el periodo académico ${period.name.value}?`,
  });

  if (!confirm) return;

  AcademicPeriodService.closePeriod(period.id.value)
    .then(() => {
      ToastService.success("Periodo cerrado correctamente");
      getPeriods();
    })
    .catch((error) => {
      ToastService.error(error);
    });
};

const showNewPeriodModal = ref(false);

const toggleNewPeriodModal = () => {
  showNewPeriodModal.value = !showNewPeriodModal.value;
  if (!showNewPeriodModal.value) selectedPeriod.value = null;
};

const openEditPeriod = (period: AcademicPeriodItem) => {
  selectedPeriod.value = period;
  toggleNewPeriodModal();
};

// Mounted
onBeforeMount(() => {
  getPeriods();
});
</script>

<template>
  <div>
    <div v-if="loading" class="mt-4 w-100">
      <VRow>
        <VCol cols="12">
          <VSkeletonLoader class="w-100" type="image" />
        </VCol>
        <VCol v-for="i in 6" :key="i" cols="12" sm="6" lg="4">
          <VSkeletonLoader class="w-100" type="card" indeterminate />
        </VCol>
      </VRow>
    </div>
    <template v-else>
      <div>
        <VCard>
          <VRow class="">
            <VCol cols="2" class="pl-8 pt-6">
              <img :src="BulbLightImg" height="100" />
            </VCol>
            <VCol
              cols="8"
              class="pt-6 px-8 pb-6 d-flex text-center justify-center align-center flex-column"
            >
              <h1>Periodos académicos</h1>
              <p>
                Aquí se listarán todos los periodos académicos existentes hasta
                la actualidad.
              </p>
              <VBtn
                color="primary"
                prepend-icon="mdi-plus"
                @click="toggleNewPeriodModal()"
              >
                Nuevo periodo
              </VBtn>
            </VCol>
            <VCol cols="2" class="d-flex justify-end align-end">
              <img :src="PencilRocketImg" height="100" />
            </VCol>
          </VRow>
        </VCard>
        <VSpacer />
        <div class="mt-6 pb-6 pt-2">
          <VRow>
            <VCol
              v-for="period in periods"
              :key="period.id"
              cols="12"
              sm="6"
              lg="4"
            >
              <VCard>
                <VCardTitle
                  class="pb-0 d-flex align-center justify-space-between"
                >
                  <div>
                    {{ period.name.value }}
                  </div>
                  <div v-if="period.is_current.value" class="d-flex">
                    <VBtn
                      variant="text"
                      density="compact"
                      class="text-body-2 text-capitalize d-flex align-center text-primary"
                      prepend-icon="tabler-edit"
                      :text="'Editar Periodo'"
                      :loading="loadingStatus === period.id.value"
                      @click="openEditPeriod(period)"
                    />

                    <VBtn
                      variant="text"
                      density="compact"
                      class="text-body-2 text-capitalize d-flex align-center text-primary"
                      prepend-icon="tabler-x-mark"
                      :text="'Cerrar Periodo'"
                      :loading="loadingStatus === period.id.value"
                      @click="closePeriod(period)"
                    />
                  </div>
                </VCardTitle>
                <VCardSubtitle class="pb-2 text-capitalize">
                  <v-chip
                    :color="period.is_current.value ? 'success' : 'warning'"
                    class="mb-4"
                  >
                    {{ period.is_current.value ? "ACTUAL" : "CERRADO" }}
                  </v-chip>
                  <div class="d-flex gap-4">
                    <div>Clases: {{ period.classrooms.value }}</div>
                    <div>Matrículas: {{ period.students.value }}</div>
                  </div>

                  <div>
                    Desde: {{ period.start_date.value }} hasta
                    {{ period.end_date.value }}
                  </div>
                </VCardSubtitle>
              </VCard>
            </VCol>
          </VRow>
        </div>
      </div>
    </template>
    <ModalBasic :visible="modalInfo" is-persistent width="600">
      <VCard>
        <VToolbar>
          <VToolbarTitle> Periodo académico actual</VToolbarTitle>
          <VSpacer />
          <VBtn icon @click="modalInfo = false">
            <VIcon>mdi-close</VIcon>
          </VBtn>
        </VToolbar>
        <VCardText class="py-8">
          <div class="d-flex align-center justify-center mb-4 text-warning">
            <VIcon class="mr-2"> tabler-info-circle </VIcon>
            <span class="text-warning text-h4">
              {{ periods[0].name.value }}
            </span>
          </div>
          <div class="text-justify">
            La apertura y/o cierre de un periodo académico esta determinando por
            la información que se obtiene de la importación de "REPORTE DE
            ESTUDIANTES MATRICULADOS AL XX/XX/20XX XX:XX:XX". Puede actualizar
            los periodos exportando dicho reporte desde REGISTRA e importándolo
            <RouterLink to="/configuration/importation"> aqui </RouterLink>.
          </div>
        </VCardText>
      </VCard>
    </ModalBasic>

    <PeriodForm
      :show="showNewPeriodModal"
      :period="selectedPeriod"
      @update:show="showNewPeriodModal = false"
      @saved="getPeriods()"
      @close="toggleNewPeriodModal()"
    ></PeriodForm>
  </div>
</template>

<route lang="yaml">
meta:
  action: read
  subject: AcademicPeriods
</route>
