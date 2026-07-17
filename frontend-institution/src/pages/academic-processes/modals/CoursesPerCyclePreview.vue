<script setup lang="ts">
import { ref, onMounted } from "vue";
import { StudyPlanService } from "@/services/study-plan.service";
import type { StudyPlanPreview } from "@/models/study-plan-form";

const props = defineProps<{
  studyPlanId?: number | null;
}>();

const emit = defineEmits<{
  (e: "back"): void;
}>();

const preview = ref<StudyPlanPreview | null>(null);
const loading = ref(false);
const error = ref<string | null>(null);

// Deterministic color generation using golden-angle HSL distribution
function getCourseColor(courseId: number): string {
  const hue = (courseId * 137.508) % 360;
  return `hsl(${hue}, 60%, 88%)`;
}

function getCourseBorderColor(courseId: number): string {
  const hue = (courseId * 137.508) % 360;
  return `hsl(${hue}, 60%, 58%)`;
}

function getCourseTextColor(courseId: number): string {
  const hue = (courseId * 137.508) % 360;
  return `hsl(${hue}, 55%, 28%)`;
}

onMounted(async () => {
  //   if (!props.studyPlanId) return;
  loading.value = true;
  error.value = null;
  try {
    // const response = await StudyPlanService.getStudyPlanPreview(
    //   props.studyPlanId,
    // );
    const response = await StudyPlanService.getStudyPlanPreview(0);
    preview.value = response.data;
  } catch {
    error.value = "No se pudo cargar la vista previa del plan de estudios.";
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <div class="preview-wrapper">
    <!-- Loading state -->
    <div v-if="loading" class="d-flex justify-center align-center pa-12">
      <VProgressCircular indeterminate color="primary" size="48" />
    </div>

    <!-- Error state -->
    <VAlert v-else-if="error" type="error" variant="tonal" class="ma-4">
      {{ error }}
    </VAlert>

    <!-- Content -->
    <template v-else-if="preview">
      <!-- Back button + title -->
      <div class="d-flex align-center mb-5 gap-3">
        <VBtn icon variant="text" color="primary" @click="emit('back')">
          <VIcon icon="mdi-arrow-left" />
        </VBtn>
        <span class="text-h5 font-weight-bold preview-title">
          {{ preview.study_program_name }} - {{ preview.year }}
        </span>
      </div>

      <!-- Horizontal scrollable grid -->
      <div class="cycles-grid-wrapper">
        <div class="cycles-grid">
          <div
            v-for="cycleItem in preview.cycles"
            :key="cycleItem.cycle"
            class="cycle-column"
          >
            <!-- Cycle header -->
            <div
              class="cycle-header text-subtitle-1 font-weight-bold text-center mb-3"
            >
              Ciclo {{ cycleItem.cycle }}
            </div>

            <!-- Course cards -->
            <div class="cycle-courses">
              <div
                v-for="course in cycleItem.courses"
                :key="course.course_id"
                class="course-card"
                :style="{
                  backgroundColor: getCourseColor(course.course_id),
                  borderLeft: `4px solid ${getCourseBorderColor(course.course_id)}`,
                  borderTop: `1px solid ${getCourseBorderColor(course.course_id)}`,
                  borderRight: `1px solid ${getCourseBorderColor(course.course_id)}`,
                  borderBottom: `1px solid ${getCourseBorderColor(course.course_id)}`,
                }"
              >
                <!-- Course name -->
                <div
                  class="course-name text-body-2 font-weight-semibold"
                  :style="{ color: getCourseTextColor(course.course_id) }"
                >
                  {{ course.course_name }}
                </div>

                <!-- Course type chip -->
                <VChip
                  size="x-small"
                  variant="elevated"
                  class="mt-1"
                  :style="{
                    backgroundColor: getCourseBorderColor(course.course_id),
                    color: '#fff',
                  }"
                >
                  {{ course.course_type }}
                </VChip>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.preview-wrapper {
  padding: 16px;
  min-height: 200px;
}

.preview-title {
  color: #1a1a2e;
  letter-spacing: 0.5px;
}

.cycles-grid-wrapper {
  overflow-x: auto;
  padding-bottom: 8px;
}

.cycles-grid {
  display: flex;
  flex-direction: row;
  gap: 16px;
  min-width: max-content;
  align-items: flex-start;
}

.cycle-column {
  display: flex;
  flex-direction: column;
  min-width: 160px;
  width: 160px;
}

.cycle-header {
  color: #374151;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 6px;
}

.cycle-courses {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.course-card {
  border-radius: 8px;
  padding: 10px 12px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s ease;
  cursor: default;
}

.course-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-1px);
}

.course-name {
  line-height: 1.3;
  word-break: break-word;
}

.prerequisites {
  border-top: 1px dashed rgba(0, 0, 0, 0.12);
  padding-top: 4px;
  margin-top: 4px;
}
</style>
