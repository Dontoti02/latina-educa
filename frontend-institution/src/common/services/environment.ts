export class Environment {
  static get serverUrl() {
    return import.meta.env.VITE_SERVER_URL as string
  }

  static get isProduction() {
    const env = import.meta.env.VITE_APP_ENV as string

    return env === 'production'
  }

  static get tenantSubdomain() {
    return import.meta.env.VITE_TENANT_SUBDOMAIN as string
  }
}
