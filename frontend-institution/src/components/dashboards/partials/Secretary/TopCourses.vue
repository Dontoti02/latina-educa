<script setup lang="ts">
import type { StudyProgram } from '@/models/dashboard'
import type { SessionDTO } from '@/models/login'

const props = defineProps<{
  careers: StudyProgram[]
  user: SessionDTO | null
}>()

const careerSelected = ref<StudyProgram>()

const colors = ref(['primary', 'success', 'error', 'secondary', 'info'])

const getColors = (index: number) => {
  return colors.value[index % colors.value.length]
}

const getMenuList = computed(() => {
  if (!props.careers)
    return []

  return props.careers.map((career, index) => {
    return {
      title: career.name,
      value: index,
    }
  })
})

const changeCourse = (data: number) => {
  careerSelected.value = props.careers[data]
}

onMounted(() => {
  if (props.careers.length > 0)
    changeCourse(0)
})
</script>

<template>
  <VCard
    title="Top de cursos"
    :subtitle="`${careerSelected?.name} (${careerSelected?.total_classrooms} cursos)`"
  >
    <template #append>
      <div
        v-if="careers.length > 0"
        class="mt-n4 me-n2"
      >
        <MoreBtn
          :menu-list="getMenuList"
          @change="changeCourse($event[0])"
        />
      </div>
    </template>
    <VCardText>
      <p
        v-if="careerSelected?.top_classrooms.length === 0"
        class="text-center"
      >
        No se han encontrado cursos registrados
      </p>
      <VList class="card-list">
        <VListItem
          v-for="(course, index) in careerSelected?.top_classrooms"
          :key="course.id"
        >
          <template #prepend>
            <VAvatar
              size="34"
              :color="getColors(index)"
              variant="tonal"
              rounded
            >
              <VIcon icon="tabler-school" />
            </VAvatar>
          </template>

          <VListItemTitle class="font-weight-medium">
            {{ course.name }}
          </VListItemTitle>

          <VListItemSubtitle class="text-disabled">
            {{ course.teacher ?? 'Profesor no asignado' }}
          </VListItemSubtitle>

          <template #append>
            <VListItemSubtitle class="text-disabled">
              <div>{{ course.students }} alumnos</div>
            </VListItemSubtitle>
          </template>
        </VListItem>
      </VList>
    </VCardText>
  </VCard>
</template>
