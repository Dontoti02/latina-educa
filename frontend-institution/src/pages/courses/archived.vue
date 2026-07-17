<script setup lang="ts">
import { SessionStore } from '@/common/store'
import { ToastService } from '@/common/util/toast.service'
import CourseItem from '@/components/courses/CourseItem.vue'
import type { CoursesPerPeriod } from '@/models/courses'
import { ClassroomService } from '@/services/classroom.service'
import BulbLightImg from '@images/illustrations/bulb-light.png'
import PencilRocketImg from '@images/illustrations/pencil-rocket.png'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'

const session = SessionStore()
const loading = ref(true)

const search = ref<string>('')
const searchTimer = ref()

const coursesByPeriod = ref<Array<CoursesPerPeriod>>()
const coursesByPeriodFiltered = ref<Array<CoursesPerPeriod>>()

const getCourses = async () => {
  ClassroomService.getClassrooms().then(response => {
    if (response.success) {
      coursesByPeriod.value = response.data
      coursesByPeriodFiltered.value = response.data
    }
    else { ToastService.error(response.message) }
  }).catch(error => {
    console.log(error)
    ToastService.error(error)
  }).finally(() => {
    loading.value = false
  })
}

const filterCourses = () => {
  coursesByPeriodFiltered.value = coursesByPeriod.value!.filter(period => {
    return period.classrooms.some(classroom => {
      return classroom.course.toLowerCase().includes(search.value.toLowerCase().trim())
    })
  }).map(period => {
    const classrooms = period.classrooms.filter(classroom => {
      return classroom.course.toLowerCase().includes(search.value.toLowerCase().trim())
    })

    return {
      ...period,
      classrooms,
    }
  })
}

watch(search, () => {
  if (searchTimer.value)
    clearTimeout(searchTimer.value)

  searchTimer.value = setTimeout(() => {
    filterCourses()
  }, 500)
})

onMounted(async () => {
  getCourses()
})
</script>

<template>
  <div
    v-if="loading"
    class="mt-4 w-100 d-flex justify-center"
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
          class="pt-6 px-8 pb-6 d-flex text-center justify-center align-center flex-column"
        >
          <h1>Cursos archivados</h1>
          <p>Aquí podrás encontrar los cursos que has llevado en los periodos académicos previos al {{ session.academicPeriod?.name }}.</p>
          <VRow
            style="width: 80%;"
            align="center"
            dense
            justify="center"
          >
            <VCol cols="8">
              <VTextField
                v-model="search"
                placeholder="Buscar curso"
                clearable
                density="compact"
              />
            </VCol>
            <VCol cols="2">
              <VBtn
                color="primary"
                icon="tabler-search"
                rounded="sm"
                density="comfortable"
                @click="filterCourses"
              />
            </vcol>
          </VRow>
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
    <VCard class="mt-6 px-4 pb-6">
      <div
        v-if="coursesByPeriodFiltered?.length === 0"
        class="d-flex align-center justify-center pt-6"
      >
        No se encontraron cursos con la búsqueda indicada.
      </div>
      <div
        v-for="period in coursesByPeriodFiltered"
        v-else
        :key="period.id"
        class="pt-6"
      >
        <div class="ml-2 mb-2">
          <h3>
            {{ period.name }}
          </h3>
          <p>Cursos inscritos: {{ period.classrooms.length }}</p>
        </div>
        <VRow>
          <VCol
            v-for="classroom in period.classrooms"
            :key="classroom.id"
            cols="12"
            sm="6"
            md="4"
          >
            <CourseItem
              :course="classroom"
              type="archived"
              @toggle-favorite="classroom.is_favorite = !classroom.is_favorite"
              @image-changed="classroom.image = $event"
            />
          </VCol>
        </VRow>
      </div>
    </VCard>
  </div>
</template>

<route lang="yaml">
meta:
  action: read
  subject: ArchivedCourses
      </route>
