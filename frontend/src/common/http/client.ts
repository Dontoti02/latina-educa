import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios'
import { tryHttpRequest } from './try'
import { Environment } from '@/common/services/environment'
import { SessionStore } from '@/common/store'
import { FormRequest } from '../util/form-requests'

const FORM_DATA_HEADERS = { 'Content-Type': 'multipart/form-data' }
const JSON_HEADERS = { 'Content-type': 'application/json' }

class HttpClient {
  readonly #http: AxiosInstance

  constructor() {
    this.#http = axios.create({
      baseURL: Environment.serverUrl,
      headers: JSON_HEADERS
    })
    this.#http.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const sessionStore = SessionStore()
        if (!sessionStore.token) {
          return config
        }
        config.headers['Authorization'] = `Bearer ${sessionStore.token}`
        return config
      }
    )
  }

  async get<T>(url: string) {
    return tryHttpRequest<T>(() => this.#http.get(url))
  }

  async post<T>(url: string, data: object) {
    return tryHttpRequest<T>(() => this.#http.post(url, data))
  }

  async postFormData<T,D>(url: string, data: T) {
    const formData = FormRequest.build(data as object)

    return tryHttpRequest<D>(() =>
      this.#http.post(url, formData, {
        headers: FORM_DATA_HEADERS
      })
    )
  }

  async put<T>(url: string, data: object) {
    return tryHttpRequest<T>(() => this.#http.put(url, data))
  }

  async delete<T>(url: string) {
    return tryHttpRequest<T>(() => this.#http.delete(url))
  }
}

export default new HttpClient()
