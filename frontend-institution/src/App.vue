<script setup lang="ts">
import ScrollToTop from '@core/components/ScrollToTop.vue'
import { useThemeConfig } from '@core/composable/useThemeConfig'
import { hexToRgb } from '@layouts/utils'
import { useTheme } from 'vuetify'
import AppModal from './common/components/confirm-modal/AppModal.vue'
import AppToast from './common/components/toast/AppToast.vue'
import { SessionStore } from './common/store'
import emitter from './common/util/emitter.service'
import LoadingPage from './components/LoadingPage.vue'
import { useAppAbility } from './plugins/casl/useAppAbility'
import { applyConfig, getMenu, getSysConf } from './utils/system-configuration'

const { syncInitialLoaderTheme, syncVuetifyThemeWithTheme: syncConfigThemeWithVuetifyTheme, isAppRtl, handleSkinChanges } = useThemeConfig()

const vuetifyTheme = useTheme()

const session = SessionStore()
const ability = useAppAbility()

// ℹ️ Sync current theme with initial loader theme
syncInitialLoaderTheme()
syncConfigThemeWithVuetifyTheme()
handleSkinChanges()

// Update Menu
const getMenuInfo = () => {
  session.toggleChangingRole()
  getMenu(ability).finally(() => session.toggleChangingRole())
}

// System Configuration
applyConfig(vuetifyTheme)
onBeforeMount(() => {
  getSysConf(vuetifyTheme)

  if(session.isLoggedIn())
    getMenuInfo()
})

// Menu
emitter.on('updateMenu', event => {
  session.toggleChangingRole()
  getMenu(ability).finally(() => session.toggleChangingRole())
})
</script>

<template>
  <VLocaleProvider :rtl="isAppRtl">
    <!-- ℹ️ This is required to set the background color of active nav link based on currently active global theme's primary -->
    <VApp :style="`--v-global-theme-primary: ${hexToRgb(vuetifyTheme.global.current.value.colors.primary)}`">
      <RouterView />
      <ScrollToTop />
    </VApp>
  </VLocaleProvider>

  <LoadingPage />

  <AppToast />

  <AppModal />
</template>
