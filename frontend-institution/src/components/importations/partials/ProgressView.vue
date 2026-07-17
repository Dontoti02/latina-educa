<script setup lang="ts">
import CustomLoader from '@/common/components/ui-elements/CustomLoader.vue';
import { SessionStore } from '@/common/store';
import { ToastService } from '@/common/util/toast.service';
import type { CurrentImport, ImportResult, ImportationType } from '@/models/importations';
import { useAppAbility } from '@/plugins/casl/useAppAbility';
import { ImportationsService } from '@/services/importations.service';
import { changeRole } from '@/utils/system-configuration';

// Props
const props = defineProps<{
  importationType?: ImportationType
}>()

// Variables
const progressData = ref<CurrentImport>({
  id: -1,
  key: '',
  title: '',
  status: '',
  progress: 0,
  date: '',
  time_elapsed: 0,
  log: [],
  summary: {},
})

const finished = ref(false)
const loading = ref(false)

const result = ref<ImportResult>()

const transitions = ['primary', 'success', 'error', 'secondary', 'info']

const session = SessionStore()
const ability = useAppAbility()

// Methods
const concatLog = computed(() => {
  return progressData.value.log.join('\n')
})

const getResultProperties = computed(() => {
  return Object.entries(result.value?.summary)
})

const getResult = () => {
  loading.value = true

  ImportationsService.getImportResult(props.importationType!.id)
    .then(response => {
      result.value = response.data
      progressData.value.log = response.data.log

      if(response.data.status === 'completed' && props.importationType?.key === 'evaluations' && props.importationType?.last_date === null) {
        changeRole(session.user!.role.id, ability)
      }
    })
    .finally(() => {
      loading.value = false
    })
}

const repeatRequest = async () => {
  await new Promise(resolve => setTimeout(resolve, 5000));
  do {
    const request = await ImportationsService.getCurrentImport()

    if (!request.success)
      ToastService.error('Ocurrió un error al obtener la importación actual')

    if (!request.data) {
      finished.value = true
      progressData.value.progress = 100
      getResult()

      return
    }
    else { progressData.value = request.data }

    await new Promise(resolve => setTimeout(resolve, 5000))
  } while (!finished.value)
}

const getColors = (index: number) => {
  return transitions[index % transitions.length]
}

// On init
onMounted(() => {
  repeatRequest()
})

onUnmounted(() => {
  finished.value = true
})
</script>

<template>
  <VCard
    flat
    class="d-flex flex-md-row flex-column"
  >
    <VRow>
      <VCol
        md=""
        cols="12"
        class="align-center  px-md-10 px-2"
      >
        <VCard
          flat
          class="w-100 d-flex flex-column align-center "
        >
          <div
            class="d-flex align-center"
            style="height: 10rem;"
          >
            <template v-if="result">
              <VIcon
                v-if="result.status === 'completed'"
                color="primary"
                :size="150"
                icon="tabler-discount-check-filled"
              />
              <VIcon
                v-if="result.status === 'failed'"
                color="primary"
                :size="150"
                icon="tabler-circle-x-filled"
              />
            </template>
            <CustomLoader v-else />
          </div>
          <VCardText>
            {{ result ? result.status === 'completed' ? 'Importacion finalizada exitosamente' : 'La importación falló' : 'Importando el archivo, espere por favor' }}
          </VCardText>
          <template v-if="result">
            <VCardText>
              <VList class="card-list">
                <VListItem>
                  <template #prepend>
                    <VAvatar
                      size="34"
                      :color="getColors(0)"
                      variant="tonal"
                      rounded
                    >
                      <VIcon icon="tabler-chevron-right" />
                    </VAvatar>
                  </template>

                  <VListItemTitle class="font-weight-medium">
                    Importacion iniciada en
                  </VListItemTitle>
                  <VListItemSubtitle class="text-disabled">
                    {{ result.date }}
                  </VListItemSubtitle>
                </VListItem>
                <VListItem>
                  <template #prepend>
                    <VAvatar
                      size="34"
                      :color="getColors(1)"
                      variant="tonal"
                      rounded
                    >
                      <VIcon icon="tabler-chevron-right" />
                    </VAvatar>
                  </template>

                  <VListItemTitle class="font-weight-medium">
                    Tiempo de la importación
                  </VListItemTitle>
                  <VListItemSubtitle class="text-disabled">
                    {{ result.time_elapsed }} {{ result.time_elapsed === 1 ? 'minuto' : 'minutos' }}
                  </VListItemSubtitle>
                </VListItem>
                <VListItem
                  v-for="(transition, index) in getResultProperties"
                  :key="transition[0]"
                >
                  <template #prepend>
                    <VAvatar
                      size="34"
                      :color="getColors(index + 2)"
                      variant="tonal"
                      rounded
                    >
                      <VIcon icon="tabler-chevron-right" />
                    </VAvatar>
                  </template>

                  <VListItemTitle class="font-weight-medium">
                    {{ transition[0] }}
                  </VListItemTitle>
                  <VListItemSubtitle class="text-disabled">
                    {{ transition[1] }}
                  </VListItemSubtitle>
                </VListItem>
              </VList>
            </VCardText>
          </template>
          <template v-else>
            <VProgressLinear
              v-model="progressData.progress"
              color="primary"
              height="20"
            >
              <template #default="{ value }">
                <span>{{ Math.ceil(value) }}%</span>
              </template>
            </VProgressLinear>
            <VCardText>
              Tiempo transcurrido: {{ progressData.time_elapsed }} {{ progressData.time_elapsed === 1 ? 'minuto' : 'minutos' }}
              <div class="text-caption text-center">
                Esto puede tardar unos minutos
              </div>
            </VCardText>
          </template>
        </VCard>
      </VCol>
      <VDivider vertical />
      <VCol
        md=""
        cols="12"
        class="px-md-10 px-2"
      >
        <VCardText class="pr-0 pt-0 pb-2 pl-4">
          Consola de progreso
        </VCardText>
        <VTextarea
          v-model="concatLog"
          readonly
          no-resize
          class="console-text"
          rows="20"
        />
      </VCol>
    </VRow>
  </VCard>
</template>
