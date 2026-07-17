import { CustomError } from 'ts-custom-error'

export class DomainError extends CustomError {
  public constructor(message?: string) {
    super(message ?? 'Ocurrió un error inesperado (DOMAIN1)')
  }
}
