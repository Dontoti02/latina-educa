<script setup lang="ts">
import emitter from '@/common/util/emitter.service'
import { type ToastAction } from '@/common/util/toast.service'
import { onMounted, reactive } from 'vue'
import ToastBase from './ToastBase.vue'

const initialState = {
  open: false,
  toast: {
    message: '',
    hasHtml: '',
    type: '',
  },
}

const state = reactive({
  ...initialState,
})

const hasHTML = (message: string) => {
  const htmlRegex = /<("[^"]*"|'[^']*'|[^'">])*>/

  return htmlRegex.test(message)
}

onMounted(() => {
  emitter.on('toastOpen', (args: ToastAction) => {
    state.toast = {
      message: args.message,
      hasHtml: hasHTML(args.message) ? 'html' : 'text',
      type: args.type,
    }

    state.open = true
    setTimeout(() => {
      state.open = false
    }, 10000)
  })
})
</script>

<template>
  <ToastBase
    class="fixed bottom-4 left-1/2 z-60 -translate-x-1/2"
    :type="state.toast.type"
    :open="state.open"
    @close="state.open = false"
  >
    <template v-if="state.toast.hasHtml === 'text'">
      {{ state.toast.message }}
    </template>
    <template v-if="state.toast.hasHtml === 'html'">
      <div
        style="color: #fff;"
        v-html="state.toast.message"
      />
    </template>
  </ToastBase>
</template>
./Template.vue./ToastBase.vue@/common/util/emitter.service@/common/util/toast.service
