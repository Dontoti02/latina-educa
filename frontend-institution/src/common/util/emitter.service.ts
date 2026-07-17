import type { Emitter } from 'mitt'
import mitt from 'mitt'
import type { ModalArgs, ModalCloseArgs } from './modal.service'
import type { ToastAction } from './toast.service'

export interface Events {
  [key: string]: unknown
  [key: symbol]: unknown
  toastOpen: ToastAction
  modalOpen: ModalArgs
  modalClose: ModalCloseArgs
  modalInput : {
    value : string
  }
  updateListContent: null
  updateMenu: null
  updateUrlLinkNav: {
    url: string
    subject: string
  },
  searchJobOffer:null | string
}

const emitter: Emitter<Events> = mitt<Events>()

export default emitter
