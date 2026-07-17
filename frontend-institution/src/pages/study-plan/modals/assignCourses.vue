<script setup lang="ts">
import { VueDraggable } from "vue-draggable-plus";
import { useDisplay } from "vuetify";
import { ToastService } from "@/common/util/toast.service";
import { StudyPlanService } from "@/services/study-plan.service";
import ModalBasic from "@/common/components/Modal.vue";
import type {
  AssignedCourseRaw,
  StudyProgramParamsResult,
  StudyProgramDraggableCourse,
  StudyProgramCycleTabEntry,
} from "@/models/study-plan";

const { mdAndDown } = useDisplay();

const props = defineProps<{
  modelValue: boolean;
  studyProgramId: number | null;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});

const isLoading = ref(false);
const activeTab = ref(0);
const cycleTabs = ref<StudyProgramCycleTabEntry[]>([]);
const searchAvailable = ref("");

watch(activeTab, () => {
  searchAvailable.value = "";
});

const filteredAvailableModel = computed({
  get() {
    const tab = cycleTabs.value[activeTab.value];
    if (!tab) return [];
    const q = searchAvailable.value.trim().toLowerCase();
    if (!q) return tab.available;
    return tab.available.filter((c) => c.name.toLowerCase().includes(q));
  },
  set(newVal: StudyProgramDraggableCourse[]) {
    const tab = cycleTabs.value[activeTab.value];
    if (!tab) return;
    const q = searchAvailable.value.trim().toLowerCase();
    if (!q) {
      tab.available = newVal;
      return;
    }
    // Reconcile add/remove against the full source array
    const oldFiltered = tab.available.filter((c) =>
      c.name.toLowerCase().includes(q),
    );
    const newIds = new Set(newVal.map((c) => c.course_id));
    const oldIds = new Set(oldFiltered.map((c) => c.course_id));
    const removedIds = [...oldIds].filter((id) => !newIds.has(id));
    const addedItems = newVal.filter((c) => !oldIds.has(c.course_id));
    if (removedIds.length) {
      tab.available = tab.available.filter(
        (c) => !removedIds.includes(c.course_id),
      );
    }
    if (addedItems.length) {
      tab.available.push(...addedItems);
    }
  },
});

const loadData = async () => {
  if (!props.studyProgramId) return;
  isLoading.value = true;
  try {
    const [detailRes, paramsRes] = await Promise.all([
      StudyPlanService.getStudyProgramDetail(props.studyProgramId),
      StudyPlanService.getStudyProgramDetailParams(props.studyProgramId),
    ]);

    const assignedCourses: AssignedCourseRaw[] = detailRes.data;
    const params: StudyProgramParamsResult = paramsRes.data;

    // Group assigned courses by cycle_id and collect cycle metadata from detail
    const grouped: Record<number, StudyProgramDraggableCourse[]> = {};
    const cyclesFromDetail = new Map<
      number,
      { cycle_id: number; name: string; order: number }
    >();
    for (const course of assignedCourses) {
      if (!grouped[course.cycle_id]) grouped[course.cycle_id] = [];
      grouped[course.cycle_id].push({
        course_id: course.course_id,
        name: course.course_name,
        assignment_id: course.id,
      });
      if (!cyclesFromDetail.has(course.cycle_id)) {
        cyclesFromDetail.set(course.cycle_id, {
          cycle_id: course.cycle_id,
          name: course.cycle_name,
          order: Infinity,
        });
      }
    }

    // Merge cycles: start with params.cycles, then add any from detail not already present
    const mergedCycles = params.cycles.map((c) => ({
      cycle_id: c.id,
      name: c.name,
      order: c.order,
    }));
    for (const [id, detailCycle] of cyclesFromDetail) {
      if (!mergedCycles.some((c) => c.cycle_id === id)) {
        mergedCycles.push(detailCycle);
      }
    }
    mergedCycles.sort((a, b) => romanToInt(a.name) - romanToInt(b.name));

    // Build tabs sorted by cycle order; each cycle gets its own available pool
    cycleTabs.value = mergedCycles.map((cycle) => {
      const assigned: StudyProgramDraggableCourse[] =
        grouped[cycle.cycle_id] ?? [];
      const assignedIds = new Set(assigned.map((c) => c.course_id));
      const available: StudyProgramDraggableCourse[] = params.courses
        .filter((c) => !assignedIds.has(c.id))
        .map((c) => ({ course_id: c.id, name: c.name }));
      return {
        cycle_id: cycle.cycle_id,
        name: cycle.name,
        available,
        assigned,
      };
    });

    activeTab.value = 0;
  } catch (error: any) {
    ToastService.error(error);
  } finally {
    isLoading.value = false;
  }
};

watch(
  () => props.modelValue,
  (val) => {
    if (val) loadData();
    else cycleTabs.value = [];
  },
);

const moveToAssigned = async (
  tabIndex: number,
  course: StudyProgramDraggableCourse,
) => {
  const tab = cycleTabs.value[tabIndex];
  const idx = tab.available.indexOf(course);
  if (idx === -1) return;
  tab.available.splice(idx, 1);
  tab.assigned.push(course);
  try {
    const res = await StudyPlanService.assignCourse({
      study_plan_id: props.studyProgramId!,
      cycle_id: tab.cycle_id,
      course_id: course.course_id,
    });
    course.assignment_id = res.data.id;
  } catch (error: any) {
    tab.assigned.splice(tab.assigned.indexOf(course), 1);
    tab.available.push(course);
    ToastService.error(error);
  }
};

const moveToAvailable = async (tabIndex: number, courseIndex: number) => {
  const tab = cycleTabs.value[tabIndex];
  const course = tab.assigned[courseIndex];
  if (!course) return;
  tab.assigned.splice(courseIndex, 1);
  tab.available.push(course);
  try {
    await StudyPlanService.unassignCourse(course.assignment_id!);
    course.assignment_id = undefined;
  } catch (error: any) {
    tab.available.splice(tab.available.indexOf(course), 1);
    tab.assigned.push(course);
    ToastService.error(error);
  }
};

const onDragToAssigned = async (tabIndex: number, event: any) => {
  const tab = cycleTabs.value[tabIndex];
  const course = tab.assigned[event.newIndex];
  if (!course) return;
  try {
    const res = await StudyPlanService.assignCourse({
      study_plan_id: props.studyProgramId!,
      cycle_id: tab.cycle_id,
      course_id: course.course_id,
    });
    course.assignment_id = res.data.id;
  } catch (error: any) {
    tab.assigned.splice(event.newIndex, 1);
    tab.available.push(course);
    ToastService.error(error);
  }
};

const onDragToAvailable = async (tabIndex: number, event: any) => {
  const tab = cycleTabs.value[tabIndex];
  const filtered = filteredAvailableModel.value;
  const course = filtered[event.newIndex];
  if (!course) return;
  const assignmentId = course.assignment_id;
  if (!assignmentId) return;
  try {
    await StudyPlanService.unassignCourse(assignmentId);
    course.assignment_id = undefined;
  } catch (error: any) {
    const idxInAvailable = tab.available.indexOf(course);
    if (idxInAvailable !== -1) tab.available.splice(idxInAvailable, 1);
    tab.assigned.push(course);
    ToastService.error(error);
  }
};

const romanToInt = (s: string): number => {
  const map: Record<string, number> = {
    I: 1,
    V: 5,
    X: 10,
    L: 50,
    C: 100,
    D: 500,
    M: 1000,
  };
  const upper = s.toUpperCase();
  let result = 0;
  for (let i = 0; i < upper.length; i++) {
    const curr = map[upper[i]] ?? 0;
    const next = map[upper[i + 1]] ?? 0;
    result += curr < next ? -curr : curr;
  }
  return result;
};

const close = () => {
  isOpen.value = false;
};
</script>

<template>
  <ModalBasic
    :visible="isOpen"
    width="960"
    :is-scrollable="true"
    @close="close"
  >
    <VCard>
      <VToolbar flat color="primary" class="text-white">
        <VToolbarTitle>Asignar cursos al programa de estudio</VToolbarTitle>
        <VSpacer />
        <VBtn icon variant="text" @click="close">
          <VIcon icon="tabler-x" />
        </VBtn>
      </VToolbar>

      <VDivider />

      <VCardText class="pa-0" style="min-height: 520px">
        <!-- Loading state -->
        <div
          v-if="isLoading"
          class="d-flex justify-center align-center"
          style="height: 520px"
        >
          <VProgressCircular indeterminate color="primary" size="48" />
        </div>

        <!-- Main layout -->
        <div
          v-else-if="cycleTabs.length"
          class="d-flex"
          :class="mdAndDown ? 'flex-column' : 'flex-row'"
          style="min-height: 520px"
        >
          <!-- Cycle tabs -->
          <div
            :style="
              mdAndDown
                ? 'border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity))'
                : 'min-width: 150px; border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity))'
            "
          >
            <VTabs
              v-model="activeTab"
              :direction="mdAndDown ? 'horizontal' : 'vertical'"
              color="primary"
              :show-arrows="mdAndDown"
              :class="mdAndDown ? '' : 'h-100'"
            >
              <VTab
                v-for="(tab, i) in cycleTabs"
                :key="tab.cycle_id"
                :value="i"
                class="text-none"
              >
                Ciclo {{ tab.name }}
              </VTab>
            </VTabs>
          </div>

          <!-- Tab content panels -->
          <VWindow v-model="activeTab" class="flex-grow-1">
            <VWindowItem
              v-for="(tab, tabIndex) in cycleTabs"
              :key="tab.cycle_id"
              :value="tabIndex"
            >
              <VRow class="ma-0 pa-4">
                <!-- Available courses -->
                <VCol :cols="mdAndDown ? 12 : 6" class="pr-2">
                  <p
                    class="text-subtitle-2 font-weight-bold mb-2 text-medium-emphasis text-uppercase"
                  >
                    Disponibles
                    <VChip
                      v-if="tab.available.length"
                      size="x-small"
                      color="default"
                      class="ms-1"
                    >
                      {{ tab.available.length }}
                    </VChip>
                  </p>

                  <VTextField
                    v-if="tabIndex === activeTab"
                    v-model="searchAvailable"
                    placeholder="Buscar curso..."
                    prepend-inner-icon="tabler-search"
                    density="compact"
                    variant="outlined"
                    clearable
                    hide-details
                    class="mb-2"
                    @click:clear="searchAvailable = ''"
                  />

                  <VCard
                    variant="outlined"
                    style="height: 420px; overflow-y: auto"
                  >
                    <VueDraggable
                      v-model="filteredAvailableModel"
                      :group="`cycle-${tab.cycle_id}`"
                      :animation="150"
                      style="min-height: 370px"
                      @add="(e: any) => onDragToAvailable(tabIndex, e)"
                    >
                      <VListItem
                        v-for="course in filteredAvailableModel"
                        :key="course.course_id"
                        :title="course.name"
                        density="compact"
                        class="mb-1 rounded"
                        style="cursor: grab"
                      >
                        <template #prepend>
                          <VIcon
                            icon="tabler-grip-vertical"
                            size="16"
                            class="text-medium-emphasis mr-1"
                          />
                        </template>
                        <template #append>
                          <VBtn
                            icon
                            size="x-small"
                            variant="text"
                            color="primary"
                            @click="moveToAssigned(tabIndex, course)"
                          >
                            <VIcon icon="tabler-chevron-right" size="16" />
                          </VBtn>
                        </template>
                      </VListItem>
                    </VueDraggable>

                    <div
                      v-if="filteredAvailableModel.length === 0"
                      class="d-flex flex-column align-center justify-center text-medium-emphasis text-caption pa-8"
                    >
                      <VIcon
                        v-if="tab.available.length === 0"
                        icon="tabler-circle-check"
                        size="32"
                        class="mb-2 text-success"
                      />
                      <VIcon
                        v-else
                        icon="tabler-search-off"
                        size="32"
                        class="mb-2"
                      />
                      {{
                        tab.available.length === 0
                          ? "Todos los cursos han sido asignados"
                          : "Sin resultados para la búsqueda"
                      }}
                    </div>
                  </VCard>
                </VCol>

                <!-- Assigned courses -->
                <VCol :cols="mdAndDown ? 12 : 6" class="pl-2">
                  <p
                    class="text-subtitle-2 font-weight-bold mb-2 text-medium-emphasis text-uppercase"
                  >
                    Asignados
                  </p>
                  <div class="mb-7">
                    Total de cursos:
                    <VChip size="x-small" color="primary" class="ms-1">
                      {{ tab.assigned.length ?? 0 }}
                    </VChip>
                  </div>

                  <VCard
                    variant="outlined"
                    style="height: 420px; overflow-y: auto"
                  >
                    <VueDraggable
                      v-model="tab.assigned"
                      :group="`cycle-${tab.cycle_id}`"
                      :animation="150"
                      style="min-height: 370px"
                      @add="(e: any) => onDragToAssigned(tabIndex, e)"
                    >
                      <VListItem
                        v-for="(course, courseIndex) in tab.assigned"
                        :key="course.course_id"
                        :title="course.name"
                        density="compact"
                        class="mb-1 rounded"
                        style="
                          cursor: grab;
                          background: rgba(var(--v-theme-success), 0.06);
                        "
                      >
                        <template #prepend>
                          <VIcon
                            icon="tabler-grip-vertical"
                            size="16"
                            class="text-medium-emphasis mr-1"
                          />
                        </template>
                        <template #append>
                          <VBtn
                            icon
                            size="x-small"
                            variant="text"
                            color="warning"
                            @click="moveToAvailable(tabIndex, courseIndex)"
                          >
                            <VIcon icon="tabler-chevron-left" size="16" />
                          </VBtn>
                        </template>
                      </VListItem>
                    </VueDraggable>
                  </VCard>
                </VCol>
              </VRow>
            </VWindowItem>
          </VWindow>
        </div>

        <!-- Empty state -->
        <div
          v-else
          class="d-flex align-center justify-center text-medium-emphasis py-12"
        >
          No hay ciclos disponibles para este programa.
        </div>
      </VCardText>

      <VDivider />

      <VCardActions class="justify-end px-4 py-3">
        <VBtn variant="tonal" @click="close">Cerrar</VBtn>
      </VCardActions>
    </VCard>
  </ModalBasic>
</template>
