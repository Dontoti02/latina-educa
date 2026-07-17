<script setup lang="ts">
import { ref, computed, watch } from "vue";
import ModalBasic from "@/common/components/Modal.vue";
import { CourseItem, StudyPlan } from "@/models/study-plan-form";
import StudyPlanForm from "./StudyPlanForm.vue";
import Cycles from "./Cycles.vue";
import CourseForm from "./CourseForm.vue";
import CoursesPerCyclePreview from "./CoursesPerCyclePreview.vue";

const props = defineProps<{
  show: boolean;
  studyPlan?: StudyPlan | null;
}>();

const emit = defineEmits(["close", "saved"]);

const activeTab = ref("tab-1");
const showCourseForm = ref<"cycles" | "course-form" | "preview">("cycles");
const cyclesRef = ref<InstanceType<typeof Cycles> | null>(null);

const studyPlanLocal = ref<StudyPlan | null>(props.studyPlan ?? null);

const currentEditingCourse = ref<CourseItem | null>(null);

const closeModal = () => emit("close");

const openEditCourseForm = (course: CourseItem) => {
  currentEditingCourse.value = course;
  showCourseForm.value = "course-form";
};

const addNewCourseToList = (course: CourseItem) => {
  cyclesRef.value?.addCourse(course);
  showCourseForm.value = "cycles";
  currentEditingCourse.value = null;
};

const updateCourseInList = (course: CourseItem) => {
  cyclesRef.value?.updateCourse(course);
  showCourseForm.value = "cycles";
  currentEditingCourse.value = null;
};

watch(
  () => props.studyPlan,
  (value) => {
    studyPlanLocal.value = value ?? null;
  },
);

const saveStudyPlan = (studyPlan: StudyPlan) => {
  studyPlanLocal.value = studyPlan;
  emit("saved", studyPlan);
  activeTab.value = "tab-2";
};
</script>

<template>
  <ModalBasic
    :visible="show"
    @close="closeModal"
    width="90%"
    max-width="1200px"
  >
    <VCard>
      <VToolbar flat color="primary" class="text-white">
        <VToolbarTitle>{{
          studyPlan?.id
            ? "Editar plan de estudios"
            : "Agregar nuevo plan de estudios"
        }}</VToolbarTitle>
      </VToolbar>
      <VCardText>
        <VTabs v-model="activeTab" class="mb-4" grow>
          <VTab value="tab-1"
            ><v-badge
              location="left center"
              :color="activeTab === 'tab-1' ? 'primary' : 'secondary'"
              content="1"
              :offset-x="-20"
            >
            </v-badge
            >Plan de estudios</VTab
          >
          <VTab value="tab-2" :disabled="!studyPlanLocal">
            <v-badge
              location="left center"
              :color="activeTab === 'tab-2' ? 'primary' : 'secondary'"
              content="2"
              :offset-x="-20"
            >
            </v-badge
            >Administrar ciclos
          </VTab>
        </VTabs>

        <VWindow v-model="activeTab">
          <VWindowItem value="tab-1">
            <StudyPlanForm
              :study-plan="studyPlanLocal"
              @saved="saveStudyPlan($event)"
              @close="closeModal()"
            ></StudyPlanForm>
          </VWindowItem>

          <VWindowItem value="tab-2">
            <div v-show="showCourseForm === 'cycles'">
              <Cycles
                ref="cyclesRef"
                :cycles="Number(studyPlanLocal?.numberOfCycles)"
                :study-plan-id="studyPlanLocal?.id"
                @add-course="
                  showCourseForm = 'course-form';
                  currentEditingCourse = null;
                "
                @edit-course="openEditCourseForm($event)"
                @close="closeModal()"
                @preview="showCourseForm = 'preview'"
              />
            </div>
            <div v-show="showCourseForm === 'course-form'">
              <CourseForm
                :course="currentEditingCourse"
                @close="showCourseForm = 'cycles'"
                @saved="addNewCourseToList($event)"
                @updated="updateCourseInList($event)"
              />
            </div>
            <div>
              <CoursesPerCyclePreview
                v-if="showCourseForm === 'preview'"
                :studyPlanId="studyPlanLocal?.id"
                @back="showCourseForm = 'cycles'"
              ></CoursesPerCyclePreview>
            </div>
          </VWindowItem>
        </VWindow>
      </VCardText>
    </VCard>
  </ModalBasic>
</template>
