<script lang="ts" setup>
import { SessionStore } from '@/common/store'
import { ToastService } from '@/common/util/toast.service'
import CapacitationContentDetailForTeacher from '@/components/capacitations/content/ContentDetailForTeacher.vue'
import CapacitationContentForTeacher from '@/components/capacitations/teacher-panels/ContentForTeacher.vue'
import EvaluationGroup from '@/components/capacitations/teacher-panels/EvaluationGroup.vue'
import StudentsListForTeacher from '@/components/capacitations/teacher-panels/StudentsListForTeacher.vue'
import { Capacitation } from '@/models/capacitations'
import { CapacitationService } from '@/services/capacitations.service'
import { useRoute } from 'vue-router'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'
import Forum from '@/components/capacitations/teacher-panels/Forum.vue'
import Attendance from '@/components/capacitations/teacher-panels/Attendance.vue'
import AttendanceList from '@/components/capacitations/teacher-panels/modals/AttendanceList.vue'
import Evaluation from '@/components/capacitations/evaluations/Evaluation.vue'
import BtnBack from '@/common/components/BtnBack.vue';

// Initial
const router = useRouter()
const route = useRoute()
const capacitationId = +route.params.id
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
const capacitation = ref<Capacitation | null>(null)

// Content
const contentItemSelected = ref<number | null>(route.query.contentId ? +route.query.contentId : null)

const getClassroomInfo = () => {
  CapacitationService.getCapacitation(capacitationId)
    .then(response => {
      capacitation.value = response.data
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
        v-if="capacitation === null"
        type="list-item"
      />
      <h2 v-else>
        <BtnBack /> {{ capacitation.name }}
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

    <!-- For teacher capacitation -->
    <VWindow
      v-if="capacitation?.is_teacher"
      v-model="activeTab"
      class="mt-6 disable-tab-transition"
      :touch="false"
    >
      <!-- Content --> 
      <VWindowItem value="content">
        <CapacitationContentForTeacher
          v-if="contentItemSelected === null"
          :training-id="capacitationId"
          :content-id="contentItemSelected"
          @selected="selectItem($event)"
          :capacitation=" capacitation"
        />
 
        <template v-if="contentItemSelected !== null">
          <CapacitationContentDetailForTeacher
            v-if="contentSubPage === 'content-detail'"
            :content-id="contentItemSelected"
            :classroom-id="capacitationId"
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
          :classroom-id="capacitationId"
          :active-tab="(activeTab as string)"
        />
      </VWindowItem> 

      <!-- Feed -->
       <VWindowItem value="feed">
        <Forum :training-id="capacitationId" />
      </VWindowItem> 

      <!-- Evaluation Group -->
       <VWindowItem value="evaluation-group">
        <EvaluationGroup :classroom-id="capacitationId" />
      </VWindowItem> 

      <!-- Attendance -->
       <VWindowItem value="attendance">
        <Attendance 
          :classroom-id="capacitationId" 
          :capacitation="capacitation"
        />
      </VWindowItem> 
    </VWindow>
    <AttendanceList />
  </div>
</template>

<route lang="yaml">
  meta:
    action: read
    subject: AdminCapacitationList
</route>
