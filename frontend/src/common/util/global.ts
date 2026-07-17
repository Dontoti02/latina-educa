import { Environment } from '../services/environment'
import { SessionStore } from '../store'
import ParametersService from '@/modules/private/parameters/services/parameters.service'

export const hexToRgb = (hex: string) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i

  hex = hex.replace(
    shorthandRegex,
    (m: string, r: string, g: string, b: string) => {
      return r + r + g + g + b + b
    }
  )

  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)

  return result
    ? `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}`
    : null
}

export const getUrlImage = (imageDisk: string): string => {
  const serverUrl = Environment.serverUrl.replace(/\/api$/, '')

  return `${serverUrl}/storage/${imageDisk}`
}

export const applyConfig = () => {
  const sessionStore = SessionStore()
  if (sessionStore.system_parameters) {
    if (sessionStore.system_parameters.app_name)
      document.title = sessionStore.system_parameters.app_name

    if (sessionStore.system_parameters.favicon) {
      const link : HTMLLinkElement =
        document.querySelector("link[rel*='icon']") ||
        document.createElement('link')

      link.type = 'image/x-icon'
      link.rel = 'shortcut icon'
      link.href = getUrlImage(sessionStore.system_parameters.favicon)
      document.getElementsByTagName('head')[0].appendChild(link)
    }
  }
}

export const getSysParams = () => {
  ParametersService.getGeneralSysParams()
}
