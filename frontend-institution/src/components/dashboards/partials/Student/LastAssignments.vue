<script setup lang="ts">
import { SessionStore } from '@/common/store';
import type { Assignments } from '@/models/dashboard';
import type { SessionDTO } from '@/models/login';

defineProps<{
  assignments: Assignments
  user: SessionDTO | null
}>()

const studentTabs = ['Pendientes', 'Evaluados']
const teacherTabs = ['Próximas', 'Pasadas']

const currentActiveTab = ref('New')
const session = SessionStore()
</script>

<template>
  <VCard
    title="Tareas"
    :subtitle="user?.role.id === 3 ? `Tienes ${assignments.pending.length} tareas pendientes` : `Tienes ${assignments.pending.length} tareas por revisar`"
  >
    <VTabs
      v-model="currentActiveTab"
      grow
    >
      <VTab
        v-for="tab in user?.role.id === 3 ? studentTabs : teacherTabs"
        :key="tab"
        :value="tab"
      >
        {{ tab }}
      </VTab>
    </VTabs>

    <VCardText>
      <VWindow
        v-model="currentActiveTab"
        class="disable-tab-transition"
      >
        <VWindowItem
          v-for="tab in user?.role.id === 3 ? studentTabs : teacherTabs"
          :key="tab"
          :value="tab"
        >
          <template
            v-for="(item, index) in (tab === 'Pendientes' || tab === 'Próximas') ? assignments.pending : assignments.evaluated"
            :key="item.id"
          >
            <VTimeline
              side="end"
              align="start"
              truncate-line="both"
              density="compact"
              class="v-timeline-density-compact v-timeline-icon-only"
            >
              <VTimelineItem
                fill-dot
                size="small"
              >
                <template #icon>
                  <VIcon
                    size="20"
                    :icon="item.type === 'evaluation' ? 'tabler-award' : 'tabler-notebook'"
                    :color="item.type === 'evaluation' ? 'success' : 'primary'"
                  />
                </template>
                <p :class="`text-sm text-${item.type === 'evaluation' ? 'success' : 'primary'} mb-0`">
                  {{ item.type === 'evaluation' ? 'EVALUACIÓN' : 'TAREA' }} ({{ item.course }}) 
                  <VBtn
                    color="secondary"
                    variant="text"
                    density="compact"
                    icon="tabler-external-link"
                    size="small"
                    :to="'/courses/'+ (session.isStudent() ? 'student' : 'teacher') + '-course/' + item.classroom_id + '?type=current&contentId=' + item.content_id"
                  />
                </p>
                <p class="app-timeline-title mb-0">
                  {{ item.title }}
                </p>
                <span class="text-disabled text-body-2">
                  {{ item.date_limit }}
                </span>
              </VTimelineItem>
            </VTimeline>

            <VDivider
              v-if="index <= ((tab === 'Pendientes' || tab === 'Próximas') ? assignments.pending.length - 2 : assignments.evaluated.length - 2)"
              class="my-3"
              style="border-style: dashed;"
            />
          </template>
          <template v-if="tab === 'Pendientes' || tab === 'Próximas'">
            <p
              v-if="assignments.pending.length === 0"
              class="text-center"
            >
              No se han encontrado tareas pendientes
            </p>
          </template>
          <template v-else>
            <p
              v-if="assignments.evaluated.length === 0"
              class="text-center"
            >
              No se han encontrado tareas evaluadas
            </p>
          </template>
        </VWindowItem>
      </VWindow>
    </VCardText>
  </VCard>
</template>
