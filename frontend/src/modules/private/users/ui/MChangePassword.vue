<template>
  <ModalBasic
    :show="props.show"
    is-persistent
    :width="1000"
    is-scrollable
  >
    <VCard>
      <VToolbar dark color="var(--bg-toolbar)" class="text-white">
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
            <v-text-field
              v-model="form.password"
              label="Nueva contraseña"
              variant="solo"
              :disabled="loadingChange || loadingReset"
              hide-details="auto"
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
            <v-text-field
              v-model="passwordCopy"
              label="Repita la contraseña"
              :disabled="loadingChange || loadingReset"
              hide-details="auto"
              variant="solo"
              :error-messages="!formValid ? ['Las contraseñas no coinciden'] : []"
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
            variant="outlined"
            :disabled="loadingChange || loadingReset"
            text="Cancelar"
            @click="emit('close')"
          />
          <VBtn
            class="px-4"
            color="primary"
            text="Actualizar"
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
<script setup lang="ts">
import { minLengthValidator, requiredValidator } from '@/common/util/validators'
import ModalBasic from '@/common/components/Modal.vue'
import { computed, ref, watch } from 'vue';
import UserService from '../services/user.service'
import { PasswordUserFormDto } from '../dto/user.dto';

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

const form = ref<PasswordUserFormDto>({
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
const formValid = computed(() => {
  return form.value.password !== '' && form.value.password === passwordCopy.value && form.value.password.length >= 8
})

// Actions
const changePassword = () => {
  loadingChange.value = true
  UserService.updatePassword(props.user.id, form.value)
    .then(() => {
      emit('close')
    }).finally(() => {
      loadingChange.value = false
    })
}
</script>