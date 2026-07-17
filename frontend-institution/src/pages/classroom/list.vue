<script setup lang="ts">
import { VSkeletonLoader } from "vuetify/lib/labs/components.mjs";
import BulbLightImg from "@images/illustrations/bulb-light.png";
import PencilRocketImg from "@images/illustrations/pencil-rocket.png";
import { ToastService } from "@/common/util/toast.service";
import { modalConfirmation } from "@/common/util/modal.service";
import { ClassroomService } from "@/services/classroom.service";
import {
  ClassroomItem,
  ClassroomListItem,
  ClassroomParamOption,
} from "@/models/classroom";
import { VPagination } from "vuetify/lib/components/index.mjs";
import ClassroomForm from "./modals/classroomForm.vue";
import ClassroomDetails from "./modals/classroomDetails.vue";

const isLoading = ref(false);
const isSearching = ref(false);
const isModalOpen = ref(false);
const isDetailOpen = ref(false);
const selectedClassroom = ref<ClassroomItem | null>(null);
const selectedDetailId = ref<number | null>(null);
const deletingId = ref<number | null>(null);
const periods = ref<ClassroomParamOption[]>([]);
const selectedPeriodId = ref<number | null>(null);

watch(isModalOpen, (val) => {
  if (!val) selectedClassroom.value = null;
});

const total = ref(0);
const classrooms = ref<ClassroomListItem[]>([]);
const requestParams = ref({
  page: 1,
  size: 12,
  search: "",
  period_id: null as number | null,
});

const totalPages = computed(() =>
  Math.ceil(total.value / requestParams.value.size),
);

const getList = (secondary = false) => {
  if (secondary) isSearching.value = true;
  else isLoading.value = true;
  ClassroomService.getList(requestParams.value)
    .then((response) => {
      classrooms.value = response.data.items ?? [];
      total.value = response.data.total ?? 0;
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      if (secondary) isSearching.value = false;
      else isLoading.value = false;
    });
};

let initialized = false;

onMounted(async () => {
  isLoading.value = true;
  try {
    const res = await ClassroomService.getParams();
    periods.value = res.data.periods;
    if (periods.value.length > 0) {
      selectedPeriodId.value = periods.value[0].id;
      requestParams.value.period_id = periods.value[0].id;
    }
  } catch (error: any) {
    ToastService.error(error);
  }
  initialized = true;
  getList();
});

watch(selectedPeriodId, (val) => {
  if (!initialized) return;
  requestParams.value.period_id = val;
  requestParams.value.page = 1;
  getList(true);
});

watch(
  () => requestParams.value.page,
  () => {
    getList(true);
  },
);

const onSearch = useDebounceFn(() => {
  requestParams.value.page = 1;
  getList(true);
}, 400);

const deleteClassroom = async (id: number) => {
  const confirmed = await modalConfirmation({
    title: "Eliminar clase",
    content:
      "¿Está seguro que desea eliminar esta clase? Esta acción no se puede deshacer.",
  });
  if (!confirmed) return;
  deletingId.value = id;
  ClassroomService.delete(id)
    .then(() => {
      ToastService.success("Clase eliminada correctamente");
      getList(true);
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      deletingId.value = null;
    });
};

const viewDetail = (classroom: ClassroomListItem) => {
  selectedDetailId.value = classroom.id;
  isDetailOpen.value = true;
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
              <h1>Clases</h1>
              <p>Aquí se listarán todas las clases existentes.</p>
              <VBtn
                color="primary"
                prepend-icon="mdi-plus"
                @click="isModalOpen = true"
              >
                Nueva clase
              </VBtn>
            </VCol>
            <VCol cols="2" class="d-flex justify-end align-end">
              <img :src="PencilRocketImg" height="100" />
            </VCol>
          </VRow>
        </VCard>
        <VSpacer />
        <VRow class="mt-4" align="center">
          <VCol cols="12" sm="6">
            <VSelect
              v-model="selectedPeriodId"
              :items="periods"
              item-title="name"
              item-value="id"
              label="Periodo"
              hide-details
              :no-data-text="'No hay periodos disponibles'"
            />
          </VCol>
          <VCol cols="12" sm="6">
            <VTextField
              v-model="requestParams.search"
              placeholder="Buscar clase..."
              prepend-inner-icon="tabler-search"
              clearable
              hide-details
              @update:model-value="onSearch"
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
          <VRow>
            <VCol
              v-for="classroom in classrooms"
              :key="classroom.id"
              cols="12"
              sm="6"
              lg="4"
            >
              <VCard height="100%">
                <VImg
                  v-if="classroom.image"
                  :src="classroom.image"
                  height="140"
                  cover
                />
                <div
                  v-else
                  class="d-flex align-center justify-center bg-primary"
                  style="height: 140px"
                >
                  <VIcon icon="tabler-chalkboard" size="48" color="white" />
                </div>
                <VCardText>
                  <div class="d-flex align-start">
                    <div class="flex-grow-1">
                      <div class="font-weight-bold text-body-1 mb-1">
                        {{ classroom.course }}
                      </div>
                      <div class="text-body-2 text-medium-emphasis mb-1">
                        <VIcon icon="tabler-calendar" size="16" class="mr-1" />
                        {{ classroom.period }}
                      </div>
                      <div
                        v-if="classroom.teacher"
                        class="text-body-2 text-medium-emphasis mb-1"
                      >
                        <VIcon icon="tabler-user" size="16" class="mr-1" />
                        Prof. {{ classroom.teacher }}
                      </div>
                      <div class="text-body-2 text-medium-emphasis mb-1">
                        <VIcon
                          icon="tabler-refresh-dot"
                          size="16"
                          class="mr-1"
                        />
                        Ciclo {{ classroom.cycle }}
                      </div>
                      <div class="text-body-2 text-medium-emphasis">
                        <VIcon icon="tabler-users" size="16" class="mr-1" />
                        {{ classroom.students }} estudiante{{
                          classroom.students !== 1 ? "s" : ""
                        }}
                      </div>
                    </div>
                    <VMenu location="bottom end" close-on-content-click>
                      <template #activator="{ props: menuProps }">
                        <VBtn
                          icon
                          variant="text"
                          size="small"
                          v-bind="menuProps"
                        >
                          <VIcon icon="tabler-dots-vertical" />
                        </VBtn>
                      </template>
                      <VList density="compact" min-width="150">
                        <VListItem
                          prepend-icon="tabler-eye"
                          title="Ver detalle"
                          @click="viewDetail(classroom)"
                        />
                        <VListItem
                          prepend-icon="tabler-trash"
                          title="Eliminar"
                          base-color="error"
                          :disabled="deletingId === classroom.id"
                          @click="deleteClassroom(classroom.id)"
                        >
                          <template v-if="deletingId === classroom.id" #prepend>
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
                  </div>
                </VCardText>
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

    <ClassroomForm
      v-model="isModalOpen"
      :item="selectedClassroom"
      @saved="getList(true)"
    />

    <ClassroomDetails v-model="isDetailOpen" :classroom-id="selectedDetailId" />
  </div>
</template>

<route lang="yaml">
meta:
  action: read
  subject: Classroom
</route>
