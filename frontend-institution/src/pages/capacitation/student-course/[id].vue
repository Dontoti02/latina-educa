<script lang="ts" setup>
import BtnBack from "@/common/components/BtnBack.vue";
import { ToastService } from "@/common/util/toast.service";
import ContentDetailForStudent from "@/components/capacitations/content/ContentDetailForStudent.vue";
import Forum from "@/components/capacitations/content/Forum.vue";
import StudentScores from "@/components/capacitations/content/StudentScores.vue";
import StudentsList from "@/components/capacitations/content/StudentsList.vue";
import CourseContentForStudent from "@/components/capacitations/teacher-panels/CourseContentForStudent.vue";
import type { Course } from "@/models/courses";
import { CapacitationClassroomService } from "@/services/capacitation-classroom.service";
import { useRoute } from "vue-router";
import { VSkeletonLoader } from "vuetify/labs/VSkeletonLoader";

// Tabs
const tabs = [
  { title: "Contenido", icon: "tabler-book-2", tab: "content" },
  { title: "Participantes", icon: "tabler-users", tab: "students" },
  { title: "Calificaciones", icon: "tabler-school", tab: "scores" },
  { title: "Foro", icon: "tabler-mailbox", tab: "feed" },
];

// Initial
const router = useRouter();
const route = useRoute();
const activeTab = ref(route.query.tab);
const trainingId = +route.params.id;

// Classroom info
const classroom = ref<Course | null>(null);

// Content
const contentItemSelected = ref<number | null>(
  route.query.contentId ? +route.query.contentId : null
);

const getClassroomInfo = () => {
  CapacitationClassroomService.getClassroom(trainingId)
    .then((response) => {
      classroom.value = response.data;
    })
    .catch((error) => {
      ToastService.error(error);
      return router.push("/capacitation/list");
    });
};

// Mounted
onBeforeMount(() => {
  getClassroomInfo();
});

// Watchers
watch(contentItemSelected, (value) => {
  if (value === null) {
    const routeQuery = { ...router.currentRoute.value.query };
    delete routeQuery.contentId;
    router.replace({ query: routeQuery });
  } else {
    router.replace({
      query: { ...router.currentRoute.value.query, contentId: value },
    });
  }
});
</script>

<template>
  <div>
    <div class="mb-4">
      <VSkeletonLoader v-if="classroom === null" type="list-item" />
      <h2 v-else>
        <BtnBack /> {{ classroom.name }}
      </h2>
    </div>
    <VTabs v-model="activeTab" class="v-tabs-pill">
      <VTab
        v-for="item in tabs"
        :key="item.icon"
        :value="item.tab"
        @click="
          () =>
            $router.push({
              query: {
                tab: item.tab,
                type: $router.currentRoute.value.query.type,
              },
            })
        "
      >
        <VIcon size="20" start :icon="item.icon" />
        {{ item.title }}
      </VTab>
    </VTabs>

    <!-- For studuent -->
    <VWindow
      v-model="activeTab"
      class="mt-6 disable-tab-transition"
      :touch="false"
    >
      <!-- Content -->
      <VWindowItem value="content">
        <CourseContentForStudent
          :style="{
            display: contentItemSelected === null ? 'block' : 'none',
          }"
          :training-id="trainingId"
          :content-id="contentItemSelected"
          @selected="contentItemSelected = $event.id"
        />

        <ContentDetailForStudent
          v-if="contentItemSelected !== null"
          :content-id="contentItemSelected"
          @to-back="contentItemSelected = null"
        />
      </VWindowItem>

      <!-- Students List -->
      <VWindowItem value="students">
        <StudentsList :training-id="trainingId" />
      </VWindowItem>

      <!-- Scores -->
      <VWindowItem value="scores">
        <StudentScores :training-id="trainingId" />
      </VWindowItem>

      <!-- Feed -->
      <VWindowItem value="feed">
        <Forum :training-id="trainingId" />
      </VWindowItem>
    </VWindow>
  </div>
</template>

<route lang="yaml">
meta:
  action: read
  # subject: CurrentTraining
  subject: AdminCapacitationList
</route>
