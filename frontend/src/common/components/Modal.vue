<script setup lang="ts">
import { computed } from 'vue'
export interface Props {
  show: boolean
  isPersistent?: boolean
  isScrollable?: boolean
  width?: number
  fullscreen?: boolean
}
const props = withDefaults(defineProps<Props>(), {
  show: false,
  isPersistent: true,
  isScrollable: false,
  width: 600,
  fullscreen: false
})

const emit = defineEmits(['close'])

const showModal = computed({
  get() {
    return props.show
  },
  set(newValue) {
    if (!newValue) {
      emit('close')
    }
  }
})
</script>
<template>
  <v-dialog
    :persistent="isPersistent"
    v-model="showModal"
    :width="width"
    :scrollable="isScrollable"
    :fullscreen="fullscreen"
  >
    <slot></slot>
  </v-dialog>
</template>
