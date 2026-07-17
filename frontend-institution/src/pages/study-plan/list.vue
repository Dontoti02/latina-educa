<script setup lang="ts">
import { VSkeletonLoader } from "vuetify/lib/labs/components.mjs";
import BulbLightImg from "@images/illustrations/bulb-light.png";
import PencilRocketImg from "@images/illustrations/pencil-rocket.png";
import { ToastService } from "@/common/util/toast.service";
import { modalConfirmation } from "@/common/util/modal.service";
import { StudyPlanService } from "@/services/study-plan.service";
import { StudyPlanItem, StudyPlanFormParamItem } from "@/models/study-plan";
import { VPagination } from "vuetify/lib/components/index.mjs";
import StudyPlanForm from "./modals/studyPlanForm.vue";
import AssignCourses from "./modals/assignCourses.vue";

const isLoading = ref(false);
const isSearching = ref(false);
const isModalOpen = ref(false);
const studyPrograms = ref<StudyPlanFormParamItem[]>([]);
let isInitialLoad = true;
const selectedPlan = ref<StudyPlanItem | null>(null);
const deletingId = ref<number | null>(null);
const togglingId = ref<number | null>(null);
const isAssignCoursesOpen = ref(false);
const selectedProgramId = ref<number | null>(null);

watch(isModalOpen, (val) => {
  if (!val) selectedPlan.value = null;
});

const studyPlansList = ref<StudyPlanItem[]>([]);
const totalCount = ref(0);
const requestParams = ref({
  page: 1,
  size: 10,
  search: "",
  study_program_id: null as number | null,
});

const totalPages = computed(() =>
  Math.ceil(totalCount.value / requestParams.value.size),
);

const getList = (secondary = false) => {
  if (secondary) isSearching.value = true;
  else isLoading.value = true;
  StudyPlanService.getList(requestParams.value)
    .then((response) => {
      studyPlansList.value = response.data.items;
      totalCount.value = response.data.total;
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      if (secondary) isSearching.value = false;
      else isLoading.value = false;
    });
};

onMounted(async () => {
  try {
    const res = await StudyPlanService.getStudyPlanFormParams();
    studyPrograms.value = res.data.study_programs;
    if (studyPrograms.value.length > 0) {
      requestParams.value.study_program_id = studyPrograms.value[0].id;
    }
  } catch {
    // mantener study_program_id en null
  }
  getList();
  await nextTick();
  isInitialLoad = false;
});

watch(
  () => requestParams.value.page,
  () => getList(true),
);

watch(
  () => requestParams.value.study_program_id,
  () => {
    if (isInitialLoad) return;
    requestParams.value.page = 1;
    getList(true);
  },
);

const onSearch = useDebounceFn(() => {
  requestParams.value.page = 1;
  getList(true);
}, 400);

const deleteStudyPlan = async (id: number) => {
  const confirmed = await modalConfirmation({
    title: "Eliminar plan de estudio",
    content:
      "¿Está seguro que desea eliminar este plan de estudio? Esta acción no se puede deshacer.",
  });
  if (!confirmed) return;
  deletingId.value = id;
  StudyPlanService.deleteStudyPlan(id)
    .then(() => {
      ToastService.success("Plan de estudio eliminado correctamente");
      getList(true);
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      deletingId.value = null;
    });
};

const editStudyPlan = (item: StudyPlanItem) => {
  selectedPlan.value = item;
  isModalOpen.value = true;
};

const openAssignCourses = (item: StudyPlanItem) => {
  selectedProgramId.value = item.study_program_id;
  isAssignCoursesOpen.value = true;
};

const toggleStudyPlan = (item: StudyPlanItem) => {
  togglingId.value = item.id;
  StudyPlanService.toggleStudyPlan(item.id)
    .then(() => {
      const action = item.is_active ? "desactivado" : "activado";
      ToastService.success(`Plan de estudio ${action} correctamente`);
      getList(true);
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      togglingId.value = null;
    });
};
</script>
<template>
  <div>
    <div v-if="isLoading" class="mt-4 w-100">
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
          <VRow>
            <VCol cols="2" class="pl-8 pt-6">
              <img :src="BulbLightImg" height="100" />
            </VCol>
            <VCol
              cols="8"
              class="pt-6 px-8 pb-6 d-flex text-center justify-center align-center flex-column"
            >
              <h1>Planes de Estudio</h1>
              <p>
                Aquí se listarán todos los planes de estudio existentes hasta la
                actualidad.
              </p>
              <VBtn
                color="primary"
                prepend-icon="mdi-plus"
                @click="isModalOpen = true"
              >
                Nuevo plan
              </VBtn>
            </VCol>
            <VCol cols="2" class="d-flex justify-end align-end">
              <img :src="PencilRocketImg" height="100" />
            </VCol>
          </VRow>
        </VCard>
        <VSpacer />
        <VRow class="mt-4" :no-gutters="false">
          <VCol cols="12" sm="6">
            <VSelect
              v-model="requestParams.study_program_id"
              :items="studyPrograms"
              item-title="name"
              item-value="id"
              label="Programa de estudio"
              clearable
              hide-details
            />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField
              v-model="requestParams.search"
              placeholder="Buscar plan de estudio..."
              prepend-inner-icon="tabler-search"
              clearable
              hide-details
              @input="onSearch"
              @click:clear="onSearch"
            />
          </VCol>
        </VRow>
        <div class="mt-6 pb-6 pt-2" style="position: relative">
          <div
            v-if="isSearching"
            class="d-flex justify-center align-center"
            style="
              position: absolute;
              inset: 0;
              background: rgba(var(--v-theme-surface), 0.7);
              z-index: 1;
              border-radius: 8px;
            "
          >
            <VProgressCircular indeterminate color="primary" size="48" />
          </div>
          <div
            v-if="studyPlansList.length === 0"
            class="d-flex flex-column align-center justify-center text-medium-emphasis py-16"
          >
            <VIcon icon="tabler-file" size="48" class="mb-3" />
            <span class="text-body-1">No se encontraron planes de estudio</span>
          </div>

          <VRow v-else>
            <VCol
              v-for="plan in studyPlansList"
              :key="plan.id"
              cols="12"
              sm="6"
              lg="4"
            >
              <VCard height="100%">
                <VCardTitle class="d-flex align-start">
                  <VAvatar color="primary" variant="tonal" class="mr-2 mt-7">
                    <VIcon icon="tabler-school" />
                  </VAvatar>

                  <div style="text-wrap: wrap">
                    <div class="d-flex gap-1 mb-2">
                      <VChip
                        :color="plan.is_active ? 'success' : 'default'"
                        size="small"
                        variant="tonal"
                      >
                        {{ plan.is_active ? "Activo" : "Inactivo" }}
                      </VChip>
                      <VChip
                        v-if="plan.is_current"
                        color="info"
                        size="small"
                        variant="tonal"
                      >
                        Actual
                      </VChip>
                    </div>
                    <div style="height: 100%">
                      {{ plan.name }}
                    </div>
                    <div
                      class="text-body-2 text-medium-emphasis font-weight-regular mt-1"
                    >
                      {{ plan.study_program_name }}
                      {{ plan.year ?? "Sin año definido" }}
                    </div>
                  </div>

                  <VSpacer />

                  <VMenu location="bottom end" close-on-content-click>
                    <template #activator="{ props: menuProps }">
                      <VBtn icon variant="text" size="small" v-bind="menuProps">
                        <VIcon icon="tabler-dots-vertical" />
                      </VBtn>
                    </template>
                    <VList density="compact" min-width="150">
                      <VListItem
                        prepend-icon="tabler-pencil"
                        title="Editar"
                        @click="editStudyPlan(plan)"
                      />
                      <VListItem
                        prepend-icon="tabler-books"
                        title="Asignar cursos"
                        @click="openAssignCourses(plan)"
                      />
                      <VListItem
                        :prepend-icon="
                          plan.is_active
                            ? 'tabler-toggle-right'
                            : 'tabler-toggle-left'
                        "
                        :title="plan.is_active ? 'Desactivar' : 'Activar'"
                        :base-color="plan.is_active ? 'warning' : 'success'"
                        :disabled="togglingId === plan.id"
                        @click="toggleStudyPlan(plan)"
                      >
                        <template v-if="togglingId === plan.id" #prepend>
                          <VProgressCircular
                            indeterminate
                            size="18"
                            width="2"
                            color="warning"
                            class="mr-2"
                          />
                        </template>
                      </VListItem>
                      <VListItem
                        prepend-icon="tabler-trash"
                        title="Eliminar"
                        base-color="error"
                        :disabled="deletingId === plan.id"
                        @click="deleteStudyPlan(plan.id)"
                      >
                        <template v-if="deletingId === plan.id" #prepend>
                          <VProgressCircular
                            indeterminate
                            size="18"
                            width="2"
                            color="error"
                            class="mr-2"
                          />
                        </template>
                      </VListItem>
                    </VList>
                  </VMenu>
                </VCardTitle>
              </VCard>
            </VCol>
          </VRow>
          <VRow v-if="totalPages > 1" class="mt-4">
            <VCol cols="12" class="d-flex justify-center">
              <VPagination
                v-model="requestParams.page"
                :length="totalPages"
                :total-visible="7"
              />
            </VCol>
          </VRow>
        </div>
      </div>
    </template>

    <StudyPlanForm
      v-model="isModalOpen"
      :item="selectedPlan"
      @saved="getList(true)"
    />

    <AssignCourses
      v-model="isAssignCoursesOpen"
      :study-program-id="selectedProgramId"
    />
  </div>
</template>
<route lang="yaml">
meta:
  action: read
  subject: StudyPlan
</route>
