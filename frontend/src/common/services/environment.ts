export class Environment {
  static get serverUrl() {
    return import.meta.env.VITE_SERVER_URL as string
  }

  static get storageUrl() {
    return import.meta.env.VITE_STORAGE_URL as string
  }


  static get isProduction() {
    return import.meta.env.VITE_APP_PRODUCTION as boolean
  }

}
