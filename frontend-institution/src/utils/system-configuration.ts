import { SessionStore } from '@/common/store'
import { ToastService } from '@/common/util/toast.service'
import { AppAbility, UserAbility } from '@/plugins/casl/AppAbility'
import { staticPrimaryColor } from '@/plugins/vuetify/theme'
import { LoginService } from '@/services/login.service'
import { SystemConfigurationService } from '@/services/system-configuration.service'
import { themeConfig } from '@themeConfig'
import type { ThemeInstance } from 'vuetify'
import { getUserAbilities } from './abilities'
import { ImageUtils } from './images'

export const getBoxColor = (color: string, index: number) => index ? color : staticPrimaryColor

export const setPrimaryColor = (vuetifyTheme: ThemeInstance, color: string) => {
  const currentThemeName = vuetifyTheme.name.value

  vuetifyTheme.themes.value[currentThemeName].colors.primary = color

  // ℹ️ We need to store this color value in localStorage so vuetify plugin can pick on next reload
  localStorage.setItem(`${themeConfig.app.title}-${currentThemeName}ThemePrimaryColor`, color)

  // ℹ️ Update initial loader color
  localStorage.setItem(`${themeConfig.app.title}-initial-loader-color`, color)
}

export const applyConfig = (vuetifyTheme: ThemeInstance) => {
  const sessionStore = SessionStore()
  if (sessionStore.systemConfiguration) {
    if (sessionStore.systemConfiguration.institution_name)
      document.title = sessionStore.systemConfiguration.institution_name

    if (sessionStore.systemConfiguration.favicon) {
      const link = document.querySelector('link[rel*=\'icon\']') as HTMLLinkElement || document.createElement('link')

      link.type = 'image/x-icon'
      link.rel = 'shortcut icon'
      link.href = ImageUtils.getUrlImage(sessionStore.systemConfiguration.favicon)
      document.getElementsByTagName('head')[0].appendChild(link)
    }

    if (sessionStore.systemConfiguration.primary_color)
      setPrimaryColor(vuetifyTheme, sessionStore.systemConfiguration.primary_color)
  }
}

export const getSysConf = (vuetifyTheme: ThemeInstance) => {
  SystemConfigurationService.getGeneralSysConfig().then(r => {
    const sessionStore = SessionStore()
    const session = sessionStore.get()
    sessionStore.set({
      ...session,
      systemConfiguration: r.data,
    })
    applyConfig(vuetifyTheme)
  }).catch(e => {
    ToastService.error(e)
  })
}

export const changeRole = async (role_id: number, ability: AppAbility) => {
  const session = SessionStore()  
  session.toggleChangingRole()

  try {
    const changeRole = await LoginService.changeRole(role_id)
    session.set({
      ...session.get(),
      user: {
        ...session.user!,
        role: session.roles.find(role => role.id === changeRole.data)!,
      },
    })

    await getMenu(ability)
  } catch (error: any) {
    ToastService.error(error)
  } finally {
    session.toggleChangingRole()
  }
}

export const getMenu = (ability: AppAbility) => {
  const session = SessionStore()
  return LoginService.menu().then((response) => {
    const userAbilities: UserAbility[] = getUserAbilities(response.data)

    localStorage.setItem('userAbilities', JSON.stringify(userAbilities))
    ability.update(userAbilities)

    session.set({
      ...session.get(),
      modules: response.data,
    })
  })
}

export const getProfile = () => {
  const session = SessionStore()

  return LoginService.profile().then((r) => {
    const userData = {
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
      }

    session.set({
      ...session.get(),
      user: userData,
      roles: r.data.roles,
      academicPeriod: r.data.period,
    })
  })
}
