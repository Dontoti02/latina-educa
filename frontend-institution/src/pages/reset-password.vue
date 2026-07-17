<script setup lang="ts">
import { ToastService } from '@/common/util/toast.service'
import type { ChangePasswordForm } from '@/models/login'
import router from '@/router'
import { LoginService } from '@/services/login.service'
import { useGenerateImageVariant } from '@core/composable/useGenerateImageVariant'
import { confirmedValidator, emailValidator, minLengthValidator, requiredValidator } from '@core/utils/validators'
import registerMultistepIlustrationDark from '@images/illustrations/register-multistep-illustration-dark.png'
import registerMultistepIlustrationLight from '@images/illustrations/register-multistep-illustration-light.png'
import authV2MaskDark from '@images/pages/misc-mask-dark.png'
import authV2MaskLight from '@images/pages/misc-mask-light.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

// Initial
const route = useRoute()
const token = route.query.token ?? ''

const form = ref()
const loading = ref(false)
const formAvailable = ref(false)
const showPass1 = ref<boolean>(false)
const showPass2 = ref<boolean>(false)
const passwordConfirm = ref<string>('')
const errorMessage = ref<string>('')
const errorCheck = ref<boolean>(false)

const formSubmit = ref<ChangePasswordForm>({
  email: '',
  password: '',
  token,
})

const authThemeImg = useGenerateImageVariant(
  registerMultistepIlustrationLight,
  registerMultistepIlustrationDark,
)

const authThemeMask = useGenerateImageVariant(authV2MaskLight, authV2MaskDark)

// Actions
const changePassword = async () => {
  const { valid } = await form.value.validate()
  if (!valid)
    return
  if (!formAvailable.value)
    return

  loading.value = true
  LoginService.changePassword(formSubmit.value)
    .then(() => {
      ToastService.success('Contraseña actualizada correctamente')
      errorCheck.value = false
      setTimeout(() => {
        router.push({ name: 'login', query: { email: formSubmit.value.email } })
      }, 1000)
    })
    .catch(error => {
      ToastService.error(error)
      errorCheck.value = true
      errorMessage.value = error
    }).finally(() => {
      loading.value = false
    })
}

const checkToken = () => {
  if (!token)
    router.push({ name: 'login' })

  LoginService.checkResetToken(token)
    .then(() => {
      formAvailable.value = true
      errorCheck.value = false
    })
    .catch(e => {
      errorCheck.value = true
      errorMessage.value = e
      ToastService.error('Token inválido')
    })
}

onBeforeMount(() => {
  checkToken()
})
</script>

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
            :src="authThemeImg"
            class="auth-illustration mt-16 mb-2"
          />
        </div>

        <VImg
          class="auth-footer-mask"
          :src="authThemeMask"
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
          <VNodeRenderer
            :nodes="themeConfig.app.logo"
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
            <span v-if="errorMessage !== ''">
              {{ errorMessage }}
              <a
                class="text-primary"
                href="/forgot-password"
              >aquí</a>.
            </span>
            <span v-else>
              El token ha expirado. Por favor, solicita un nuevo token
              <a
                class="text-primary"
                href="/forgot-password"
              >aquí</a> .
            </span>
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
                <AppTextField
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
                <AppTextField
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
                <AppTextField
                  v-model="passwordConfirm"
                  label="Confirmación de contraseña"
                  :disabled="loading"
                  :type="showPass2 ? 'text' : 'password'"
                  clearable
                  :rules="[requiredValidator, confirmedValidator(formSubmit.password, passwordConfirm)]"
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
                <RouterLink
                  class="d-flex align-center justify-center"
                  :to="{ name: 'login' }"
                >
                  <VIcon
                    icon="tabler-chevron-left"
                    class="flip-in-rtl"
                  />
                  <span>Regresar al login</span>
                </RouterLink>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
  </VRow>
</template>

<style lang="scss">
@use "@core/scss/template/pages/page-auth.scss";
</style>

<route lang="yaml">
meta:
  layout: blank
  action: read
  subject: Auth
  </route>
