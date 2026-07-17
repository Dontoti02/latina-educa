<script setup lang="ts">
import { minLengthValidator, requiredValidator } from '@/@core/utils/validators'
import ModalBasic from '@/common/components/Modal.vue'
import { ToastService } from '@/common/util/toast.service'
import type { FormPasswordUser } from '@/models/users'
import { UsersService } from '@/services/users.service'

// Initial
const props = withDefaults(
  defineProps<{
    user: {
      id: number
      names: string
    }
    show: boolean
  }>(),
  {
    show: false,
  },
)

const emit = defineEmits<{
  (e: 'close'): void
}>()

const loadingChange = ref<boolean>(false)
const loadingReset = ref<boolean>(false)
const passwordCopy = ref<string>('')
const showPass1 = ref<boolean>(false)
const showPass2 = ref<boolean>(false)

const form = ref<FormPasswordUser>({
  password: '',
})

// Methods
const clearForm = () => {
  form.value = {
    password: '',
  }

  passwordCopy.value = ''
}

watch(() => props.show, () => {
  if (!props.show)
    clearForm()
})

// Computed
const initialForm = computed(() => {
  return form.value.password === '' && passwordCopy.value === ''
})

const formValid = computed(() => {
  const equalsPassword = form.value.password === passwordCopy.value
  const lengthValid = form.value.password.length >= 8 && passwordCopy.value.length >= 8

  return   (equalsPassword && lengthValid)
})

// Actions
const changePassword = () => {
  loadingChange.value = true
  UsersService.updatePassword(props.user.id, form.value)
    .then(() => {
      ToastService.success('Contraseña actualizada exitosamente')
      emit('close')
    })
    .catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loadingChange.value = false
    })
}

const resetPassword = () => {
  loadingReset.value = true
  UsersService.resetPassword(props.user.id)
    .then(() => {
      ToastService.success('Contraseña restablecida exitosamente')
      emit('close')
    })
    .catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loadingReset.value = false
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
        <VToolbarTitle>{{ user.names }}</VToolbarTitle>
        <VSpacer />
        <VBtn
          icon
          @click="emit('close')"
        >
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VToolbar>
      <VCardText class="px-4 pb-4">
        <VRow>
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="form.password"
              label="Nueva contraseña"
              :disabled="loadingChange || loadingReset"
              :type="showPass1 ? 'text' : 'password'"
              clearable
              :rules="[requiredValidator, minLengthValidator(form.password, 8)]"
              :append-icon="showPass1 ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="showPass1 = !showPass1"
            />
          </VCol>
          <VCol
            cols="12"
            md="6"
          >
            <AppTextField
              v-model="passwordCopy"
              label="Repita la contraseña"
              :disabled="loadingChange || loadingReset"
              :error-messages="(!formValid && !initialForm) ? ['Las contraseñas no coinciden'] : []"
              clearable
              :rules="[requiredValidator, minLengthValidator(passwordCopy, 8)]"
              :type="showPass2 ? 'text' : 'password'"
              :append-icon="showPass2 ? 'mdi-eye' : 'mdi-eye-off'"
              @click:append="showPass2 = !showPass2"
            />
          </VCol>
        </VRow>
      </VCardText>
      <VCardActions>
        <div class="d-flex gap-4 justify-end w-100">
          <VBtn
            class="px-4"
            color="primary"
            variant="text"
            :disabled="loadingChange"
            :loading="loadingReset"
            text="Limpiar"
            @click="resetPassword"
          />
          <VBtn
            class="px-4"
            color="primary"
            variant="outlined"
            :disabled="loadingChange || loadingReset"
            text="Cancelar"
            @click="emit('close')"
          />
          <VBtn
            class="px-4"
            color="primary"
            text="Actualizar contraseña"
            :loading="loadingChange"
            :disabled="!formValid || loadingChange || loadingReset"
            variant="flat"
            @click="changePassword"
          />
        </div>
      </VCardActions>
    </VCard>
  </ModalBasic>
</template>
