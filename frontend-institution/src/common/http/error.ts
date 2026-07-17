import { CustomError } from 'ts-custom-error'

export class HttpClientError extends CustomError {
  public constructor(message?: string) {
    super(message)
  }

  static code(code: string) {
    const message = `Ocurrió un error inesperado (${code})`

    return new HttpClientError(message)
  }
}
