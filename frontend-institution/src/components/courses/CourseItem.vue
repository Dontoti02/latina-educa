<script setup lang="ts">
import { SessionStore } from '@/common/store'
import { ToastService } from '@/common/util/toast.service'
import type { Course } from '@/models/courses'
import { ClassroomService } from '@/services/classroom.service'
import { ImageUtils } from '@/utils/images'
import LaptopGirl from '@images/illustrations/laptop-girl.png'

const props = defineProps<{
  course: Course
  type: 'current' | 'archived'
}>()

const emit = defineEmits<{
  (e: 'toggleFavorite'): void
  (e: 'imageChanged', image: string): void
}>()

// Initial
const session = SessionStore()
const loadingFavorite = ref(false)
const changingImage = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

// Methods
const toggleFavorite = () => {
  loadingFavorite.value = true
  ClassroomService.toggleFavorite(props.course.id).then(response => {
    if (response.success)
      emit('toggleFavorite')
  }).catch(error => {
    ToastService.error(error)
  }).finally(() => {
    loadingFavorite.value = false
  })
}

const openInput = () => {
  if (fileInput.value)
    fileInput.value.click()
}

const changeImage = (event: any) => {
  if (event.target.files.length > 0) {
    const file = event.target.files[0]

    if (!file.type.startsWith('image/')) {
      ToastService.error(`El archivo ${file.name} no es una imagen válida`)

      return
    }

    const maxSizeInBytes = 2 * 1024 * 1024
    if (file.size > maxSizeInBytes) {
      ToastService.error(`El archivo ${file.name} excede el tamaño máximo permitido de 2 MB`)

      return
    }

    changingImage.value = true
    ClassroomService.uploadImage({ classroom_id: props.course.id, file })
      .then(response => {
        emit('imageChanged', response.data)
      })
      .catch(error => {
        ToastService.error(error)
      }).finally(() => {
        changingImage.value = false
      })
  }
}
</script>

<template>
  <VCard
    border
    :elevation="0"
    class="px-2 py-2 h-100 d-flex flex-column"
  >
    <div
      class="d-flex"
      style=" height: 100%;min-height: 200px;max-height: 250px;"
      cover
    >
      <template v-if="course.image !== null">
        <VImg
          :src="ImageUtils.getUrlImage(course.image)"
          alt="Course image"
          class="rounded"
        >
          <template #placeholder>
            <div class="d-flex align-center justify-center fill-height">
              <VProgressCircular indeterminate />
            </div>
          </template>
          <template #error>
            <VChip
              color="primary"
              class="w-100  rounded d-flex align-center justify-center fill-height mb-3 pt-4"
            >
              <VImg
                :src="LaptopGirl"
                alt="Card girl image"
                width="140"
                style="z-index: 2;"
              />
            </VChip>
          </template>
        </VImg>
      </template>
      <template v-else>
        <VChip
          color="primary"
          class="w-100 rounded d-flex align-center justify-center fill-height mb-3 pt-4"
        >
          <VImg
            :src="LaptopGirl"
            alt="Card girl image"
            style="z-index: 2;"
            width="140"
          />
        </VChip>
      </template>
      <VBtn
        v-if="session.isStudent() && !loadingFavorite"
        style="position: absolute; top: 0;right: 0;"
        class="mt-2 mr-2"
        color="primary"
        :icon="course.is_favorite ? 'tabler-star-filled' : 'tabler-star'"
        variant="text"
        density="comfortable"
        size="large"
        @click="toggleFavorite"
      />
      <VBtn
        v-if="session.isTeacher() && !changingImage"
        style="position: absolute; top: 0;right: 0;"
        class="mt-2 mr-2"
        color="white"
        icon="tabler-photo-edit"
        density="comfortable"
        size="large"
        @click="openInput"
      />
      <input
        ref="fileInput"
        type="file"
        style="display: none;"
        @change="changeImage"
      >
      <VProgressCircular
        v-if="loadingFavorite || changingImage"
        style="position: absolute; top: 0;right: 0;"
        class="mt-5 mr-5"
        density="comfortable"
        indeterminate
        size="20"
        width="3"
      />
    </div>

    <VCardItem class="px-4 pb-2">
      <div class="d-flex align-center justify-space-between">
        <VChip
          color="primary"
          label
        >
          Ciclo {{ course.cycle }}
        </VChip>
        <VBtn
          style="height: auto;"
          class="px-0 py-0"
          append-icon="tabler-users-plus"
          variant="text"
          @click="() => $router.push({
            path: session.isStudent() ? `/courses/student-course/${course.id}` : `/courses/teacher-course/${course.id}`,
            query: { tab: 'students', type },
          })"
        >
          {{ course.students }}
        </VBtn>
      </div>
      <div class="my-3">
        <h4>{{ course.course }}</h4>
        <p
          v-if="session.isStudent()"
          class="mb-0"
        >
          Tutor: {{ course.teacher ?? 'No asignado' }}
        </p>
      </div>
      <VRow class="mb-1">
        <template v-if="session.isStudent()">
          <VCol cols="6">
            <VBtn
              color="primary"
              variant="outlined"
              width="100%"
              @click="() => $router.push({ path: `/courses/student-course/${course.id}`, query: { tab: 'scores', type } })"
            >
              Calificaciones
            </VBtn>
          </VCol>
          <VCol cols="6">
            <VBtn
              color="primary"
              variant="flat"
              width="100%"
              @click="() => $router.push({ path: `/courses/student-course/${course.id}`, query: { tab: 'content', type } })"
            >
              Ver contenido
            </VBtn>
          </VCol>
        </template>
        <template v-else>
          <VCol cols="12">
            <VBtn
              color="primary"
              variant="flat"
              width="100%"
              @click="() => $router.push({ path: `/courses/teacher-course/${course.id}`, query: { tab: 'content', type } })"
            >
              Administrar curso
            </VBtn>
          </vcol>
        </template>
      </VRow>
    </VCardItem>
  </VCard>
</template>
