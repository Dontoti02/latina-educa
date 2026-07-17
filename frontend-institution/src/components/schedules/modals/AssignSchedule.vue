<script setup lang="ts">
import { requiredValidator } from '@/@core/utils/validators'
import ModalBasic from '@/common/components/Modal.vue'
import modalService from '@/common/util/modal.service'
import { ToastService } from '@/common/util/toast.service'
import type { ClassroomForSchedule, Schedule, ScheduleCreate, ScheduleFilters, ScheduleFormByClassroom } from '@/models/schedules'
import { ScheduleService } from '@/services/schedules.service'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'

// Initial
const props = withDefaults(
  defineProps<{
    formByClassroom: ScheduleFormByClassroom
    schedule: Schedule
    show: boolean
    daysAvailable: ScheduleFilters['days']
  }>(),
  {
    show: false,
  },
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'updateCalendar'): void
}>()

const formRef = ref<HTMLFormElement | null>(null)

const loadingParams = ref<boolean>(false)
const loadingContent = ref<boolean>(false)
const loadingSubmit = ref<boolean>(false)
const loadingDelete = ref<boolean>(false)
const classrooms = ref<Array<ClassroomForSchedule>>([])
const classroomSelectedId = ref<number>()

// Initial form
const clearForm = (): ScheduleCreate => {
  return {
    classroom_id: undefined,
    day: props.schedule.days[0].day,
    hour_start: props.schedule.days[0].hour_start,
    hour_end: props.schedule.days[0].hour_end,
  }
}

const form = ref<ScheduleCreate>(clearForm())

const setup = () => {
  if (props.schedule.id) {
    classroomSelectedId.value = classrooms.value.find(c => c.sections.some(s => s.classroom_id === props.schedule.id))?.id
    form.value = {
      classroom_id: props.schedule.id,
      day: props.schedule.days[0].day,
      hour_start: props.schedule.days[0].hour_start,
      hour_end: props.schedule.days[0].hour_end,
    }
  }
  else {
    form.value = clearForm()
  }
}

// Get params
const getParams = async () => {
  loadingParams.value = true
  ScheduleService.getClassroomsForSchedule(props.formByClassroom).then(response => {
    if(!response.data || response.data.length === 0) {
      ToastService.error('No existen cursos.')
      emit('close')
    }
    classrooms.value = response.data
    setup()
  }).catch(error => {
    ToastService.error(error)
  }).finally(() => {
    loadingParams.value = false
  })
}

// Watch
watch(() => props.show, () => {
  if (props.show && !loadingParams.value) {
    getParams()
    setup()
  }
  else clearForm()
})
watch(() => props.formByClassroom.period_id, getParams)
watch(() => props.formByClassroom.study_program_id, getParams)
watch(() => props.formByClassroom.cycle_id, getParams)

// Computed
const availableSections = computed(() => {
  if (classrooms.value.length === 0)
    return []

  const classroom = classrooms.value.find(c => c.id === classroomSelectedId.value)

  const sections = classroom ? classroom.sections : []

  if (sections.length > 0 && !props.schedule.id)
    form.value.classroom_id = sections[0].classroom_id
  return sections
})

const availableHoursFromSection = computed(() => {
  const section = availableSections.value.find(s => s.classroom_id === form.value.classroom_id)
  if (section)
    return ` - Turno:  ${section.shift} de ${section.hour_start} - ${section.hour_end}`

  return ''
})

const days = computed(() => {
  return Object.entries(props.daysAvailable).map(([value, name]) => ({ name, value: Number(value) }))
})

// Submit form
const createSchedule = () => {
  loadingSubmit.value = true
  ScheduleService.createSchedule(form.value).then(() => {
    ToastService.success('Horario asignado correctamente')
    emit('updateCalendar')
    emit('close')
  }).catch(error => {
    ToastService.error(error)
  }).finally(() => {
    loadingSubmit.value = false
  })
}

const updateSchedule = () => {
  loadingSubmit.value = true
  ScheduleService.updateSchedule(props.schedule.days[0].id, form.value).then(() => {
    ToastService.success('Horario actualizado')
    emit('updateCalendar')
    emit('close')
  }).catch(error => {
    ToastService.error(error)
  }).finally(() => {
    loadingSubmit.value = false
  })
}

const validForm = async () => {
  // if (!form.value.classroom_id || !form.value.day || !form.value.hour_start || !form.value.hour_end) {
  //   ToastService.error('Complete todos los campos')

  //   return false
  // }

  const section = availableSections.value.find(s => s.classroom_id === form.value.classroom_id)

  // if (new Date(`1970-01-01T${form.value.hour_start}:00`) < new Date(`1970-01-01T${section?.hour_start}:00`)
  //   || new Date(`1970-01-01T${form.value.hour_end}:00`) > new Date(`1970-01-01T${section?.hour_end}:00`)) {
  //   ToastService.error('El horario no es válido para la sección seleccionada')

  //   return false
  // }

  const { valid } = await formRef.value!.validate()

  return valid
}

const submit = async () => {
  const valid = await validForm()
  if (!valid)
    return

  if (props.schedule.id)
    updateSchedule()
  else createSchedule()
}

// Actions
const deleteSchedule = async () => {
  const confirm = await modalService.confirmation({
    title: 'Eliminar horario',
    content: '¿Está seguro de eliminar este horario?',
  })

  if (!confirm)
    return

  loadingDelete.value = true
  ScheduleService.deleteSchedule(props.schedule.days[0].id).then(() => {
    ToastService.success('Horario eliminado')
    emit('updateCalendar')
    emit('close')
  }).catch(error => {
    ToastService.error(error)
  }).finally(() => {
    loadingDelete.value = false
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
        <VToolbarTitle> {{ schedule.id ? 'Edición' : 'Creación' }} de horario</VToolbarTitle>
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
        class="w-100"
        @submit.prevent="submit"
      >
        <VCardText class="px-4 pb-4 custom-form">
          <VRow v-if="loadingParams || loadingContent">
            <VCol cols="12">
              <VSkeletonLoader type="list-item-three-line,list-item-three-line,list-item-three-line,list-item-three-line" />
            </VCol>
          </VRow>
          <VRow v-else>
            <VCol cols="12">
              Días
              <VRadioGroup
                v-model="form.day"
                class="days-radio-group"
                inline
                :rules="[requiredValidator]"
              >
                <VRadio
                  v-for="(day, index) in days"
                  :key="index"
                  :label="day.name"
                  :value="day.value"
                />
              </VRadioGroup>
            </VCol>
            <VRow style="margin: 0;">
              <VCol
                cols="12"
                class="pb-0"
              >
                Horario {{ availableHoursFromSection }}
              </VCol>
              <VCol
                cols="6"
                style="position: relative;"
              >
                <AppTimePicker
                  v-model="form.hour_start"
                  label="Hora de inicio"
                  prepend-inner-icon="tabler-clock"
                  :config="{
                    inline : true,
                    enableTime: true,
                    noCalendar: true,
                    dateFormat: 'H:i',
                    minuteIncrement: 5,
                  }"
                  :rules="[requiredValidator]"
                /> 
                
                <div
                  v-if="loadingSubmit || loadingDelete"
                  style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #ffff; opacity: 0.5;"
                />
              </VCol>
              <VCol
                cols="6"
                style="position: relative;"
              >
                <AppTimePicker
                  v-model="form.hour_end"
                  label="Hora de fin"
                  prepend-inner-icon="tabler-clock"
                  :config="{
                    inline : true,
                    enableTime: true,
                    noCalendar: true,
                    dateFormat: 'H:i',
                    minuteIncrement: 5,
                  }"
                  :rules="[requiredValidator]"
                /> 
                <div
                  v-if="loadingSubmit || loadingDelete"
                  style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: #ffff; opacity: 0.5;"
                />
              </VCol>
            </VRow>
            <VCol cols="12">
              <AppSelect
                v-model="classroomSelectedId"
                label="Curso"
                item-value="id"
                item-title="name"
                :disabled="loadingSubmit || loadingDelete || schedule.id !== undefined"
                :items="classrooms"
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol cols="12">
              <AppSelect
                v-model="form.classroom_id"
                label="Sección"
                item-value="classroom_id"
                item-title="name"
                :disabled="loadingSubmit || loadingDelete || schedule.id !== undefined"
                :items="availableSections"
                :rules="[requiredValidator]"
              />
            </VCol>
          </VRow>
        </VCardText>
        <VCardActions v-if="!loadingParams && !loadingContent">
          <div class="d-flex gap-4 justify-end w-100">
            <VBtn
              v-if="schedule.id"
              class="px-4"
              color="error"
              variant="outlined"
              :disabled="loadingSubmit"
              :loading="loadingDelete"
              @click="deleteSchedule"
            >
              Eliminar
            </VBtn>
            <VBtn
              class="px-4"
              color="primary"
              variant="outlined"
              :disabled="loadingSubmit || loadingDelete"
              @click="emit('close')"
            >
              Cancelar
            </VBtn>
            <VBtn
              class="px-4"
              color="primary"
              text="Asignar"
              :disabled="loadingDelete"
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

<style lang="scss">
.days-radio-group {
  .v-input__control .v-selection-control-group--inline {
    justify-content: space-between !important;
  }
}
</style>

<style scoped>
  .custom-form {
    max-block-size: 70vh;
    overflow-y: auto;
  }

  /* Customize the scrollbar */
  .custom-form::-webkit-scrollbar {
    inline-size: 4px;
  }

  .custom-form::-webkit-scrollbar-track {
    background-color: #f1f1f1;
  }

  .custom-form::-webkit-scrollbar-thumb {
    border-radius: 4px;
    background-color: #afafaf;
  }

  .custom-form::-webkit-scrollbar-thumb:hover {
    background-color: #8f8f8f;
  }
  </style>
