<template>
  <VRow
    class="auth-wrapper bg-surface"
    no-gutters
  >
    <VCol
      lg="8"
      class="d-none d-lg-flex"
    >
      <div class="position-relative bg-background rounded-lg w-100 ma-8 me-0">
        <div class="d-flex align-center justify-center w-100 h-100">
          <VImg
            max-width="250"
            :src="authV2ForgotPasswordIllustrationLight"
            class="auth-illustration mt-16 mb-2"
          />
        </div>

        <VImg
          class="auth-footer-mask"
          :src="authV2MaskLight"
        />
      </div>
    </VCol>

    <VCol
      cols="12"
      lg="4"
      class="d-flex align-center justify-center"
    >
      <VCard
        flat
        :max-width="500"
        class="mt-12 mt-sm-0 pa-4"
      >
        <VCardText>
          <VImg
            v-if="session.system_parameters?.logo !== null && session.system_parameters?.logo !== ''"
            :src="getUrlImage(session.system_parameters!.logo)"
            width="30"
            class="mb-6"
          />
          <h5 class="text-h5 mb-1">
            Actualización de contraseña 🔐
          </h5>
          <p class="mb-0">
            Ingresa tu correo electrónico y la contraseña a cambiar.
          </p>
          <p
            v-if="errorCheck"
            class="mb-0 text-warning text-body-2"
          >
            El token ha expirado. Por favor, solicita un nuevo token
            <a
              class="text-primary"
              href="/forgot-password"
            >aquí</a> .
          </p>
        </VCardText>

        <VCardText>
          <VForm
            ref="form"
            @submit.prevent="changePassword"
          >
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <v-text-field
                  variant="solo"
                  hide-details="auto"
                  v-model="formSubmit.email"
                  autofocus
                  label="Email"
                  type="email"
                  :disabled="loading"
                  :rules="[emailValidator]"
                />
              </VCol>

              <!-- new password -->
              <VCol cols="12">
                <v-text-field
                  variant="solo"
                  hide-details="auto"
                  v-model="formSubmit.password"
                  label="Nueva contraseña"
                  :disabled="loading"
                  :type="showPass1 ? 'text' : 'password'"
                  clearable
                  :rules="[requiredValidator, minLengthValidator(formSubmit.password, 8)]"
                  :append-icon="showPass1 ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append="showPass1 = !showPass1"
                />
              </VCol>

              <!-- confirm password -->
              <VCol cols="12">
                <v-text-field
                  variant="solo"
                  hide-details="auto"
                  v-model="passwordConfirm"
                  label="Confirmación de contraseña"
                  :disabled="loading"
                  :type="showPass2 ? 'text' : 'password'"
                  clearable
                  :error-messages="confirmPass ? '' : 'Las contraseñas no coinciden'"
                  :rules="[requiredValidator]"
                  :append-icon="showPass2 ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append="showPass2 = !showPass2"
                />
              </VCol>

              <!-- Reset link -->
              <VCol cols="12">
                <VBtn
                  block
                  type="submit"
                  style="text-transform: none;"
                  :loading="loading"
                  :disabled="!formAvailable"
                >
                  Cambiar contraseña
                </VBtn>
              </VCol>

              <!-- back to login -->
              <VCol cols="12">
                <a
                  class="d-flex align-center justify-center"
                  href="/login"
                  style="text-decoration: none;"
                >
                  <VIcon
                    icon="mdi-chevron-left"
                    class="flip-in-rtl"
                  />
                  <span>Regresar al login</span>
                </a>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>
<script setup lang="ts">
import { ToastService } from '@/common/util/toast.service'
import { emailValidator, minLengthValidator, requiredValidator } from '@/common/util/validators'
import authV2ForgotPasswordIllustrationLight from '@/assets/images/login/auth-v2-forgot-password-illustration-light.png'
import authV2MaskLight from '@/assets/images/login/misc-mask-light.png'
import { computed, onBeforeMount, ref } from 'vue';
import { useRoute } from 'vue-router';
import router from '@/common/router';
import { getUrlImage } from '@/common/util/global'
import { SessionStore } from '@/common/store';
import AuthRepository from '@/modules/auth/repository'
import { ChangePasswordFormDto } from '../dto';

// Initial
const route = useRoute()
const token = (route.query.token || '') as string
const session = SessionStore()

const form = ref()
const loading = ref(false)
const formAvailable = ref(false)
const showPass1 = ref<boolean>(false)
const showPass2 = ref<boolean>(false)
const passwordConfirm = ref<string>('')
const errorCheck = ref<boolean>(false)

const formSubmit = ref<ChangePasswordFormDto>({
  email: '',
  password: '',
  token,
})
// Actions
const changePassword = async () => {
  const { valid } = await form.value.validate()
  if (!valid)
    return
  if (!formAvailable.value)
    return

  loading.value = true
  AuthRepository.changePassword(formSubmit.value)
    .then(() => {
      ToastService.success('Contraseña actualizada correctamente')
      setTimeout(() => {
        router.push({ name: 'Login', query: { email: formSubmit.value.email } })
      }, 1000)
    }).finally(() => {
      loading.value = false
    })
}

const checkToken = () => {
  if (!token)
    router.push({ name: 'Login' })

    AuthRepository.verifyResetToken(token)
    .then(() => {
      formAvailable.value = true
      errorCheck.value = false
    })
    .catch(() => {
      errorCheck.value = true
      ToastService.error('Token inválido')
    })
}

const confirmPass = computed(() => {
  return formSubmit.value.password === passwordConfirm.value
})

onBeforeMount(() => {
  checkToken()
})
</script>
<style lang="scss">
.auth-wrapper {
  min-block-size: calc(var(--vh, 1vh) * 100);
}
.auth-v1-top-shape,
.auth-v1-bottom-shape {
  position: absolute;
  block-size: 233px;
  inline-size: 238px;
}
.auth-footer-mask {
  position: absolute;
  inset-block-end: 0;
  min-inline-size: 100%;
}
.auth-card {
  z-index: 1 !important;
}
.auth-illustration {
  z-index: 1;
}
.auth-v1-top-shape {
  inset-block-start: -77px;
  inset-inline-start: -40px;
}
.auth-v1-bottom-shape {
  inset-block-end: -55px;
  inset-inline-end: -55px;
}

@media (min-width: 960px) {
  .skin--bordered .auth-card-v2 {
    border-inline-start: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
  }
}/*# sourceMappingURL=page-auth.css.map */
</style>
