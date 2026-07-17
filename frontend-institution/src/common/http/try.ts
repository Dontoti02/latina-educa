import type { AxiosError, AxiosResponse } from 'axios'
import { SessionStore } from '../store'
import type { ResponseApi } from '@/common/http/response'
import router from '@/router'

// import AuthService from '@/modules/auth/service';

export interface SuccessResponseModel<T> {
  success: boolean
  message: string
  data: T
}

// enum StatusCode {
//   OK = 200,
//   CREATED = 201,
//   ACCEPTED = 202,
//   NO_CONTENT = 204,
//   BAD_REQUEST = 400,
//   UNAUTHORIZED = 401,
//   FORBIDDEN = 403,
//   NOT_FOUND = 404,
//   METHOD_NOT_ALLOWED = 405,
//   CONFLICT = 409,
//   UNSUPPORTED_MEDIA_TYPE = 415,
//   INTERNAL_SERVER_ERROR = 500,
//   BAD_GATEWAY = 502,
//   SERVICE_UNAVAILABLE = 503,
// }

export async function tryHttpRequest<T>(requestFn: {
  (): Promise<AxiosResponse<ResponseApi<T>>>
}): Promise<SuccessResponseModel<T>> {
  try {
    const result = await requestFn()
    const { success, data, message } = result.data

    if (success)
      return Promise.resolve({ data, message, success })

    return Promise.reject(message)
  }
  catch (e : any) {
    if (e.response.status === 401) {
      const session = SessionStore()
      session.remove()
      router.push('/')
    }

    if (e.response.status === 404)
      router.push({ name: 'not-found', query: { message: e.response.data.message } })

    if (e.response.status === 410) {
      const session = SessionStore()

      session.remove()
      router.push({ name: 'expired-domain', query: { message: e.response.data.message } })
    }

    if (e.response.status === 403) {
      const session = SessionStore()
      session.remove()
      router.push({ name: 'forbidden'})
    }

    if (e.code === "ERR_BAD_REQUEST") {
      const error = (e as AxiosError).response?.data as {
        message: string
        errors: {
          [key: string]: string[]
        }
      }
      return Promise.reject(new Error(error.message));
    }
    return Promise.reject((e as Error).message)
  }
}
