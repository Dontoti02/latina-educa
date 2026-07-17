<script setup lang="ts">
import { emailValidator, requiredValidator } from '@/@core/utils/validators'
import ModalBasic from '@/common/components/Modal.vue'
import { ToastService } from '@/common/util/toast.service'
import type { UserRole } from '@/models/role'
import type { FormUpdateUser, FormUpdateUserAdmin, UserSubset } from '@/models/users'
import { UsersService } from '@/services/users.service'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'

// Initial
const props = withDefaults(
  defineProps<{
    user: UserSubset
    roles: Array<UserRole>
    show: boolean
  }>(),
  {
    show: false,
  },
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'updateUser', data: { id: number; phone: string; email: string, names: string, document_type: string, document_number: string }): void
}>()

const documentTypes = ref<string[]>([])
const loadingParams = ref<boolean>(false)
const loadingSubmit = ref<boolean>(false)
const form = ref()

const formSubmit = ref<FormUpdateUserAdmin>({
  names: props.user.names,
  phone: props.user.phone,
  email: props.user.email,
  document_number: props.user.document_number,
  document_type: props.user.document_type,
})

// Methods
const getParams = () => {
  loadingParams.value = true
    UsersService.getParamsForCreation()
      .then(response => {
        documentTypes.value = response.data.documents
      })
      .catch(error => {
        ToastService.error(error)
      }).finally(() => {
        loadingParams.value = false
      })
}

const setup = () => {
  formSubmit.value = {
    names: props.user.names,
    phone: props.user.phone,
    email: props.user.email,
    document_number: props.user.document_number,
    document_type: props.user.document_type,
  }
}

const clearForm = () => {
  formSubmit.value = {
    names: '',
    phone: '',
    email: '',
    document_number: '',
    document_type: null,
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

  let formUpdate: FormUpdateUser | FormUpdateUserAdmin = {
      phone: formSubmit.value.phone,
      email: formSubmit.value.email,
    } 
  if(props.user.rol_id === 4) {
    formUpdate = {
      names: formSubmit.value.names,
      phone: formSubmit.value.phone,
      email: formSubmit.value.email,
      document_number: formSubmit.value.document_number,
      document_type: formSubmit.value.document_type,
    }
  }


  UsersService.updateUser(props.user.id, formUpdate)
    .then(() => {
      ToastService.success('Usuario actualizado exitosamente')
      emit('updateUser', {
        id: props.user.id,
        names: formSubmit.value.names,
        phone: formSubmit.value.phone,
        email: formSubmit.value.email,
        document_number: formSubmit.value.document_number,
        document_type: formSubmit.value.document_type,
      })
      emit('close')
    })
    .catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loadingSubmit.value = false
    })
}

// Mounted
onBeforeMount(() => {
  if(props.user.rol_id === 4)
    getParams()
})
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
        <VToolbarTitle>Edición de usuario</VToolbarTitle>
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
              v-if="user.rol_id === 4"
              cols="12"
            >
              <AppTextField
                v-model="formSubmit.names"
                label="Nombres"
                clearable
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
                :rules="[requiredValidator]"
              />
            </VCol>
            <template
              v-if="user.rol_id === 4"
            >
              <VCol
                cols="12"
                md="6"
              >
                <AppSelect
                  v-model="formSubmit.document_type"
                  label="Tipo de documento"
                  item-value="id"
                  item-title="name"
                  clearable
                  :items="documentTypes"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <AppTextField
                  v-model="formSubmit.document_number"
                  label="Número de documento"
                  clearable
                  :rules="[requiredValidator]"
                />
              </VCol>
            </template>
            <VCol cols="12">
              <AppSelect
                v-model="user.rol_id"
                label="Rol"
                item-value="id"
                item-title="name"
                disabled
                :items="roles"
              />
            </VCol>
          </VRow>
        </VCardText>
        <VCardActions>
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
              text="Actualizar"
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
