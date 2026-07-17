import { HttpClientError } from '../http/error'
import { DomainError } from './error'
import { ResponseData } from './models'

type ResponseDataOrVoid<T> = T extends void ? void : ResponseData<T>

export async function tryDomainTask<T = void>(fn: {
  (): Promise<ResponseDataOrVoid<T>>
}): Promise<ResponseDataOrVoid<T>> {
  try {
    return await fn()
  } catch (e) {
    if (e instanceof HttpClientError) {
      throw e
    }
    throw new DomainError()
  }
}
