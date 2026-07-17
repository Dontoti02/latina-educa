<script setup lang="ts">
import Draggable from "vuedraggable";
import { ToastService } from "@/common/util/toast.service";
import { ClassroomService } from "@/services/classroom.service";
import ModalBasic from "@/common/components/Modal.vue";
import type {
  ClassroomParams,
  ClassroomCourseFilter,
  ClassroomCourseListItem,
  ClassroomStudyPlanOption,
} from "@/models/classroom";

type CourseItem = ClassroomCourseListItem & { _movable: boolean };

const props = defineProps<{
  modelValue: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (
    e: "saved",
    courses: ClassroomCourseListItem[],
    filter: ClassroomCourseFilter,
  ): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const params = ref<ClassroomParams>({
  periods: [],
  study_programs: [],
  study_plans: [],
  cycles: [],
  shifts: [],
  sections: [],
});

const filter = ref<Partial<ClassroomCourseFilter>>({
  period_id: undefined,
  study_program_id: undefined,
  study_plan_id: undefined,
  cycle_id: undefined,
  shift_id: undefined,
  section_id: undefined,
});

const filteredStudyPlans = computed<ClassroomStudyPlanOption[]>(() => {
  if (filter.value.study_program_id == null) return [];
  return params.value.study_plans.filter(
    (sp) => sp.study_program_id === filter.value.study_program_id,
  );
});

watch(
  () => filter.value.study_program_id,
  () => {
    filter.value.study_plan_id = undefined;
  },
);

const isFilterComplete = computed(
  () =>
    filter.value.period_id != null &&
    filter.value.study_program_id != null &&
    filter.value.study_plan_id != null &&
    filter.value.cycle_id != null &&
    filter.value.shift_id != null &&
    filter.value.section_id != null,
);

const availableCourses = ref<CourseItem[]>([]);
const selectedCourses = ref<CourseItem[]>([]);
const isSearching = ref(false);
const isSaving = ref(false);
const hasSearched = ref(false);

const loadParams = () => {
  ClassroomService.getParams()
    .then((response) => {
      params.value = response.data;
    })
    .catch((error) => {
      ToastService.error(error);
    });
};

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      loadParams();
      filter.value = {};
      availableCourses.value = [];
      selectedCourses.value = [];
      hasSearched.value = false;
    }
  },
);

const onSearch = () => {
  if (!isFilterComplete.value) return;
  isSearching.value = true;
  hasSearched.value = false;
  ClassroomService.listCourses(filter.value as ClassroomCourseFilter)
    .then((response) => {
      availableCourses.value = response.data.courses_available.map((c) => ({
        ...c,
        _movable: true,
      }));
      selectedCourses.value = response.data.courses_assigned.map((c) => ({
        ...c,
        _movable: false,
      }));
      hasSearched.value = true;
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      isSearching.value = false;
    });
};

const moveTo = (course: CourseItem) => {
  const idx = availableCourses.value.indexOf(course);
  if (idx === -1) return;
  availableCourses.value.splice(idx, 1);
  selectedCourses.value.push({ ...course, _movable: true });
};

const moveBack = (course: CourseItem) => {
  if (!course._movable) return;
  const idx = selectedCourses.value.indexOf(course);
  if (idx === -1) return;
  selectedCourses.value.splice(idx, 1);
  availableCourses.value.push(course);
};

const canMoveFromSelected = (evt: {
  draggedContext: { element: CourseItem };
  from: HTMLElement;
  to: HTMLElement;
}) => {
  if (!evt.draggedContext.element._movable && evt.from !== evt.to) return false;
  return true;
};

const close = () => {
  isOpen.value = false;
};

const onSave = () => {
  if (selectedCourses.value.length === 0) return;
  isSaving.value = true;
  const payload = {
    ...(filter.value as ClassroomCourseFilter),
    course_ids: selectedCourses.value.map((c) => c.id),
  };
  ClassroomService.createAssignment(payload)
    .then(() => {
      ToastService.success("Cursos asignados correctamente");
      emit(
        "saved",
        selectedCourses.value,
        filter.value as ClassroomCourseFilter,
      );
      close();
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      isSaving.value = false;
    });
};
</script>

<template>
  <ModalBasic :visible="isOpen" width="780px">
    <VCard>
      <VCardTitle class="pa-4">Asignar nuevos cursos</VCardTitle>
      <VDivider />

      <VCardText class="pa-4">
        <!-- Filter selects -->
        <VRow>
          <VCol cols="12">
            <VSelect
              v-model="filter.study_program_id"
              :items="params.study_programs"
              item-title="name"
              item-value="id"
              label="Programa de estudio"
              density="compact"
              hide-details
            />
          </VCol>
          <VCol cols="12">
            <VSelect
              v-model="filter.study_plan_id"
              :items="filteredStudyPlans"
              item-title="name"
              item-value="id"
              label="Plan de estudios"
              density="compact"
              hide-details
              :disabled="filter.study_program_id == null"
            />
          </VCol>
          <VCol cols="12" md="6">
            <VSelect
              v-model="filter.period_id"
              :items="params.periods"
              item-title="name"
              item-value="id"
              label="Período"
              density="compact"
              hide-details
            />
          </VCol>
          <VCol cols="12" md="6">
            <VSelect
              v-model="filter.cycle_id"
              :items="params.cycles"
              item-title="name"
              item-value="id"
              label="Ciclo"
              density="compact"
              hide-details
            />
          </VCol>
          <VCol cols="12" md="6">
            <VSelect
              v-model="filter.shift_id"
              :items="params.shifts"
              item-title="name"
              item-value="id"
              label="Turno"
              density="compact"
              hide-details
            />
          </VCol>
          <VCol cols="12" md="6">
            <VSelect
              v-model="filter.section_id"
              :items="params.sections"
              item-title="name"
              item-value="id"
              label="Sección"
              density="compact"
              hide-details
            />
          </VCol>
          <VCol cols="12" md="4" class="d-flex align-center">
            <VBtn
              color="primary"
              :disabled="!isFilterComplete"
              :loading="isSearching"
              block
              @click="onSearch"
            >
              Buscar
            </VBtn>
          </VCol>
        </VRow>

        <!-- Dual-list panel -->
        <VRow v-if="hasSearched" class="mt-4">
          <!-- Available courses -->
          <VCol cols="12" md="6">
            <div class="panel-label text-subtitle-2 mb-2">
              Cursos disponibles
            </div>
            <VSheet border rounded class="draggable-panel pa-1">
              <Draggable
                v-model="availableCourses"
                :group="{ name: 'courses' }"
                item-key="id"
                class="draggable-list"
              >
                <template #item="{ element }">
                  <div
                    class="course-item d-flex align-center justify-space-between pa-2"
                  >
                    <span class="text-body-2">{{ element.name }}</span>
                    <VBtn
                      icon
                      size="x-small"
                      variant="tonal"
                      color="primary"
                      @click="moveTo(element)"
                    >
                      <VIcon size="16">mdi-arrow-right</VIcon>
                    </VBtn>
                  </div>
                </template>
                <template #footer>
                  <div
                    v-if="availableCourses.length === 0"
                    class="text-caption text-center text-medium-emphasis py-4"
                  >
                    Sin cursos disponibles
                  </div>
                </template>
              </Draggable>
            </VSheet>
          </VCol>

          <!-- Selected courses -->
          <VCol cols="12" md="6">
            <div class="panel-label text-subtitle-2 mb-2">
              Cursos seleccionados
            </div>
            <VSheet border rounded class="draggable-panel pa-1">
              <Draggable
                v-model="selectedCourses"
                :group="{ name: 'courses' }"
                :move="canMoveFromSelected"
                item-key="id"
                class="draggable-list"
              >
                <template #item="{ element }">
                  <div
                    class="course-item d-flex align-center justify-space-between pa-2"
                  >
                    <span class="text-body-2">{{ element.name }}</span>
                    <VBtn
                      v-if="element._movable"
                      icon
                      size="x-small"
                      variant="tonal"
                      color="secondary"
                      @click="moveBack(element)"
                    >
                      <VIcon size="16">mdi-arrow-left</VIcon>
                    </VBtn>
                    <VIcon v-else size="16" class="mx-1" color="medium-emphasis"
                      >mdi-lock-outline</VIcon
                    >
                  </div>
                </template>
                <template #footer>
                  <div
                    v-if="selectedCourses.length === 0"
                    class="text-caption text-center text-medium-emphasis py-4"
                  >
                    Sin cursos seleccionados
                  </div>
                </template>
              </Draggable>
            </VSheet>
          </VCol>
        </VRow>
      </VCardText>

      <VDivider />
      <VCardActions class="pa-4 d-flex justify-end gap-3">
        <VBtn variant="tonal" color="secondary" @click="close">Cancelar</VBtn>
        <VBtn
          variant="outlined"
          color="primary"
          :loading="isSaving"
          :disabled="selectedCourses.length === 0"
          @click="onSave"
        >
          Guardar
        </VBtn>
      </VCardActions>
    </VCard>
  </ModalBasic>
</template>

<style scoped>
.draggable-panel {
  min-height: 280px;
  max-height: 320px;
  overflow-y: auto;
}

.draggable-list {
  min-height: 260px;
}

.course-item {
  border-radius: 6px;
  cursor: grab;
  transition: background 0.15s;
}

.course-item:hover {
  background: rgba(var(--v-theme-primary), 0.06);
}
</style>
