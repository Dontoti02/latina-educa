<script lang="ts" setup>
import { SessionStore } from '@/common/store'
import { ToastService } from '@/common/util/toast.service'
import ContentDetailForTeacher from '@/components/courses/content/ContentDetailForTeacher.vue'
import Evaluation from '@/components/courses/evaluations/Evaluation.vue'
import Forum from '@/components/courses/student-panels/Forum.vue'
import Attendance from '@/components/courses/teacher-panels/Attendance.vue'
import CourseContentForTeacher from '@/components/courses/teacher-panels/CourseContentForTeacher.vue'
import EvaluationGroup from '@/components/courses/teacher-panels/EvaluationGroup.vue'
import AttendanceList from '@/components/courses/teacher-panels/modals/AttendanceList.vue'
import StudentsListForTeacher from '@/components/courses/teacher-panels/StudentsListForTeacher.vue'
import type { Course } from '@/models/courses'
import { ClassroomService } from '@/services/classroom.service'
import { useRoute } from 'vue-router'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'

// Initial
const router = useRouter()
const session = SessionStore()
const route = useRoute()
const classroomId = +route.params.id
const contentSubPage = ref<'content-detail' | 'evaluations'>('content-detail')

// Tabs
const activeTab = ref(route.query.tab)

const tabs = [
  { title: 'Contenido', icon: 'tabler-book-2', tab: 'content' },
  { title: 'Participantes', icon: 'tabler-users', tab: 'students' },
  { title: 'Foro', icon: 'tabler-mailbox', tab: 'feed' },
  { title: 'Competencias', icon: 'tabler-award', tab: 'evaluation-group' },
  { title: 'Asistencia', icon: 'tabler-user-check', tab: 'attendance' },
]

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

// Select item
const selectItem = (args: { id: number; typeSubPage: 'content-detail' | 'evaluations' }) => {
  contentItemSelected.value = args.id
  contentSubPage.value = args.typeSubPage
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

    <!-- For teacher -->
    <VWindow
      v-if="session.isTeacher()"
      v-model="activeTab"
      class="mt-6 disable-tab-transition"
      :touch="false"
    >
      <!-- Content -->
      <VWindowItem value="content">
        <CourseContentForTeacher
          v-if="contentItemSelected === null"
          :classroom-id="classroomId"
          :content-id="contentItemSelected"
          @selected="selectItem($event)"
        />
        <template v-if="contentItemSelected !== null">
          <ContentDetailForTeacher
            v-if="contentSubPage === 'content-detail'"
            :content-id="contentItemSelected"
            :classroom-id="classroomId"
            @to-back="contentItemSelected = null"
            @to-evaluation=";contentItemSelected = $event;contentSubPage = 'evaluations'"
          />
          <Evaluation
            v-else
            :content-id="contentItemSelected"
            @to-back="contentItemSelected = null"
          />
        </template>
      </VWindowItem>

      <!-- Students List -->
      <VWindowItem value="students">
        <StudentsListForTeacher
          v-if="activeTab === 'students'"
          :classroom-id="classroomId"
          :active-tab="(activeTab as string)"
        />
      </VWindowItem>

      <!-- Feed -->
      <VWindowItem value="feed">
        <Forum :classroom-id="classroomId" />
      </VWindowItem>

      <!-- Evaluation Group -->
      <VWindowItem value="evaluation-group">
        <EvaluationGroup :classroom-id="classroomId" />
      </VWindowItem>

      <!-- Attendance -->
      <VWindowItem value="attendance">
        <Attendance :classroom-id="classroomId" />
      </VWindowItem>
    </VWindow>

    <AttendanceList />
  </div>
</template>

<route lang="yaml">
  meta:
    action: read
    subject: CurrentCourses
</route>
