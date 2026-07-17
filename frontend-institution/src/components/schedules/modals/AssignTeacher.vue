<script setup lang="ts">
import { requiredValidator } from '@/@core/utils/validators'
import ModalBasic from '@/common/components/Modal.vue'
import { ToastService } from '@/common/util/toast.service'
import type { AssignTeacherForm, AssignationSelected, ClassroomForSchedule, ScheduleFormByClassroom, TeacherForSchedule } from '@/models/schedules'
import { ScheduleService } from '@/services/schedules.service'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'

// Initial
const props = withDefaults(
  defineProps<{
    formByClassroom: ScheduleFormByClassroom
    show: boolean
    assignationSelected: AssignationSelected | null
  }>(),
  {
    show: false,
  },
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit'): void
}>()

const loadingParams = ref<boolean>(false)
const loadingSubmit = ref<boolean>(false)

const teachers = ref<Array<TeacherForSchedule>>([])

const classrooms = ref<Array<ClassroomForSchedule>>([])
const classroomSelectedId = ref<number>()

// Initial form
const form = ref<AssignTeacherForm>({
  person_id: null,
  classroom_id: null,
})

// Get params
const getClassrooms = async () => {
  return ScheduleService.getClassroomsExistingForSchedule(props.formByClassroom).then(response => {
    if(!response.data || response.data.length === 0) {
      ToastService.error('No hay ningún curso con horario asignado.')
      emit('close')
    }
    classrooms.value = response.data
  }).catch(error => {
    ToastService.error(error)
  })
}

const getTeachers = async () => {
  return ScheduleService.getTeachersForSchedule({ period_id: props.formByClassroom.period_id }).then(response => {
    teachers.value = response.data
  }).catch(error => {
    ToastService.error(error)
  })
}

const getParams = () => {
  loadingParams.value = true
  Promise.all([getClassrooms(), getTeachers()]).finally(() => {
    loadingParams.value = false
  })
}

const getClassroomsParams = () => {
  loadingParams.value = true
  getClassrooms().finally(() => {
    loadingParams.value = false
  })
}

// Computed
const availableSections = computed(() => {
  if (classrooms.value.length === 0)
    return []

  const classroom = classrooms.value.find(c => c.id === classroomSelectedId.value)

  const sections = classroom ? classroom.sections : []

  if (sections.length > 0)
    form.value.classroom_id = sections[0].classroom_id

  return sections
})

const newAssign = computed(() => {
  const section = availableSections.value.find(s => s.classroom_id === form.value.classroom_id)

  return section?.teacher_id !== form.value.person_id
})

const formValid = computed(() => {
  return form.value.person_id !== null && form.value.classroom_id !== null
})

// Watch
watch(() => props.formByClassroom.period_id, getParams)
watch(() => props.formByClassroom.study_program_id, getClassroomsParams)
watch(() => props.formByClassroom.cycle_id, getClassroomsParams)
watch(() => form.value.classroom_id, () => {
  const section = availableSections.value.find(s => s.classroom_id === form.value.classroom_id)
  if (section)
    form.value.person_id = section.teacher_id
})
watch(() => props.assignationSelected, value => {
  if (value) {
    form.value.person_id = value.teacherId === -1 ? null : value.teacherId
    form.value.classroom_id = value.classroomId
    classroomSelectedId.value = value.courseId
  }
  else {
    form.value.person_id = null
    form.value.classroom_id = null
    classroomSelectedId.value = null
  }
})
watch(() => props.show, value => {
  if (value) {
    getParams()
  }
})

// Submit form
const assignTeacher = () => {
  loadingSubmit.value = true
  ScheduleService.assignTeacher(form.value).then(() => {
    ToastService.success('Horario asignado correctamente')

    const section = availableSections.value.find(s => s.classroom_id === form.value.classroom_id)
    if (section)
      section.teacher_id = form.value.person_id

    emit('submit')
    emit('close')
  }).catch(error => {
    ToastService.error(error)
  }).finally(() => {
    loadingSubmit.value = false
  })
}

const submit = () => {
  if (!formValid.value) {
    ToastService.error('Complete los campos requeridos')

    return
  }

  assignTeacher()
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
        <VToolbarTitle> Asignación de docente</VToolbarTitle>
        <VSpacer />
        <VBtn
          icon
          @click="emit('close')"
        >
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VToolbar>
      <VCardText class="px-4 pb-4">
        <VRow v-if="loadingParams">
          <VCol cols="12">
            <VSkeletonLoader type="list-item-three-line,list-item-three-line,list-item-three-line,list-item-three-line" />
          </VCol>
        </VRow>
        <VRow v-else>
          <VCol cols="12">
            <AppSelect
              v-model="classroomSelectedId"
              label="Curso"
              item-value="id"
              item-title="name"
              :disabled="loadingSubmit || assignationSelected !== null"
              name="select"
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
              :disabled="loadingSubmit || assignationSelected !== null"
              name="select"
              :items="availableSections"
              :rules="[requiredValidator]"
            />
          </VCol>
          <VCol cols="12">
            <AppAutocomplete
              v-model="form.person_id"
              label="Profesor"
              item-value="id"
              item-title="names"
              :messages="!formValid ? '' : newAssign ? 'Nueva asignación' : 'Asignación actual'"
              :disabled="loadingSubmit"
              :items="teachers"
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
            text="Asignar"
            :disabled="!newAssign || !formValid"
            :loading="loadingSubmit"
            variant="flat"
            @click="submit"
          />
        </div>
      </VCardActions>
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
