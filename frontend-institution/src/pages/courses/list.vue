<script setup lang="ts">
import { VSkeletonLoader } from "vuetify/lib/labs/components.mjs";
import BulbLightImg from "@images/illustrations/bulb-light.png";
import PencilRocketImg from "@images/illustrations/pencil-rocket.png";
import { ToastService } from "@/common/util/toast.service";
import { modalConfirmation } from "@/common/util/modal.service";
import { CourseService } from "@/services/courses.service";
import { CourseAdminItem, CourseFormParamItem } from "@/models/courses";
import { VPagination } from "vuetify/lib/components/index.mjs";
import CourseForm from "./modals/courseForm.vue";

const isLoading = ref(false);
const isSearching = ref(false);
const isModalOpen = ref(false);
const selectedCourse = ref<CourseAdminItem | null>(null);
const deletingId = ref<number | null>(null);
const togglingId = ref<number | null>(null);

const studyPrograms = ref<CourseFormParamItem[]>([]);
const modules = ref<CourseFormParamItem[]>([]);
const courseTypes = ref<CourseFormParamItem[]>([]);

watch(isModalOpen, (val) => {
  if (!val) selectedCourse.value = null;
});

const coursesList = ref<CourseAdminItem[]>([]);
const totalCount = ref(0);
const requestParams = ref({
  page: 1,
  size: 10,
  search: "",
  study_program_id: null as number | null,
  module_id: null as number | null,
  type_id: null as number | null,
});

const totalPages = computed(() =>
  Math.ceil(totalCount.value / requestParams.value.size),
);

const getList = (secondary = false) => {
  if (secondary) isSearching.value = true;
  else isLoading.value = true;
  CourseService.getList(requestParams.value)
    .then((response) => {
      coursesList.value = response.data.items;
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

onMounted(() => {
  getList();
  CourseService.getFormParams()
    .then((response) => {
      studyPrograms.value = response.data.study_programs;
      modules.value = response.data.modules;
      courseTypes.value = response.data.types;
    })
    .catch((error) => {
      ToastService.error(error);
    });
});

watch(
  () => requestParams.value.page,
  () => getList(true),
);

const onSearch = useDebounceFn(() => {
  requestParams.value.page = 1;
  getList(true);
}, 400);

const onFilterChange = () => {
  requestParams.value.page = 1;
  getList(true);
};

const deleteCourse = async (id: number) => {
  const confirmed = await modalConfirmation({
    title: "Eliminar curso",
    content:
      "¿Está seguro que desea eliminar este curso? Esta acción no se puede deshacer.",
  });
  if (!confirmed) return;
  deletingId.value = id;
  CourseService.delete(id)
    .then(() => {
      ToastService.success("Curso eliminado correctamente");
      getList(true);
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      deletingId.value = null;
    });
};

const editCourse = (item: CourseAdminItem) => {
  selectedCourse.value = item;
  isModalOpen.value = true;
};

const toggleCourse = (item: CourseAdminItem) => {
  togglingId.value = item.id;
  CourseService.toggle(item.id)
    .then(() => {
      const action = item.is_active ? "desactivado" : "activado";
      ToastService.success(`Curso ${action} correctamente`);
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
              <h1>Cursos</h1>
              <p>Aquí se listarán todos los cursos existentes.</p>
              <VBtn
                color="primary"
                prepend-icon="mdi-plus"
                @click="isModalOpen = true"
              >
                Nuevo curso
              </VBtn>
            </VCol>
            <VCol cols="2" class="d-flex justify-end align-end">
              <img :src="PencilRocketImg" height="100" />
            </VCol>
          </VRow>
        </VCard>
        <VSpacer />
        <VTextField
          v-model="requestParams.search"
          placeholder="Buscar curso..."
          prepend-inner-icon="tabler-search"
          clearable
          hide-details
          class="mt-4"
          @input="onSearch"
          @click:clear="onSearch"
        />
        <VRow class="mt-2">
          <VCol cols="12" sm="4">
            <VAutocomplete
              v-model="requestParams.study_program_id"
              :items="studyPrograms"
              item-title="name"
              item-value="id"
              label="Programa de estudio"
              clearable
              hide-details
              @update:model-value="onFilterChange"
            />
          </VCol>
          <VCol cols="12" sm="4">
            <VAutocomplete
              v-model="requestParams.module_id"
              :items="modules"
              item-title="name"
              item-value="id"
              label="Módulo"
              clearable
              hide-details
              @update:model-value="onFilterChange"
            />
          </VCol>
          <VCol cols="12" sm="4">
            <VAutocomplete
              v-model="requestParams.type_id"
              :items="courseTypes"
              item-title="name"
              item-value="id"
              label="Tipo de curso"
              clearable
              hide-details
              @update:model-value="onFilterChange"
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
              v-for="course in coursesList"
              :key="course.id"
              cols="12"
              sm="6"
              lg="4"
            >
              <VCard height="100%">
                <VCardTitle class="d-flex align-start">
                  <VAvatar color="primary" variant="tonal" class="mr-2 mt-7">
                    <VIcon icon="tabler-book" />
                  </VAvatar>

                  <div style="text-wrap: wrap">
                    <VChip
                      class="mb-2"
                      :color="course.is_active ? 'success' : 'default'"
                      size="small"
                      variant="tonal"
                    >
                      {{ course.is_active ? "Activo" : "Inactivo" }}
                    </VChip>
                    <div style="height: 100%">
                      {{ course.name }}
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
                        @click="editCourse(course)"
                      />
                      <VListItem
                        :prepend-icon="
                          course.is_active
                            ? 'tabler-toggle-right'
                            : 'tabler-toggle-left'
                        "
                        :title="course.is_active ? 'Desactivar' : 'Activar'"
                        :base-color="course.is_active ? 'warning' : 'success'"
                        :disabled="togglingId === course.id"
                        @click="toggleCourse(course)"
                      >
                        <template v-if="togglingId === course.id" #prepend>
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
                        :disabled="deletingId === course.id"
                        @click="deleteCourse(course.id)"
                      >
                        <template v-if="deletingId === course.id" #prepend>
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

    <CourseForm
      v-model="isModalOpen"
      :item="selectedCourse"
      @saved="getList(true)"
    />
  </div>
</template>
<route lang="yaml">
meta:
  action: read
  subject: Course
</route>
