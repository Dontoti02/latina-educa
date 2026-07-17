<script setup lang="ts">
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'
import { emailValidator, requiredValidator } from '@/@core/utils/validators'
import ModalBasic from '@/common/components/Modal.vue'
import { ToastService } from '@/common/util/toast.service'
import type { Role } from '@/models/login'
import type { FormCreateUser } from '@/models/users'
import { UsersService } from '@/services/users.service'

// Initial
const props = withDefaults(
  defineProps<{
    show: boolean
  }>(),
  {
    show: false,
  },
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'userCreated'): void
}>()

const loadingParams = ref<boolean>(false)
const loadingSubmit = ref<boolean>(false)
const form = ref()
const roles = ref<Role[]>([])
const documentTypes = ref<string[]>([])

const formSubmit = ref<FormCreateUser>({
  document_number: '',
  phone: '',
  email: '',
  names: '',
  document_type: '',
  rol_ids: [],
})

// Methods
const setup = () => {
  if (roles.value.length === 0 || documentTypes.value.length === 0) {
    loadingParams.value = true
    UsersService.getParamsForCreation()
      .then(response => {
        roles.value = response.data.roles
        documentTypes.value = response.data.documents

        if (roles.value.length > 0)
          formSubmit.value.rol_ids = [roles.value[0].id]

        if (documentTypes.value.length > 0)
          formSubmit.value.document_type = documentTypes.value[0]
      })
      .catch(error => {
        ToastService.error(error)
      }).finally(() => {
        loadingParams.value = false
      })
  }
}

const clearForm = () => {
  formSubmit.value = {
    phone: '',
    email: '',
    document_number: '',
    names: '',
    document_type: documentTypes.value.length > 0 ? documentTypes.value[0] : '',
    rol_ids: roles.value.length > 0 ? [roles.value[0].id] : [],
  }
}

watch(() => props.show, () => {
  if (props.show)
    setup()
  else clearForm()
})

// Actions
const submit = async () => {
  const { valid } = await form.value.validate()

  if (!valid)
    return

  loadingSubmit.value = true
  UsersService.createUser(formSubmit.value)
    .then(() => {
      ToastService.success('Usuario actualizado exitosamente')
      emit('userCreated')
      emit('close')
    })
    .catch(error => {
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
        <VToolbarTitle>Creación de usuario</VToolbarTitle>
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
                v-model="formSubmit.names"
                label="Nombres"
                clearable
                :disabled="loadingSubmit"
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="formSubmit.email"
                label="Email"
                clearable
                :disabled="loadingSubmit"
                :rules="[requiredValidator, emailValidator]"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="formSubmit.phone"
                label="Teléfono"
                clearable
                :disabled="loadingSubmit"
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
              class="d-flex flex-column justify-end"
            >
              <div class="app-text-field flex-grow-1">
                <VLabel class="mb-1 text-body-2 text-high-emphasis">
                  Rol
                </VLabel>
                <VSelect
                  v-model="formSubmit.rol_ids"
                  item-value="id"
                  item-title="name"
                  multiple
                  :items="roles"
                  :disabled="loadingSubmit"
                  :rules="[requiredValidator]"
                />
              </div>
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <AppSelect
                v-model="formSubmit.document_type"
                label="Tipo de documento"
                :items="documentTypes"
                :disabled="loadingSubmit"
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="formSubmit.document_number"
                label="Documento de identidad"
                clearable
                :disabled="loadingSubmit"
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
              text="Cancelar"
              @click="emit('close')"
            />
            <VBtn
              class="px-4"
              color="primary"
              text="Agregar"
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
