import { AxiosError, AxiosResponse } from 'axios'
import { HttpClientError } from './error'
import router from '@router'
import { ResponseData } from '@/common/http/response'
import AuthService from '@/modules/auth/service'
import { Environment } from '@/common/services/environment'

export interface SuccessResponseModel<T> {
  success: boolean
  message: string
  data: T
}

const isProduction = Environment.isProduction

enum StatusCode {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  METHOD_NOT_ALLOWED = 405,
  CONFLICT = 409,
  UNSUPPORTED_MEDIA_TYPE = 415,
  INTERNAL_SERVER_ERROR = 500,
  BAD_GATEWAY = 502,
  SERVICE_UNAVAILABLE = 503,
}

export async function tryHttpRequest<T>(requestFn: {
  (): Promise<AxiosResponse<ResponseData<T>>>
}): Promise<SuccessResponseModel<T>> {
  try {
    const result = await requestFn()
    const { success, data, message } = result.data

    if (!isProduction) {
      await sleep()
    }

    if (success) {
      return Promise.resolve({ data, message,success })
    }

    return Promise.reject(message)
  } catch (e) {
    if (e instanceof AxiosError) {
      switch (e.response?.status) {
        case StatusCode.UNAUTHORIZED:
          AuthService.logout()
          router.push('/login')
          break
      }

      const responseMessage = e.response?.data?.message

      if (responseMessage !== undefined) {
        let message = responseMessage
        if (responseMessage instanceof Array) {
          message = responseMessage[0]
        }
        const error = new HttpClientError(message)
        return Promise.reject(error)
      } else {
        const code = e.code !== undefined ? e.code : 'UNKNOWN'
        const error = HttpClientError.code(code)
        return Promise.reject(error)
      }
    }

    const error = HttpClientError.code('CLIENT')
    return Promise.reject(error)
  }
}

const sleep = () => new Promise((res) => setTimeout(res, 1000))
