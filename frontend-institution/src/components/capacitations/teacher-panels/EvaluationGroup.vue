<script setup lang="ts">
import { betweenValidator, requiredValidator } from '@/@core/utils/validators'
import { ToastService } from '@/common/util/toast.service'
import type { CapacitationEvaluationGroupCreate, EvaluationGroupCreate, GetEvaluationGroup } from '@/models/evaluation-group'
import { CapacitationEvaluationGroupService } from '@/services/capacitation-evaluation-group.service'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'

// Initial
const props = defineProps<{
  classroomId: number
}>()

const loading = ref(false)
const loadingUpdate = ref(false)

const evaluationGroupsOriginal = ref<Array<GetEvaluationGroup>>([])
const evaluationGroups = ref<Array<GetEvaluationGroup>>([])
const newEvaluationGroups = ref<EvaluationGroupCreate['create']>([])
const evaluationGroupsIdsDelete = ref<Array<number>>([])

// Get data
const getEvaluationGroup = () => {
  loading.value = true
  CapacitationEvaluationGroupService.getEvaluationGroupList(props.classroomId)
    .then(response => {
      evaluationGroups.value = response.data
      evaluationGroupsOriginal.value = JSON.parse(JSON.stringify(response.data))
    })
    .catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loading.value = false
    })
}

// Mounted
onBeforeMount(() => {
  getEvaluationGroup()
})

// Actions
const updateEvaluationGroup = () => {
  const titleEmpty = newEvaluationGroups.value.some(item => !item.title) || evaluationGroups.value.some(item => !item.title)
  if (titleEmpty) {
    ToastService.error('El nombre de la competencia no puede estar vacío')

    return
  }

  const weightEmpty = newEvaluationGroups.value.some(item => !item.weight) || evaluationGroups.value.some(item => !item.weight || item.weight <= 0)
  if (weightEmpty) {
    ToastService.error('El porcentaje de la competencia no puede estar vacío')

    return
  }

  loadingUpdate.value = true

  const args: CapacitationEvaluationGroupCreate = {
    training_id: props.classroomId,
    create: newEvaluationGroups.value,
    update: evaluationGroups.value.filter(item => {
      const original = evaluationGroupsOriginal.value.find(i => i.id === item.id)

      return original && (original.title !== item.title || original.weight !== item.weight)
    }),
    delete: evaluationGroupsIdsDelete.value,
  }

  CapacitationEvaluationGroupService.updateEvaluationGroup(args)
    .then(response => {
      ToastService.success('Competencia actualizada')

      evaluationGroups.value = response.data
      evaluationGroupsOriginal.value = JSON.parse(JSON.stringify(response.data))
      newEvaluationGroups.value = []
      evaluationGroupsIdsDelete.value = []
    })
    .catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loadingUpdate.value = false
    })
}

const deleteEvaluationGroup = (evaluationGroup: GetEvaluationGroup) => {
  if (evaluationGroup.id)
    evaluationGroupsIdsDelete.value.push(evaluationGroup.id)

  evaluationGroups.value = evaluationGroups.value.filter(item => item.id !== evaluationGroup.id)
}

const deleteNewEvaluationGroup = (index: number) => {
  newEvaluationGroups.value.splice(index, 1)
}

// Computeds
const weightTotal = computed(() => {
  return evaluationGroups.value.reduce((acc, item) => {
    return acc + item.weight * 100
  }, 0) / 100 + newEvaluationGroups.value.reduce((acc, item) => {
    return acc + item.weight * 100
  }, 0) / 100
})
</script>

<template>
  <div v-if="loading">
    <VRow>
      <VCol cols="12">
        <VSkeletonLoader type="table" />
      </VCol>
    </VRow>
  </div>
  <div v-else>
    <VRow
      justify="end"
      class="mb-2"
    >
      <VCol
        cols="4"
        class="d-flex justify-end gap-2"
      >
        <VBtn
          text="Agregar competencia"
          class="text-none"
          :disabled="loadingUpdate"
          @click="newEvaluationGroups.push({ title: '', weight: 0 })"
        />
      </VCol>
    </VRow>
    <VCard class="py-4">
      <VTable class="text-no-wrap evaluation-groups-table">
        <thead>
          <tr>
            <th class="text-left">
              NOMBRE
            </th>
            <th class="text-left">
              PROCENTAJE
            </th>
          </tr>
        </thead>
        <TransitionGroup
          name="list"
          tag="tbody"
        >
          <tr
            v-for="(evaluationGroup) in evaluationGroups"
            :key="evaluationGroup.id"
          >
            <td
              class="text-center py-2"
              style="width: 450px;height: auto !important; vertical-align: sub;"
            >
              <VTextField
                v-model="evaluationGroup.title"
                prepend-inner-icon="tabler-abc"
                :rules="[requiredValidator]"
              />
            </td>
            <td
              class="text-center py-2 d-flex"
              style="height: auto !important; vertical-align: sub;"
            >
              <div>
                <VTextField
                  v-model="evaluationGroup.weight"
                  type="number"
                  prepend-inner-icon="tabler-123"
                  :rules="[requiredValidator, betweenValidator(evaluationGroup.weight, 0.01, 1)]"
                />
              </div>
              <VBtn
                icon="tabler-trash"
                class="ml-2"
                size="x-large"
                variant="text"
                density="compact"
                color="error"
                :disabled="loadingUpdate"
                @click="deleteEvaluationGroup(evaluationGroup)"
              />
            </td>
          </tr>
          <tr
            v-for="(newEvaluationGroup, index) in newEvaluationGroups"
            :key="index"
          >
            <td
              class="text-center py-2"
              style="width: 450px;height: auto !important; vertical-align: sub;"
            >
              <VTextField
                v-model="newEvaluationGroup.title"
                prepend-inner-icon="tabler-abc"
                :rules="[requiredValidator]"
              />
            </td>
            <td
              class="text-center py-2 d-flex align-center"
              style="height: auto !important; vertical-align: sub;"
            >
              <div>
                <VTextField
                  v-model="newEvaluationGroup.weight"
                  type="number"
                  prepend-inner-icon="tabler-123"
                  step="0.01"
                  :rules="[requiredValidator, betweenValidator(newEvaluationGroup.weight, 0.01, 1)]"
                />
              </div>
              <VBtn
                icon="tabler-trash"
                class="ml-2"
                size="x-large"
                variant="text"
                density="compact"
                color="error"
                :disabled="loadingUpdate"
                @click="deleteNewEvaluationGroup(index)"
              />
            </td>
          </tr>
        </TransitionGroup>
      </VTable>
      <div class="text-end mt-6 px-4">
        <VBtn
          prepend-icon="tabler-device-floppy"
          text="Guardar"
          class="ml-2 mb-1"
          rounded="sm"
          :disabled="weightTotal !== 1"
          :loading="loadingUpdate"
          @click="updateEvaluationGroup"
        />
        <TransitionGroup
          name="message-error"
          tag="div"
          class="text-body-2 text-error"
        >
          <span v-if="weightTotal !== 1">El porcentaje total debe ser 1. Actualmente: {{ weightTotal }}</span>
          <span v-else>&nbsp;</span>
        </TransitionGroup>
      </div>
    </VCard>
  </div>
</template>

<style>
.list-enter-active,
.list-leave-active {
  transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

.message-error-enter-active,
.message-error-leave-active {
  transition: all 0.5s ease;
}

.message-error-enter-from,
.message-error-leave-to {
  opacity: 0;
}

.evaluation-groups-table .v-table__wrapper {
  overflow-x: hidden;
}
</style>
