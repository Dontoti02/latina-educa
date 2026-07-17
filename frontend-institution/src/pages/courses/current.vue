<script setup lang="ts">
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'
import { SessionStore } from '@/common/store'
import { ToastService } from '@/common/util/toast.service'
import type { CoursesPerPeriod } from '@/models/courses'
import { ClassroomService } from '@/services/classroom.service'
import BulbLightImg from '@images/illustrations/bulb-light.png'
import PencilRocketImg from '@images/illustrations/pencil-rocket.png'

const session = SessionStore()
const loading = ref(true)
const coursesOfCurrentPeriod = ref<CoursesPerPeriod>()

const getCourses = async () => {
  ClassroomService.getClassrooms(session.academicPeriod?.id ?? 0).then(response => {
    if (response.success)
      coursesOfCurrentPeriod.value = response.data[0]
    else
      ToastService.error(response.message)
  }).catch(error => {
    console.log(error)
    ToastService.error(error)
  }).finally(() => {
    loading.value = false
  })
}

onMounted(async () => {
  getCourses()
})
</script>

<template>
  <div
    v-if="loading"
    class="mt-4 w-100 d-flex justify-center rounded-lg"
  >
    <VRow>
      <VCol cols="12">
        <VSkeletonLoader
          class="w-100 gap-4 "
          type="image,list-item-avatar"
        />
      </VCol>
      <VCol
        v-for="index in 6"
        :key="index"
        cols="12"
        sm="6"
        md="4"
      >
        <VSkeletonLoader
          class="w-100 gap-4 "
          type="card"
        />
      </VCol>
    </VRow>
  </div>
  <div v-else>
    <div>
      <VCard>
        <VRow class="">
          <VCol
            cols="3"
            class="pl-8 pt-6"
          >
            <img
              :src="BulbLightImg"
              height="100"
            >
          </VCol>
          <VCol
            cols="6"
            class="pt-6 px-8 d-flex text-center justify-center align-center flex-column"
          >
            <h1>Cursos {{ session.isStudent() ? 'inscritos' : 'actuales' }}</h1>
            <p>Aquí podrás encontrar los cursos {{ session.isStudent() ? 'en los que estás inscrito en el' : 'actuales del' }} periodo académico {{ session.academicPeriod?.name }}.</p>
          </VCol>
          <VCol
            cols="3"
            class="d-flex justify-end align-end"
          >
            <img
              :src="PencilRocketImg"
              height="140"
            >
          </VCol>
        </VRow>
      </VCard>
      <VSpacer />
      <VCard class="mt-6 px-4 py-6">
        <p class="ml-2">
          Estás inscrito en {{ coursesOfCurrentPeriod?.classrooms.length }} cursos.
        </p>
        <VRow>
          <VCol
            v-for="course in coursesOfCurrentPeriod?.classrooms"
            :key="course.id"
            cols="12"
            sm="6"
            md="4"
          >
            <CourseItem
              :course="course"
              type="current"
              @toggle-favorite="course.is_favorite = !course.is_favorite"
              @image-changed="course.image = $event"
            />
          </VCol>
        </VRow>
      </VCard>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  action: read
  subject: CurrentCourses
</route>
