<script setup lang="ts">
import { VSkeletonLoader } from "vuetify/labs/VSkeletonLoader";
import { SessionStore } from "@/common/store";
import { ToastService } from "@/common/util/toast.service";
import type {
  CurriculumFormSecretary,
  GetCurriculum,
  GetCurriculumFilters,
} from "@/models/curriculum";
import { CurriculumService } from "@/services/curriculum.service";
import BulbLightImg from "@images/illustrations/bulb-light.png";
import PencilRocketImg from "@images/illustrations/pencil-rocket.png";
import StudyPlanModal from "./modals/StudyPlanModal.vue";
import { StudyPlan } from "@/models/study-plan-form";

// Initial
const session = SessionStore();

const loadingFilters = ref(false);
const loadingCurriculum = ref(false);

const filtersForSecretary = ref<GetCurriculumFilters>({
  study_programs: [],
});

const formSubmit = ref<CurriculumFormSecretary>({
  study_program_id: null,
});

const headers = [{ title: "Curso", key: "course", align: "left" }];

const curriculum = ref<Array<GetCurriculum>>([]);

// Computed
const filtersIsValid = computed(() => {
  return session.isStudent() || formSubmit.value.study_program_id !== null;
});

// Actions
const getFilters = () => {
  loadingFilters.value = true;
  CurriculumService.getFilters()
    .then((response) => {
      filtersForSecretary.value = response.data;
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      loadingFilters.value = false;
    });
};

const getCurriculum = () => {
  loadingCurriculum.value = true;
  if (session.isSecretary()) {
    CurriculumService.getCurriculumForSecretary(formSubmit.value)
      .then((response) => {
        curriculum.value = response.data;
      })
      .catch((error) => {
        ToastService.error(error);
      })
      .finally(() => {
        loadingCurriculum.value = false;
      });
  } else {
    CurriculumService.getCurriculumForStudent()
      .then((response) => {
        curriculum.value = response.data;
      })
      .catch((error) => {
        ToastService.error(error);
      })
      .finally(() => {
        loadingCurriculum.value = false;
      });
  }
};

// Mounted
onBeforeMount(() => {
  if (session.isStudent()) getCurriculum();
  else getFilters();
});

const openEditStudyPlan = (studyPlan: StudyPlan) => {
  selectedStudyPlan.value = studyPlan;
  toggleNewStudyPlanModal();
};

const toggleNewStudyPlanModal = () => {
  showNewStudyPlanModal.value = !showNewStudyPlanModal.value;
};

const selectedStudyPlan = ref();

const showNewStudyPlanModal = ref(false);

// Watchers
watch(
  () => formSubmit.value.study_program_id,
  () => {
    if (session.isSecretary()) getCurriculum();
  },
);
</script>

<template>
  <div>
    <div v-if="loadingFilters" class="mt-4 w-100 d-flex justify-center">
      <VRow>
        <VCol cols="12">
          <VSkeletonLoader class="w-100" type="image" />
        </VCol>
        <VCol cols="12">
          <VSkeletonLoader
            class="w-100 gap-2"
            type="list-item-three-line,list-item-three-line,list-item-three-line,list-item-three-line,list-item-three-line"
          />
        </VCol>
      </VRow>
    </div>
    <template v-else>
      <VCard>
        <VRow class="">
          <VCol cols="3" class="pl-8 pt-6">
            <img :src="BulbLightImg" height="100" />
          </VCol>
          <VCol
            cols="6"
            class="pt-6 px-8 pb-6 d-flex text-center justify-center align-center flex-column"
          >
            <h1>Plan de estudios</h1>
            <p>
              Verifica los cursos correspondientes a tu plan de estudios en cada
              ciclo académico.
            </p>
            <VBtn
              color="primary"
              prepend-icon="mdi-plus"
              @click="toggleNewStudyPlanModal()"
            >
              Nuevo plan
            </VBtn>
          </VCol>
          <VCol cols="3" class="d-flex justify-end align-end">
            <img :src="PencilRocketImg" height="100" />
          </VCol>
        </VRow>
      </VCard>
      <VSpacer />
      <VCard class="mt-6 px-4 pb-6 pt-2">
        <VRow>
          <VCol v-if="session.isSecretary()" cols="12" sm="6" md="4">
            <AppSelect
              v-model="formSubmit.study_program_id"
              :items="filtersForSecretary.study_programs"
              item-value="id"
              item-title="name"
              label="Programa de estudios"
            />
          </VCol>
        </VRow>
        <VRow v-if="!filtersIsValid">
          <VCol cols="12" class="py-8">
            <p class="mb-0 text-center">
              Por favor, seleccione un programa de estudios para visualizar el
              plan de estudios.
            </p>
          </VCol>
        </VRow>
        <VRow v-else>
          <template v-if="loadingCurriculum">
            <VCol v-for="i in 6" :key="`curriculum-${i}`" cols="12" lg="6">
              <VSkeletonLoader class="w-100" type="table" />
            </VCol>
          </template>
          <template v-else>
            <VDivider />
            <VCol
              v-for="item in curriculum"
              :key="item.id"
              cols="12"
              lg="6"
              class="my-2"
            >
              <div class="text-center text-h5 mb-1">CICLO {{ item.name }}</div>
              <VTable>
                <!--
                  <thead>
                  <tr>
                  <th
                  v-for="header in headers"
                  :key="header.key"
                  :class="{
                  'text-left': !header.align || header.align === 'left',
                  'text-center': header.align === 'center',
                  'text-right': header.align === 'right',
                  }"
                  >
                  {{ header.title }}
                  </th>
                  </tr>
                  </thead>
                -->
                <tbody>
                  <tr
                    v-for="(course, index) in item.courses"
                    :key="`course-${index}`"
                  >
                    <td>{{ index + 1 }}</td>
                    <td>{{ course.name }}</td>
                  </tr>
                  <tr v-if="item.courses.length === 0">
                    <td class="text-center text-body-2" colspan="2">
                      No hay cursos disponibles
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VCol>
          </template>
        </VRow>
      </VCard>
    </template>
    <StudyPlanModal
      v-if="showNewStudyPlanModal"
      :show="showNewStudyPlanModal"
      :study-plan="selectedStudyPlan"
      @update:show="showNewStudyPlanModal = false"
      @saved="getFilters()"
      @close="toggleNewStudyPlanModal()"
    ></StudyPlanModal>
  </div>
</template>

<route lang="yaml">
meta:
  action: read
  subject: Curriculum
</route>
