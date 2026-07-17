import emitter from './emitter.service'
import { uid } from 'uid'

export class ModalService {
  #resolvers: { [key: string]: any } = {}

  constructor() {
    emitter.on('modalClose', (args: ModalCloseArgs) => {
      const resolve = this.#resolvers[args.id]
      if (resolve) {
        resolve(args)
        this.#resolvers[args.id] = undefined
      } else {
        console.error(`No resolver for modal id: ${args.id}`)
      }
    })
  }

  #addResolvers(id: string, resolve: Object) {
    this.#resolvers[id] = resolve
  }

  show(args: Omit<ModalArgs, 'id'>) {
    return new Promise<ModalCloseArgs>((resolve) => {
      const id = uid(16)
      this.#addResolvers(id, resolve)
      emitter.emit('modalOpen', { ...args, id })
    })
  }

  error(content: string, options?: Omit<ModalArgs, 'content'>) {
    if (content.startsWith('Error: ')) {
      content = content.slice(7)
    }
    return this.show({
      title: options?.title ?? 'Error',
      content: content,
      actions: options?.actions
    })
  }

  async confirmation(args: ConfirmationArgs) {
    return this.show({
      title: args.title,
      actions: ModalActions.CONFIRMATION,
      content: args.content
    }).then((result) => result.confirm)
  }
}

export const modalService = new ModalService()

export default modalService

export const modalConfirmation = modalService.confirmation.bind(modalService)

export const modalError = modalService.error.bind(modalService)

export interface ConfirmationArgs {
  title: string
  content: string
}
export interface ModalArgs {
  id: string
  title: string
  content: string
  actions?: ModalActions
}

export interface ModalCloseArgs {
  id: string
  confirm: boolean
}

export enum ModalActions {
  CONFIRMATION = 'confirmation'
}
