import mitt, { type Emitter } from 'mitt'
import type { ToastAction } from './toast.service'
import type { ModalArgs, ModalCloseArgs } from './modal.service'

type Events = {
  toastOpen: ToastAction
  modalOpen: ModalArgs
  modalClose: ModalCloseArgs
}

const emitter: Emitter<Events> = mitt<Events>()

export default emitter
