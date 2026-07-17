<script setup lang="ts">
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'
import { ToastService } from '@/common/util/toast.service'
import type { StudentScore } from '@/models/student-scores'
import { StudentScoresService } from '@/services/student-scores.service'

const props = defineProps<{
  classroomId: number
}>()

const colors = ['#9575CD', '#7986CB', '#4DB6AC', '#BA68C8', '#F06292', '']
const studentScores = ref<StudentScore>()
const loading = ref(false)

const getStudentEvaluations = () => {
  loading.value = true
  StudentScoresService.getStudentScores(props.classroomId)
    .then(response => {
      studentScores.value = response.data
    })
    .catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loading.value = false
    })
}

onMounted(() => {
  getStudentEvaluations()
})
</script>

<template>
  <template v-if="loading">
    <VRow>
      <VCol
        v-for="skeleton in 3"
        :key="skeleton"
        cols="12"
        md="4"
      >
        <VSkeletonLoader
          type="article"
          class="mb-5"
        />
      </VCol>
    </VRow>
    <VSkeletonLoader
      type="table-tbody"
      class="mb-5"
    />
  </template>
  <template v-else>
    <VCard class="mb-6">
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            md="4"
            class="px-6"
          >
            <div class="d-flex align-center h-100">
              <VAvatar
                class="mr-4"
                color="info"
                variant="tonal"
                rounded
              >
                <VIcon
                  size="large"
                  icon="tabler-check"
                />
              </VAvatar>
              <div class="d-flex flex-column gap-y-1">
                <div class="text-body-1 text-capitalize">
                  Estado
                </div>
                <h4 class="text-h4">
                  {{ studentScores?.status || 'No disponible' }}
                </h4>
              </div>
            </div>
          </VCol>
          <VDivider
            class="d-md-block d-none"
            vertical
          />
          <VDivider class="d-md-none d-block" />

          <VCol
            cols="12"
            md="4"
            class="px-6"
          >
            <div class="d-flex align-center h-100">
              <VAvatar
                class="mr-4"
                color="success"
                variant="tonal"
                rounded
              >
                <VIcon
                  size="large"
                  icon="tabler-school"
                />
              </VAvatar>
              <div class="d-flex flex-column gap-y-1">
                <div class="text-body-1 text-capitalize">
                  Nota final
                </div>
                <h4 class="text-h4">
                  {{ studentScores?.final_note }}
                </h4>
              </div>
            </div>
          </VCol>

          <VDivider
            class="d-md-block d-none"
            vertical
          />
          <VDivider class="d-md-none d-block" />

          <VCol
            cols="12"
            md="4"
            class="px-6"
          >
            <div class="d-flex align-center h-100">
              <VAvatar
                class="mr-4"
                color="primary"
                variant="tonal"
                rounded
              >
                <VIcon
                  size="large"
                  icon="tabler-file-time"
                />
              </VAvatar>
              <div class="d-flex flex-column gap-y-1">
                <div class="text-body-1 text-capitalize">
                  Próxima evaluación
                </div>
                <h4 class="text-h4">
                  {{ !!studentScores?.next_evaluation ? studentScores?.next_evaluation.title : 'No disponible' }}
                </h4>
                <div class="text-body-1 text-capitalize">
                  {{ !!studentScores?.next_evaluation ? studentScores?.next_evaluation.date_start : 'No disponible' }}
                </div>
              </div>
            </div>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>

    <VExpansionPanels multiple>
      <VExpansionPanel
        v-for="courseContent in studentScores?.content_groups || []"
        :key="courseContent.id"
      >
        <VExpansionPanelTitle>
          <h3>{{ courseContent.title }} </h3>
        </VExpansionPanelTitle>
        <VExpansionPanelText class="mt-2">
          <VTable
            density="compact"
            class="text-no-wrap"
          >
            <thead>
              <tr>
                <th>
                  Evaluaciones
                </th>
                <th class="text-center">
                  Fecha programada
                </th>
                <th class="text-center">
                  Fecha de registro
                </th>
                <th class="text-center">
                  Competencia
                </th>
                <th class="text-center">
                  Puntaje
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in courseContent.evaluations || []"
                :key="item.id"
              >
                <td>
                  {{ item.title }}
                </td>
                <td class="text-center">
                  {{ item.date }}
                </td>
                <td class="text-center">
                  {{ item.date_start }}
                </td>
                <td class="text-center">
                  {{ item.evaluation_group }}
                </td>
                <td class="text-center">
                  {{ item.score }}
                </td>
              </tr>
            </tbody>
          </VTable>
          <VDivider />
          <VCard elevation="0">
            <VCardText class="px-4">
              <VRow>
                <VChip
                  v-for="(i, index) in courseContent.evaluation_groups || []"
                  :key="i"
                  class="mr-2 mt-2"
                  style="height: 30px;font-size: 15px;"
                  :color="colors[index] || 'primary'"
                >
                  {{ `${i.title} (${i.weight * 100}%): ${i.score} pts ` }}
                </VChip>
              </VRow>
            </VCardText>
          </VCard>
        </VExpansionPanelText>
      </VExpansionPanel>
    </VExpansionPanels>
  </template>
</template>
