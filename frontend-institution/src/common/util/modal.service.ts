import { uid } from 'uid'
import emitter from './emitter.service'

export class ModalService {
  #resolvers: { [key: string]: any } = {}

  constructor() {
    emitter.on('modalClose', (args: ModalCloseArgs) => {
      const resolve = this.#resolvers[args.id]
      if (resolve) {
        resolve(args)
        this.#resolvers[args.id] = undefined
      }
    })
  }

  #addResolvers(id: string, resolve: Object) {
    this.#resolvers[id] = resolve
  }

  show(args: Omit<ModalArgs, 'id'>) {
    return new Promise<ModalCloseArgs>(resolve => {
      const id = uid(16)
      this.#addResolvers(id, resolve)
      emitter.emit('modalOpen', { ...args, id })
    })
  }

  error(content: string, options?: Omit<ModalArgs, 'content'>) {
    if (content.startsWith('Error: '))
      content = content.slice(7)

    return this.show({
      title: options?.title ?? 'Error',
      content,
      actions: options?.actions,
    })
  }

  async confirmation(args: ConfirmationArgs) {
    const payload : {
      title: string
      content: string
      input?: InputFormModal
      actions: ModalActions,
      config?: {
        width?: number
      }
    } = {
      title: args.title,
      actions: ModalActions.CONFIRMATION,
      content: args.content,
    }
    if (args.input) {
      payload.input = args.input
    }
    if (args.config) {
      payload.config = args.config
    }
    return this.show(payload).then(result => result.confirm)
  }
}

export const modalService = new ModalService()

export default modalService

export const modalConfirmation = modalService.confirmation.bind(modalService)

export const modalError = modalService.error.bind(modalService)

export type InputFormModal = {
  label: string
  type: string
  placeholder?: string
  required?: boolean
}
export interface ConfirmationArgs {
  title: string
  content: string
  input?: InputFormModal,
  config?: {
    width?: number
  }
}
export interface ModalArgs {
  id: string
  title: string
  content: string
  input?: InputFormModal
  actions?: ModalActions
  config?: {
    width?: number
  }
}

export interface ModalCloseArgs {
  id: string
  confirm: boolean
}

export enum ModalActions {
  CONFIRMATION = 'confirmation',
}
