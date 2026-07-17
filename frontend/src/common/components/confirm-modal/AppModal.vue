<script setup lang="ts">
import { ModalActions, type ModalArgs } from '@/common/util/modal.service'
import { reactive, onMounted } from 'vue'
import emitter from '@/common/util/emitter.service'
import DialogScaffold from '@/common/components/confirm-modal/DialogScaffold.vue'

const initialState: {
  open: boolean
  modal: ModalArgs | null
} = {
  open: false,
  modal: null
}


const state = reactive({
  ...initialState
})

const eventBtn = (confirm: boolean) => {
  state.open = false
  const id = state.modal!.id
  if (id) {
    emitter.emit('modalClose', { confirm, id })
  }
}

const show = (args: ModalArgs) => {
  if (state.open) {
    eventBtn(false)
  }
  state.modal = args
  state.open = true
}

onMounted(() => {
  emitter.on('modalOpen', (event) => {
    show(event)
  })
})
</script>
 
<template>
  <v-dialog persistent v-model="state.open" width="350">
    <DialogScaffold @close="eventBtn(false)">
      <template #title> {{ state.modal!.title }} </template>
      <div style="color: var(--primary-sem-grey-color);">
        {{ state.modal!.content }}
      </div>
      <template #actions>
        <template v-if="state.modal!.actions === ModalActions.CONFIRMATION">
          <v-btn variant="text" color="primary" @click="eventBtn(false)">
            Cancelar
          </v-btn>
          <v-btn variant="flat" color="primary" @click="eventBtn(true)">
            Aceptar
          </v-btn>
        </template>
        <template v-else>
          <v-btn variant="text" color="primary" @click="eventBtn(false)">
            Cerrar
          </v-btn>
        </template>
      </template>
    </DialogScaffold>
  </v-dialog>
</template>

<style></style>