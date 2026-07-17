import { getCookie, removeCookie, setCookie } from 'typescript-cookie'

class CookiesService {
  get(name: string): string | null {
    const value = getCookie(name)

    return value !== undefined ? value : null
  }

  getObject<T extends object = any>(name: string): T | null {
    const value = this.get(name)

    return value !== null ? JSON.parse(value) : null
  }

  set(name: string, value: string | object | null) {
    if (value !== null) {
      if (typeof value === 'object')
        value = JSON.stringify(value)

      setCookie(name, value)
    }
    else {
      removeCookie(name)
    }
  }
}

const instance = new CookiesService()

export default instance
