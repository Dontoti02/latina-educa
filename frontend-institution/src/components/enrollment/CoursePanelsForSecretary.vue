<script lang="ts" setup>
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'
import { ToastService } from '@/common/util/toast.service'
import StudentsList from '@/components/courses/student-panels/StudentsList.vue'
import type { Course } from '@/models/courses'
import type { GetParticipantsForTeacher } from '@/models/participants'
import { ClassroomService } from '@/services/classroom.service'

// Initial
const props = withDefaults(defineProps<{
  classroomId: number
  initialActiveTab?: 'content' | 'students' | 'scores'
  student: {
    person_id: GetParticipantsForTeacher['person_id']
    names: GetParticipantsForTeacher['names']
  }
}>(), {
  initialActiveTab: 'content',
})

const emit = defineEmits<{
  (e: 'toBack'): void
}>()

// Tabs
const activeTab = ref(props.initialActiveTab)

const tabs = [
  { title: 'Contenido', icon: 'tabler-book-2', tab: 'content' },
  { title: 'Participantes', icon: 'tabler-users', tab: 'students' },
  { title: 'Calificaciones', icon: 'tabler-school', tab: 'scores' },

  // { title: 'Foro', icon: 'tabler-mailbox', tab: 'feed' },
]

// Classroom info
const classroom = ref<Course | null>(null)

const getClassroomInfo = () => {
  ClassroomService.getClassroom(props.classroomId)
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
</script>

<template>
  <div>
    <div class="mb-4">
      <VSkeletonLoader
        v-if="classroom === null"
        type="list-item"
      />
      <div
        v-else
        class="d-flex justify-space-between align-end"
      >
        <div class="d-flex align-center">
          <VBtn
            variant="tonal"
            icon="tabler-chevron-left"
            class="mr-2"
            density="compact"
            rounded="sm"
            @click="emit('toBack')"
          />
          <h2>
            {{ classroom.course }}
          </h2>
        </div>
        <div class="text-body-1 text-capitalize">
          Estudiante: {{ props.student.names.toLocaleLowerCase() }}
        </div>
      </div>
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
        <CourseContentForSecretary :classroom-id="classroomId" />
      </VWindowItem>

      <!-- Students List -->
      <VWindowItem value="students">
        <StudentsList :classroom-id="classroomId" />
      </VWindowItem>

      <!-- Scores -->
      <VWindowItem value="scores">
        <StudentScoresForSecretary
          :classroom-id="classroomId"
          :student="student"
        />
      </VWindowItem>

      <!-- Feed -->
      <!--
        <VWindowItem value="feed">
        <Forum :classroom-id="classroomId" />
        </VWindowItem>
      -->
    </VWindow>
  </div>
</template>
