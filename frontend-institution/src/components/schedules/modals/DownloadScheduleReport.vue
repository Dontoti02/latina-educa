<script setup lang="ts">
import { requiredValidator } from '@/@core/utils/validators'
import ModalBasic from '@/common/components/Modal.vue'
import { ToastService } from '@/common/util/toast.service'
import type { ScheduleFiltersForReport, ScheduleFormByClassroom, ScheduleFormByReportSecretary } from '@/models/schedules'
import { ScheduleService } from '@/services/schedules.service'
import { downloadFile } from '@/utils/file-utils'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'

// Initial
const props = withDefaults(
  defineProps<{
    show: boolean
    formFilters: ScheduleFormByClassroom
  }>(),
  {
    show: false,
  },
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit'): void
}>()

const formRef = ref<HTMLFormElement | null>(null)
const loadingParams = ref<boolean>(false)
const loadingSubmit = ref<boolean>(false)

const options = ref<Array<ScheduleFiltersForReport>>([])

// Initial form
const form = ref<ScheduleFormByReportSecretary>({
  person_id: null,
  period_id: props.formFilters.period_id,
  rol_id: null,
})

// Get params
const getParams = () => {
  loadingParams.value = true
  ScheduleService.getFiltersForReport(props.formFilters).then(response => {
    options.value = response.data
  }).catch(error => {
    ToastService.error(error)
  }).finally(() => {
    loadingParams.value = false
  })
}

// Computed
const persons = computed(() => {
  return options.value.find(option => option.id === form.value.rol_id)?.persons
})

const roleSelected = computed(() => {
  return options.value.find(option => option.id === form.value.rol_id)
})

// Watch
watch(() => props.show, value => {
  if (value)
    getParams()
})

watch(() => form.value.rol_id, () => {
  form.value.person_id = null
})

// Submit form
const submit = async () => {
  const { valid } = await formRef.value?.validate()

  if (!valid)
    return

  loadingSubmit.value = true
  ScheduleService.downloadScheduleForSecretary('pdf', form.value).then(response => {
    downloadFile(response)
  }).catch(error => {
    ToastService.error(error)
  }).finally(() => {
    loadingSubmit.value = false
  })
}
</script>

<template>
  <ModalBasic
    :visible="props.show"
    is-persistent
    width="1000"
    is-scrollable
  >
    <VCard>
      <VToolbar>
        <VToolbarTitle>Reporte de horario</VToolbarTitle>
        <VSpacer />
        <VBtn
          icon
          @click="emit('close')"
        >
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VToolbar>
      <VForm
        ref="formRef"
        @submit.prevent="submit"
      >
        <VCardText class="px-4 pb-4">
          <VRow v-if="loadingParams">
            <VCol cols="12">
              <VSkeletonLoader type="list-item-three-line,list-item-three-line,list-item-three-line,list-item-three-line" />
            </VCol>
          </VRow>
          <VRow v-else>
            <VCol cols="12">
              <AppSelect
                v-model="form.rol_id"
                label="Sección"
                item-value="id"
                item-title="name"
                :disabled="loadingSubmit"
                name="select"
                :items="options"
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol cols="12">
              <AppAutocomplete
                v-model="form.person_id"
                :label="roleSelected?.name || 'Persona'"
                item-value="id"
                item-title="names"
                :disabled="loadingSubmit"
                :items="persons"
                :rules="[requiredValidator]"
              />
            </VCol>
          </VRow>
        </VCardText>
        <VCardActions v-if="!loadingParams">
          <div class="d-flex gap-4 justify-end w-100">
            <VBtn
              class="px-4"
              color="primary"
              variant="outlined"
              :disabled="loadingSubmit"
              @click="emit('close')"
            >
              Cancelar
            </VBtn>
            <VBtn
              class="px-4"
              color="primary"
              text="Descargar"
              :loading="loadingSubmit"
              variant="flat"
              type="submit"
            />
          </div>
        </VCardActions>
      </VForm>
    </VCard>
  </ModalBasic>
</template>
