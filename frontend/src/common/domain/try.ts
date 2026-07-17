import { HttpClientError } from '../http/error'
import { ResponseData } from '../http/response'
import { ToastService } from '../util/toast.service'

type ResponseDataOrVoid<T> = T extends void ? void : ResponseData<T>

export async function tryDomainTask<T = void>(fn: {
  (): Promise<ResponseDataOrVoid<T>>
}): Promise<ResponseDataOrVoid<T>> {
  try {
    return await fn()
  } catch (e: any) {
    ToastService.error(e.message ?? e)
    throw new HttpClientError(e)
  }
}
