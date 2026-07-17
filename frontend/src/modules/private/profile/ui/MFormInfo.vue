<template>
    <ModalBasic
      :show="show"
      title="Cambio de contraseña"
      :size="2"
      :persistent="true"
      :width="1000"
    >
      <v-card style="position:relative">
        <v-toolbar dark color="var(--bg-toolbar)" class="text-white">
          <v-toolbar-title>{{ titleModal }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon dark @click="$emit('close')">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-form ref="formPassword" @submit.prevent="submit" fast-fail>
          <v-card-text class="my-4 mx-4">
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="password"
                  label="Nueva contraseña"
                  :type="showPass1 ? 'text' : 'password'"
                  variant="solo"
                  clearable
                  :rules="[requiredValidator, minLengthValidator(password, 8)]"
                  :append-icon="showPass1 ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append="showPass1 = !showPass1"
                ></v-text-field>
              </v-col>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="passwordCopy"  
                  label="Confirmación de contraseña"
                  :type="showPass2 ? 'text' : 'password'"
                  :error-messages="passwordConfirmed ? [] : ['Las contraseñas no coinciden']"
                  variant="solo"
                  clearable
                  :rules="[requiredValidator]"
                  :append-icon="showPass2 ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append="showPass2 = !showPass2"
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <div class="d-flex justify-end w-100">
              <v-btn
                @click="emit('close')"
                variant="outlined"
              >
                Cancelar
              </v-btn>

              <v-btn
                text="Actualizar contraseña"
                type="submit"
                color="var(--login-blue-color)"
                variant="tonal"
                :loading="loadingSubmit"
              />
            </div>
          </v-card-actions>
        </v-form>
      </v-card>
    </ModalBasic>
</template>

<script setup lang="ts">
import ModalBasic from '@/common/components/Modal.vue'
import ProfileService from '@/modules/private/profile/services/profile.service'
import { computed, ref, watch } from 'vue';
import { requiredValidator, minLengthValidator } from '@/common/util/validators';

// Initial
const formPassword = ref()

const loadingSubmit = ref<boolean>(false)
const password = ref<string>('')
const passwordCopy = ref<string>('')
const showPass1 = ref<boolean>(false)
const showPass2 = ref<boolean>(false)

// Props
const props = defineProps<{
  show: boolean
  titleModal: string
}>()

// Emits
const emit = defineEmits<{
  (event: 'close'): void
}>()

// Actions
const submit = async () => {
  const { valid } = await formPassword.value.validate()

  if(!valid || !passwordConfirmed.value) { return }

  loadingSubmit.value = true
  ProfileService.changePassword(password.value).then(() => {
    emit('close')
  }).finally(() => {
    loadingSubmit.value = false
  })
}

// Computed
const passwordConfirmed = computed(() => password.value === passwordCopy.value)

// Watchers
watch(() => props.show, (value) => {
  if(!value) {
    password.value = ''
    passwordCopy.value = ''
  }
})
</script>