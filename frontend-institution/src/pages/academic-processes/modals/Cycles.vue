<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useDisplay } from "vuetify";
import { VueDraggable } from "vue-draggable-plus";
import type { CourseItem, CourseFilterValues } from "@/models/study-plan-form";
import CourseCycleItem from "./CourseCycleItem.vue";
import CourseFilters from "./CourseFilters.vue";
import { StudyPlanService } from "@/services/study-plan.service";
import { ToastService } from "@/common/util/toast.service";

const { smAndDown } = useDisplay();
const isMobile = computed(() => smAndDown.value);

const props = withDefaults(
  defineProps<{
    cycles?: number;
    studyPlanId?: number | null;
  }>(),
  {
    cycles: 5,
  },
);

const courses = ref<CourseItem[]>([]);

const filters = ref<CourseFilterValues>({
  name: null,
  year: null,
  active: false,
});

const emit = defineEmits<{
  (e: "update", payload: { cycle: number; courses: CourseItem[] }[]): void;
  (e: "add-course"): void;
  (e: "edit-course", course: CourseItem): void;
  (e: "close"): void;
  (e: "save"): void;
  (e: "preview"): void;
}>();

const activeTab = ref(0);

// Pool global de cursos disponibles (compartido entre todos los ciclos)
const available = ref<CourseItem[]>([]);

// Cursos seleccionados por ciclo: selections[i] = cursos del ciclo i
const selections = ref<CourseItem[][]>([]);

const init = () => {
  const prevSelections = selections.value;
  const allSelectedCodes = new Set(prevSelections.flat().map((c) => c.code));

  selections.value = Array.from(
    { length: props.cycles },
    (_, i) => prevSelections[i] ?? [],
  );
  available.value = courses.value.filter((c) => !allSelectedCodes.has(c.code));
};

watch([() => props.cycles, () => courses.value], init, {
  immediate: true,
  deep: true,
});

const emitUpdate = () => {
  emit(
    "update",
    selections.value.map((courses, i) => ({ cycle: i + 1, courses })),
  );
};

const addToSelected = (course: CourseItem) => {
  const idx = available.value.indexOf(course);
  if (idx === -1) return;
  available.value.splice(idx, 1);
  selections.value[activeTab.value].push(course);
  emitUpdate();
};

const removeFromSelected = (courseIndex: number) => {
  const [course] = selections.value[activeTab.value].splice(courseIndex, 1);
  available.value.push(course);
  emitUpdate();
};

// Se llama cuando VueDraggable termina de soltar un elemento (drag finalizado)
const onDragEnd = () => {
  emitUpdate();
};

const updateFilters = (newFilters: CourseFilterValues) => {
  filters.value = newFilters;
  getListOfCourses();
};

const getListOfCourses = () => {
  StudyPlanService.getCourses(filters.value)
    .then((response) => {
      courses.value = response.data;
    })
    .catch((error) => {
      console.error("Error fetching courses:", error);
    });
};

onMounted(() => {
  getListOfCourses();
});

const addCourse = (course: CourseItem) => {
  courses.value.push(course);
};

const updateCourse = (course: CourseItem) => {
  course.id = Number(course.id);
  replaceById(courses.value, course);
  replaceById(available.value, course);
  selections.value.forEach((selection) => replaceById(selection, course));
};

const replaceById = (list: CourseItem[], course: CourseItem) => {
  const idx = list.findIndex((c) => c.id === Number(course.id));
  if (idx !== -1) list.splice(idx, 1, course);
};

const saveCycleCourses = async () => {
  await StudyPlanService.saveCycleCourses({
    study_plan_id: props.studyPlanId!,
    cycle_id: activeTab.value + 1,
    courses: selections.value.flat().map((c) => c.id!),
  });

  ToastService.success("Cursos del ciclo guardados correctamente");
};

defineExpose({ addCourse, updateCourse });
</script>

<template>
  <div
    class="cycles-wrapper d-flex"
    :class="isMobile ? 'flex-column' : 'flex-row'"
  >
    <!-- Panel izquierdo (o superior en mobile): tabs de ciclos -->
    <div
      class="cycles-tabs-panel"
      :class="isMobile ? 'cycles-tabs-panel--horizontal' : ''"
    >
      <VTabs
        v-model="activeTab"
        :direction="isMobile ? 'horizontal' : 'vertical'"
        color="primary"
        class="h-100"
        :show-arrows="isMobile"
      >
        <VTab
          v-for="i in cycles"
          :key="i"
          :value="i - 1"
          class="cycle-tab text-none font-weight-medium"
        >
          Ciclo {{ i }}
        </VTab>
      </VTabs>
    </div>

    <!-- Panel derecho: listas -->
    <div class="flex-grow-1 pa-4 overflow-hidden">
      <VRow>
        <!-- Lista: Cursos disponibles -->
        <VCol cols="12" sm="6">
          <div class="d-flex align-center mb-2">
            <p
              class="text-subtitle-2 font-weight-bold mb-0 mr-2 text-medium-emphasis text-uppercase"
            >
              Cursos disponibles
            </p>
            <CourseFilters @filter="updateFilters($event)"></CourseFilters>
            <VBtn class="ml-auto" @click="emit('add-course')">
              <v-icon>mdi-plus</v-icon>
              Agregar
            </VBtn>
          </div>

          <VCard
            variant="outlined"
            class="list-card d-flex flex-column overflow-hidden position-relative"
          >
            <VueDraggable
              v-model="available"
              :group="{ name: 'courses', pull: true, put: false }"
              :animation="150"
              filter=".inactive-item"
              class="h-100 overflow-y-auto py-1"
              @end="onDragEnd"
            >
              <CourseCycleItem
                v-for="course in available"
                :key="course.id!"
                variant="available"
                :course="course"
                @edit-course="emit('edit-course', course)"
                @add="addToSelected(course)"
              />
            </VueDraggable>

            <div
              v-if="available.length === 0"
              class="empty-state d-flex flex-column align-center justify-center text-medium-emphasis text-body-2"
            >
              <VIcon
                icon="mdi-check-circle-outline"
                size="32"
                class="mb-2 d-block mx-auto"
              />
              Todos los cursos han sido asignados
            </div>
          </VCard>
        </VCol>

        <!-- Lista: Cursos seleccionados -->
        <VCol cols="12" sm="6">
          <div class="pt-2">
            <p
              class="text-subtitle-2 font-weight-bold mb-5 text-medium-emphasis text-uppercase"
            >
              Cursos seleccionados
              <VChip
                v-if="selections[activeTab]?.length"
                size="x-small"
                color="primary"
                class="ms-1"
              >
                {{ selections[activeTab].length }}
              </VChip>
            </p>
          </div>
          <VCard
            variant="outlined"
            class="list-card-2 d-flex flex-column overflow-hidden position-relative"
          >
            <VueDraggable
              v-model="selections[activeTab]"
              :group="{ name: 'courses', pull: false, put: true }"
              :animation="150"
              class="h-100 overflow-y-auto py-1"
              @end="onDragEnd"
            >
              <CourseCycleItem
                v-for="(course, index) in selections[activeTab]"
                :key="course.id!"
                variant="selected"
                :course="course"
                :index="index"
                @edit-course="emit('edit-course', course)"
                @remove="removeFromSelected(index)"
              />
            </VueDraggable>

            <div
              v-if="!selections[activeTab]?.length"
              class="empty-state d-flex flex-column align-center justify-center text-medium-emphasis text-body-2"
            >
              <VIcon
                icon="mdi-arrow-left"
                size="32"
                class="mb-2 d-block mx-auto"
              />
              Arrastra los cursos aquí o usa el botón
            </div>
          </VCard>
        </VCol>
      </VRow>
    </div>
  </div>

  <VCardActions class="justify-end mt-2 px-4 pb-4">
    <VBtn variant="outlined" color="info" @click="emit('preview')">
      <v-icon>mdi-eye</v-icon>
      Preview
    </VBtn>
    <VBtn variant="outlined" color="primary" @click="emit('close')">
      Cancelar
    </VBtn>
    <VBtn variant="outlined" color="success" @click="saveCycleCourses()">
      Guardar
    </VBtn>
  </VCardActions>
</template>

<style scoped>
.cycles-wrapper {
  min-height: 480px;
}

.cycles-tabs-panel {
  min-width: 150px;
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.cycles-tabs-panel--horizontal {
  min-width: unset;
  border-right: none;
  border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
}

.cycle-tab {
  justify-content: flex-start;
}

.list-card {
  height: 450px;
}

.list-card-2 {
  height: 450px;
}

.empty-state {
  position: absolute;
  inset: 0;
  color: rgba(var(--v-theme-on-surface), 0.38);
  pointer-events: none;
}

/* Estilos para el elemento mientras se arrastra */
:deep(.sortable-ghost) {
  opacity: 0.4;
  background-color: rgba(var(--v-theme-primary), 0.08);
}

:deep(.sortable-chosen) {
  background-color: rgba(var(--v-theme-primary), 0.06);
}
</style>
