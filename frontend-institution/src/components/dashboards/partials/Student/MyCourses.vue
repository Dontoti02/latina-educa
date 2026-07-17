<script setup lang="ts">
import { SessionStore } from '@/common/store';
import type { Course } from '@/models/dashboard';
import type { SessionDTO } from '@/models/login';

defineProps<{
  courses: Course[]
  user: SessionDTO | null
}>()

const session = SessionStore()

const colors = ref(['primary', 'success', 'error', 'secondary', 'info'])

const getColors = (index: number) => {
  return colors.value[index % colors.value.length]
}
</script>

<template>
  <VCard
    title="Cursos"
    :subtitle="session.isTeacher() ? `Tienes a cargo ${courses.length} cursos` : `Estas inscrito en ${courses.length} acursos`"
  >
    <VCardText>
      <p
        v-if="courses.length === 0"
        class="text-center"
      >
        No se han encontrado cursos registrados
      </p>
      <VList class="card-list">
        <VListItem
          v-for="(course, index) in courses"
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
          <VListItemSubtitle
            v-if="session.isStudent()"
            class="text-disabled"
          >
            {{ course.teacher }}
          </VListItemSubtitle>
          <VListItemSubtitle
            v-else
            class="text-disabled"
          >
            {{ course.period }} | {{ course.students }} estudiantes 
          </VListItemSubtitle>
          <template #append>
            <VBtn
              color="secondary"
              variant="text"
              icon="tabler-external-link"
              size="small"
              :to="'/courses/'+ (session.isStudent() ? 'student' : 'teacher') + '-course/' + course.id + '?type=current'"
            />
          </template>
        </VListItem>
      </VList>
    </VCardText>
  </VCard>
</template>
