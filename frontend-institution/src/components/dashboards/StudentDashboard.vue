<script setup lang="ts">
import { SessionStore } from '@/common/store'
import type { StudentDashboard } from '@/models/dashboard'
import type { SessionDTO } from '@/models/login'
import { DashboardService } from '@/services/dashboard.service'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'
import LastAssignments from './partials/Student/LastAssignments.vue'
import LastPublications from './partials/Student/LastPublications.vue'
import MyAttendances from './partials/Student/MyAttendances.vue'
import MyCourses from './partials/Student/MyCourses.vue'
import Schedule from './partials/Student/Schedule.vue'
import Statistics from './partials/Student/Statistics.vue'
import WelcomeUser from './partials/Student/WelcomeUser.vue'

const dashboard = ref<StudentDashboard>()
const sessionStore = SessionStore()
const user = ref<SessionDTO | null>(null)
const loading = ref(true)

const getData = () => {
  loading.value = true
  DashboardService.getStudentDashboard()
    .then(response => {
      dashboard.value = response.data as StudentDashboard
    })
    .finally(() => {
      loading.value = false
    })
}

onMounted(() => {
  user.value = sessionStore.get().user
  getData()
})
</script>

<template>
  <div>
    <VRow v-if="loading">
      <VCol
        cols="12"
        md="5"
        lg="4"
      >
        <!-- Welcome -->
        <VSkeletonLoader
          class="w-100 gap-4 "
          type="article"
        />
      </VCol>
      <VCol
        cols="12"
        md="7"
        lg="8"
      >
        <!-- Summary -->
        <VSkeletonLoader
          class="w-100 gap-4 "
          type="article"
        />
      </VCol>
      <VCol
        cols="12"
        md="4"
      >
        <!-- Courses -->
        <VSkeletonLoader
          class="w-100 "
          type="subtitle,list-item-two-line,list-item-two-line,list-item-two-line"
        />
      </VCol>
      <VCol
        cols="12"
        md="4"
      >
        <!-- Tasks -->
        <VSkeletonLoader
          class="w-100 "
          type="subtitle,list-item-two-line,list-item-two-line,list-item-two-line"
        />
      </VCol>
      <VCol
        cols="12"
        md="4"
      >
        <!-- Attendance -->
        <VSkeletonLoader
          class="w-100 "
          type="subtitle,list-item-two-line,list-item-two-line,list-item-two-line"
        />
      </VCol>
      <VCol
        cols="12"
        md="6"
      >
        <!-- Posts -->
        <VSkeletonLoader
          class="w-100 gap-2"
          type="subtitle,list-item-avatar,list-item-avatar,list-item-avatar"
        />
      </VCol>
      <VCol
        cols="12"
        md="6"
      >
        <!-- Schedule -->
        <VSkeletonLoader
          class="w-100 "
          type="table-row,table-row,table-row,table-row,table-row,table-row"
        />
      </VCol>
    </VRow>
    <VRow
      v-if="!loading && dashboard"
      class="match-height"
    >
      <VCol v-if="user?.role.id === 3 && dashboard.alerts && dashboard.alerts.classrooms.length > 0" cols="12">
        <VCard>
          <VCardTitle class="pl-6 pt-4">
            <VIcon
              icon="tabler-alert-triangle-filled"
              color="warning"
              class="me-2"
            /> Tienes demasiadas faltas acumuladas en los siguientes cursos
            <VCardSubtitle class="ms-6">
              Al acumular demasiadas faltas serás retirado de los cursos
            </VCardSubtitle>
          </VCardTitle>
          <VCardText>
            <VList>
              <VListItem
                v-for="(item, index) in dashboard.alerts.classrooms"
                :key="`alert-list-${index}`"
              >
                <div class="d-flex">
                  <VIcon
                    :color="item.absences/item.total < 0.2 ? 'primary' : item.absences/item.total < 0.25 ? 'warning' : 'error'"
                    icon="tabler-circle-check-filled"
                    class="me-2"
                  />
                  <div class="me-4">
                    {{ item.course }}
                  </div>
                  <div class="d-flex align-center">
                    <div
                      class="me-2"
                      style="inline-size: 10rem;"
                    >
                      <VProgressLinear
                        :model-value="item.absences/item.total*100"
                        :color="item.absences/item.total < 0.2 ? 'primary' : item.absences/item.total < 0.25 ? 'warning' : 'error'"
                        height="8"
                        rounded-bar
                        rounded
                      />
                    </div>
                    <span class="text-disabled">({{item.absences}}/{{item.total}}) {{item.absences*100/item.total}}%</span>
                  </div>
                </div>
              </VListItem>
            </VList>
          </VCardText>
        </VCard>
      </VCol>
      <VCol
        cols="12"
        md="5"
        lg="4"
      >
        <WelcomeUser :user="user" />
      </VCol>
      <VCol
        cols="12"
        md="7"
        lg="8"
      >
        <Statistics
          :summary="dashboard.summary"
          :user="user"
        />
      </VCol>
      <VCol
        cols="12"
        md="4"
      >
        <MyCourses
          :courses="dashboard.courses"
          :user="user"
        />
      </VCol>
      <VCol
        cols="12"
        md="4"
      >
        <LastAssignments
          :assignments="dashboard.tasks"
          :user="user"
        />
      </VCol>
      <VCol
        cols="12"
        md="4"
      >
        <MyAttendances
          :attendances="dashboard.assistants"
          :user="user"
        />
      </VCol>
      <VCol
        cols="12"
        md="6"
      >
        <LastPublications :posts="dashboard.publications" />
      </VCol>
      <VCol
        cols="12"
        md="6"
      >
        <Schedule :schedule="dashboard.schedule" />
      </VCol>
    </VRow>
  </div>
</template>
