<script setup lang="ts">
import { SessionStore } from '@/common/store'
import type { SecretaryDashboard } from '@/models/dashboard'
import type { SessionDTO } from '@/models/login'
import { DashboardService } from '@/services/dashboard.service'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'
import Careers from './partials/Secretary/Careers.vue'
import Statistics from './partials/Student/Statistics.vue'
import WelcomeUser from './partials/Student/WelcomeUser.vue'

const dashboard = ref<SecretaryDashboard>()
const sessionStore = SessionStore()
const user = ref<SessionDTO | null>(null)
const loading = ref(true)

const getData = () => {
  loading.value = true
  DashboardService.getStudentDashboard()
    .then(response => {
      dashboard.value = response.data as SecretaryDashboard
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
    </VRow>
    <VRow
      v-if="!loading && dashboard"
      class="match-height"
    >
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

      <template
        v-if="dashboard.study_programs.length > 0"
      >
        <VCol
          cols="12"
          md="4"
        >
          <Careers
            :careers="dashboard.study_programs"
            :user="user"
          />
        </VCol>

        <VCol
          cols="12"
          md="4"
        >
          <TopCourses
            :careers="dashboard.study_programs"
            :user="user"
          />
        </VCol>

        <VCol
          cols="12"
          md="4"
        >
          <AttendanceSummary
            :careers="dashboard.study_programs"
            :user="user"
          />
        </VCol>
      </template>
      <VCol v-if="dashboard.alerts.imports" cols="12">
        <VCard>
          <VCardTitle class="pl-6 pt-4 d-flex gap-2 align-center text-warning">
            <VIcon
              icon="tabler-alert-triangle-filled"
              color="warning"
              class="me-2"
            /> Importaciones sin realizar
          </VCardTitle>
          <VCardText>
            {{ dashboard.alerts.imports }}
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
