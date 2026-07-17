<script setup lang="ts">
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'
import { emailValidator, requiredValidator } from '@/@core/utils/validators'
import ModalBasic from '@/common/components/Modal.vue'
import { ToastService } from '@/common/util/toast.service'
import type { Role } from '@/models/login'
import type { FormCreateUser } from '@/models/users'
import { UsersService } from '@/services/users.service'
import { ExistingStudentData } from '@/models/enrollment'

// Initial
const props = withDefaults(
  defineProps<{
    show: boolean,
    existingStudent: ExistingStudentData
  }>(),
  {
    show: false,
  },
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'goToEnrollment'): void
}>()

const loadingParams = ref<boolean>(false)
const loadingSubmit = ref<boolean>(false)
const form = ref()
const formSubmit = ref<ExistingStudentData>()

// Methods
const setup = () => {
  formSubmit.value= props.existingStudent
}

const clearForm = () => {
  formSubmit.value = undefined
}

watch(() => props.show, () => {
  if (props.show)
    setup()
  else clearForm()
})

// Actions
const submit = async () => {
   emit('goToEnrollment')
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
        <VToolbarTitle>El estudiante ya esta registrado</VToolbarTitle>
        <VSpacer />
        <VBtn
          icon
          @click="emit('close')"
        >
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VToolbar>
      <VForm
        ref="form"
        @submit.prevent="submit"
      >
        <VCardText class="px-4 pb-4">
          <VSkeletonLoader
            v-if="loadingParams"
            type="list-item,list-item-three-line,list-item-three-line,list-item-three-line,list-item-three-line"
          />
          <VRow v-else>
            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="props.existingStudent.document_number"
                label="Documento de identidad"
                readonly
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="props.existingStudent.names"
                label="Nombre Completo"
                readonly
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="props.existingStudent.phone"
                label="Teléfono"
                readonly
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="props.existingStudent.email"
                label="Correo Electronico"
                readonly
              />
            </VCol>
            <VCol
              cols="12"
              md="12"
            >
              ¿Desea ir directamente al registro de matricula para este estudiante?
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
              text="Cancelar"
              @click="emit('close')"
            />
            <VBtn
              class="px-4"
              color="primary"
              text="Ir a Matricula"
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
