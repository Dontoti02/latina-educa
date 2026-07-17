<script setup lang="ts">
import ModalBasic from '@/common/components/Modal.vue'
import { onMounted, ref } from 'vue';
import { Institution } from '../../domain/Institution';
import { InstitutionModule } from '../../domain/institution-modules';
import Table from '@/common/components/Table.vue';
import institutionModulesService from '../../services/institution-modules.service';
import { toastError, toastSuccess } from '@/common/util/toast.service';
const props = defineProps<{
  show: boolean
  item?: Institution
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const loader = ref(false)
const list = ref<InstitutionModule[]>([])

const header = ref([
  {
    key: 'name',
    value: 'Nombre'
  },
  {
    key: 'isActive',
    value: 'Estado'
  },
  {
    key: 'startDate',
    value: 'Inicio Suscripción'
  },
  {
    key: 'endDate',
    value: 'Fin Suscripción'
  }
])

const fetchModules = async () => {
  if (!props.item) return
  try {
    loader.value = true
    const { data } = await institutionModulesService.list(props.item.id)
    list.value = data
  } catch (error) {
    toastError((error as any).message)
  } finally {
    loader.value = false
  }
}
const toggleActivation = async (item: InstitutionModule) => {
  if (!props.item) return
  try {
    loader.value = true
    const { success,message } = await institutionModulesService.toggleActivation({
      institutionId: props.item.id,
      moduleKey: item.moduleKey,
      isActive: !item.isActive
    })
    if (!success) {
      toastError(message)
      return
    }
    item.isActive = !item.isActive
    toastError(`El módulo ${item.name} ha sido ${item.isActive ? 'activado' : 'desactivado'}.`)
    fetchModules()
  } catch (error) {
    toastError((error as any).message)
  } finally {
    loader.value = false
  }
}

const updateDates = async (item: InstitutionModule) => {
  if (!props.item) return
  try {
    loader.value = true
    const { success, message } = await institutionModulesService.updateDates({
      institutionId: props.item.id,
      moduleKey: item.moduleKey,
      startDate: item.startDate,
      endDate: item.endDate
    })

    if (!success) {
      toastError(message)
      return
    }
    toastSuccess(message)
  } catch (error) {
    toastError((error as any).message)
  } finally {
    loader.value = false
  }
}


onMounted(() => {
  fetchModules()
})

</script>

<template>
  <ModalBasic :show="props.show" :size="2" :persistent="true" :width="900">
    <v-card style="position:relative">
      <v-toolbar dark color="primary" class="text-white">
        <v-toolbar-title>Lista de Modulos</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-btn icon dark @click="$emit('close')">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-toolbar>
      <v-card-text class="my-4 mx-4" v-if="item">
        <Table v-if="list" :table="{
          config: {
            sort: false,
            height: 500,
          },
          header: header,
          body: list
        }" :overlay="false">
          <template #isActive="{ item }">
            
            <v-tooltip location="top">
              <template #activator="{ props: tooltipProps }">
              <v-btn
                v-bind="tooltipProps"
                size="small"
                :color="item.isActive ? 'success' : 'error'"
                class="ml-2"
                variant="text"
                @click="toggleActivation(item as InstitutionModule)"
              >
                <v-chip size="small" :color="item.isActive ? 'success' : 'error'" variant="tonal" density="comfortable">
                  {{ item.isActive ? 'Activado' : 'Desactivado' }}
                </v-chip>
              </v-btn>
              </template>
              <span>{{ item.isActive ? 'Click para Desactivar' : 'Click para activar' }}</span>
            </v-tooltip>
          </template>
          <template #startDate="{ item }">
            <v-text-field
              v-model="item.startDate"
              type="date"
              density="compact"
              hide-details
              style="max-width: 180px;"
              variant="underlined"
              :disabled="!item.isActive"
              @change="() => updateDates(item as InstitutionModule)"
            />
          </template>
          <template #endDate="{ item }">
            <v-text-field
              v-model="item.endDate"
              type="date"
              density="compact"
              hide-details
              style="max-width: 180px;"
              variant="underlined"
              :disabled="!item.isActive"
              @change="() => updateDates(item as InstitutionModule)"
            />
          </template>
        </Table>
      </v-card-text>
      <v-card-actions>

      </v-card-actions>
    </v-card>
  </ModalBasic>
</template>