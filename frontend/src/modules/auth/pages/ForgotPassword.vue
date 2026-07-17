<script setup lang="ts">
import { ToastService } from '@/common/util/toast.service'
import { emailValidator } from '@/common/util/validators'
import authV2ForgotPasswordIllustrationLight from '@/assets/images/login/auth-v2-forgot-password-illustration-light.png'
import authV2MaskLight from '@/assets/images/login/misc-mask-light.png'
import { ref } from 'vue'
import { SessionStore } from '@/common/store'
import AuthService from '@/modules/auth/service'
import { getUrlImage } from '@/common/util/global'

const session = SessionStore()

const email = ref('')
const form = ref()
const loading = ref(false)

const sendEmail = async () => {
  const { valid } = await form.value.validate()
  if (!valid)
    return

  loading.value = true
  AuthService.resetPassword(email.value)
    .then(() => {
      ToastService.success('Email enviado')
    })
    .catch(() => {
      ToastService.error('Error al enviar el email')
    }).finally(() => {
      loading.value = false
    })
}
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
            max-width="368"
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
            ¿Olvidaste tu contraseña? 🔒
          </h5>
          <p class="mb-0">
            Ingresa tu correo electrónico y te enviaremos instrucciones para
            restablecer tu contraseña.
          </p>
        </VCardText>

        <VCardText>
          <VForm
            ref="form"
            @submit.prevent="sendEmail"
          >
            <VRow>
              <VCol cols="12">
                <v-text-field
                  v-model="email"
                  autofocus
                  label="Email"
                  variant="solo"
                  type="email"
                  :rules="[emailValidator]"
                />
              </VCol>

              <VCol cols="12">
                <VBtn
                  block
                  type="submit"
                  style="text-transform: none;"
                  :loading="loading"
                >
                  Enviar enlace de reinicio
                </VBtn>
              </VCol>

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

<style lang="scss">
.auth-wrapper {
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
}

@media (min-width: 960px) {
  .skin--bordered {
    .auth-card-v2 {
      border-inline-start: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)) !important;
    }
  }
}
</style>
