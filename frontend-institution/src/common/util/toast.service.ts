import emitter from './emitter.service'

export interface ToastAction {
  message: string
  type: string
}
export class ToastService {
  static async show(message: string, type: string) {
    emitter.emit('toastOpen', { message, type })
  }

  static async success(message: string) {
    if (!message)
      message = 'Done'

    ToastService.show(message, 'success')
  }

  static async error(message: string) {
    ToastService.show(message, 'error')
  }
}

export const toastShow = ToastService.show

export const toastSuccess = ToastService.success

export const toastError = ToastService.error
