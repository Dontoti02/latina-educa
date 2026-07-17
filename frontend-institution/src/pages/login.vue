<script setup lang="ts">
import { SessionStore } from '@/common/store'
import { ToastService } from '@/common/util/toast.service'
import { UserAbility } from '@/plugins/casl/AppAbility'
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import { LoginService } from '@/services/login.service'
import { getUserAbilities } from '@/utils/abilities'
import { ImageUtils } from '@/utils/images'
import { getMenu } from '@/utils/system-configuration'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'
import { emailValidator, requiredValidator } from '@validators'
import { VForm } from 'vuetify/components/VForm'
import { VProgressCircular } from 'vuetify/lib/components/index.mjs'
import FloatingActionLink from '@/components/FloatingActionLink.vue'
import { onMounted } from 'vue';
import { GeneralSystemConfiguration } from '../models/system-configurations';
const sessionStore = SessionStore()

const isPasswordVisible = ref(false)

const route = useRoute()
const router = useRouter()

const ability = useAppAbility()
const systemConfiguration = ref<GeneralSystemConfiguration|null>();

const errors = ref<Record<string, string | undefined>>({
  email: undefined,
  password: undefined,
})

const refVForm = ref<VForm>()
const loading = ref(false)

const email = ref<string>(route.query.email ? String(route.query.email) : '')
const password = ref<string>('')
const rememberMe = ref(false)

const login = async () => {
  loading.value = true

  LoginService.login({
    email: email.value,
    password: password.value,
    remember: rememberMe.value,
  }).then(async r => {
    const { accessToken, userData } = {
      accessToken: r.data.token,
      userData: {
        id: r.data.roles[0].pivot.user_id,
        names: r.data.user.names,
        photo: r.data.user.photo,
        email: r.data.user.email,
        phone: r.data.user.phone,
        role: r.data.roles.find(role => role.id === r.data.current_role)!,
        maximumFileSizeToUpload: r.data.maximum_file_size_to_upload,
        extensionsAllowedToUpload: r.data.extensions_allowed_to_upload,
        document_type: r.data.user.document_type,
        document_number: r.data.user.document_number,
      },
    }

    const userAbilities: UserAbility[] = getUserAbilities(r.data.menu)

    localStorage.setItem('userAbilities', JSON.stringify(userAbilities))
    ability.update(userAbilities)

    sessionStore.set({
      ...sessionStore.get(),
      token: accessToken,
      user: userData,
      roles: r.data.roles,
      academicPeriod: r.data.period,
    })

    // Redirect to `to` query if exist or redirect to index route
    router.replace(route.query.to ? String(route.query.to) : '/').then(() => {
      sessionStore.toggleChangingRole()
      setTimeout(() => {
        getMenu(ability).finally(() => {
          sessionStore.toggleChangingRole()
        })
      }, 500)
    })
  }).catch(e => {
    ToastService.error(e)
  }).finally(() => {
    loading.value = false
  })
}



const onSubmit = () => {
  refVForm.value?.validate().then(({ valid: isValid }) => {
    if (isValid)
      login()
  })
}
onMounted(() => {
  const session = sessionStore.get()
  systemConfiguration.value = session.systemConfiguration || null
})
</script>

<template>
  <VRow
    no-gutters
    class="auth-wrapper bg-surface"
  >
    <VCol
      v-if="sessionStore.systemConfiguration && sessionStore.systemConfiguration.banner && sessionStore.systemConfiguration.banner !== ''"
      lg="8"
      class="d-none d-lg-flex"
      style="height: 100vh;"
    >
      <div class="position-relative w-100 ma-8 me-0">
        <div class="d-flex align-center justify-center w-100 h-100">
          <VImg
            height="100%"
            :src="ImageUtils.getUrlImage(sessionStore.systemConfiguration.banner)"
            class="rounded-lg"
            cover
            position="center"
          >
            <template #placeholder>
              <VRow
                align="center"
                class="fill-height ma-0"
                justify="center"
              >
                <VProgressCircular
                  color="grey-lighten-5"
                  indeterminate
                />
              </VRow>
            </template>
          </VImg>
        </div>
      </div>
    </VCol>
    <VCol
      cols="12"
      :lg="sessionStore.systemConfiguration && sessionStore.systemConfiguration.banner && sessionStore.systemConfiguration.banner !== '' ? '4' : '12'"
      class="auth-card-v2 d-flex align-center justify-center px-4"
    >
      <VCard
        flat
        :width="500"
        class="mt-12 mt-sm-0 pa-4"
      >
        <VCardText>
          <VNodeRenderer
            v-if="sessionStore.systemConfiguration && sessionStore.systemConfiguration.logo"
            :nodes="h('img', { attrs: { src: ImageUtils.getUrlImage(sessionStore.systemConfiguration.logo) } })"
          />
          <VNodeRenderer
            v-else
            :nodes="themeConfig.app.logo"
            class="mb-6"
          />

          <h5 class="text-h4 mb-1">
            Bienvenido(a) a
            <span
              v-if="sessionStore.systemConfiguration !== null"
              class="text-capitalize"
            > {{ sessionStore.systemConfiguration.institution_name }} </span>
            <VProgressCircular
              v-else
              indeterminate
              color="primary"
              size="20"
              width="2"
            />!👋🏻
          </h5>
          <p class="mb-0">
            Inicie sesión en su cuenta para continuar...
          </p>
        </VCardText>
        <VCardText>
          <VForm
            ref="refVForm"
            @submit.prevent="onSubmit"
          >
            <VRow>
              <!-- email -->
              <VCol cols="12">
                <AppTextField
                  v-model="email"
                  label="Email"
                  type="email"
                  autofocus
                  :rules="[requiredValidator, emailValidator]"
                  :error-messages="errors.email"
                  :disabled="loading"
                />
              </VCol>

              <!-- password -->
              <VCol cols="12">
                <AppTextField
                  v-model="password"
                  label="Contraseña"
                  :rules="[requiredValidator]"
                  :type="isPasswordVisible ? 'text' : 'password'"
                  :error-messages="errors.password"
                  :append-inner-icon="
                    isPasswordVisible ? 'tabler-eye-off' : 'tabler-eye'
                  "
                  :disabled="loading"
                  @click:append-inner="isPasswordVisible = !isPasswordVisible"
                />

                <div class="d-flex align-center flex-wrap justify-space-between mt-2 mb-4">
                  <VCheckbox
                    v-model="rememberMe"
                    label="Recordarme"
                    :disabled="loading"
                  />
                  <RouterLink
                    class="text-primary ms-2 mb-1"
                    :to="{ name: 'forgot-password' }"
                  >
                    ¿Olvidaste tu contraseña?
                  </RouterLink>
                </div>

                <VBtn
                  block
                  type="submit"
                  :disabled="loading"
                >
                  <span v-if="!loading">Acceder</span>
                  <VProgressCircular
                    v-else
                    indeterminate
                    color="white"
                    size="24"
                  />
                </VBtn>
              </VCol>
            </VRow>
          </VForm>
        </VCardText>
      </VCard>
    </VCol>
    <FloatingActionLink
    v-if="systemConfiguration && systemConfiguration.redirect_links"
      :tooltip="systemConfiguration.redirect_links[0].name"
      :url="systemConfiguration.redirect_links[0].link"
      icon="mdi-link-variant"
    />
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
  redirectIfLoggedIn: true
</route>
