<script lang="ts" setup>
import { ToastService } from '@/common/util/toast.service'
import ContentDetailForStudent from '@/components/courses/content/ContentDetailForStudent.vue'
import CourseContentForStudent from '@/components/courses/student-panels/CourseContentForStudent.vue'
import Forum from '@/components/courses/student-panels/Forum.vue'
import StudentScores from '@/components/courses/student-panels/StudentScores.vue'
import StudentsList from '@/components/courses/student-panels/StudentsList.vue'
import type { Course } from '@/models/courses'
import { ClassroomService } from '@/services/classroom.service'
import { useRoute } from 'vue-router'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'

// Tabs
const tabs = [
  { title: 'Contenido', icon: 'tabler-book-2', tab: 'content' },
  { title: 'Participantes', icon: 'tabler-users', tab: 'students' },
  { title: 'Calificaciones', icon: 'tabler-school', tab: 'scores' },
  { title: 'Foro', icon: 'tabler-mailbox', tab: 'feed' },
]

// Initial
const router = useRouter()
const route = useRoute()
const activeTab = ref(route.query.tab)
const classroomId = +route.params.id

// Classroom info
const classroom = ref<Course | null>(null)

// Content
const contentItemSelected = ref<number | null>(route.query.contentId ? +route.query.contentId : null)

const getClassroomInfo = () => {
  ClassroomService.getClassroom(classroomId)
    .then(response => {
      classroom.value = response.data
    })
    .catch(error => {
      ToastService.error(error)
    })
}



// Mounted
onBeforeMount(() => {
  getClassroomInfo()
})

// Watchers
watch(contentItemSelected, (value) => {
  if(value === null) {
    const routeQuery = { ...router.currentRoute.value.query }
    delete routeQuery.contentId 
    router.replace({ query: routeQuery }) 
  } else {
    router.replace({ query: { ...router.currentRoute.value.query, contentId: value } })
  }
})
</script>

<template>
  <div>
    <div class="mb-4">
      <VSkeletonLoader
        v-if="classroom === null"
        type="list-item"
      />
      <h2 v-else>
        {{ classroom.course }}
      </h2>
    </div>
    <VTabs
      v-model="activeTab"
      class="v-tabs-pill"
    >
      <VTab
        v-for="item in tabs"
        :key="item.icon"
        :value="item.tab"
        @click="() => $router.push({ query: { tab: item.tab, type: $router.currentRoute.value.query.type } })"
      >
        <VIcon
          size="20"
          start
          :icon="item.icon"
        />
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
          :classroom-id="classroomId"
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
        <StudentsList :classroom-id="classroomId" />
      </VWindowItem>

      <!-- Scores -->
      <VWindowItem value="scores">
        <StudentScores :classroom-id="classroomId" />
      </VWindowItem>

      <!-- Feed -->
      <VWindowItem value="feed">
        <Forum :classroom-id="classroomId" />
      </VWindowItem>
    </VWindow>
  </div>
</template>

<route lang="yaml">
meta:
  action: read
  subject: CurrentCourses
        </route>
