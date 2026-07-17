<script setup lang="ts">
import { computed } from 'vue'

export interface Props {
  visible: boolean
  isPersistent?: boolean
  isScrollable?: boolean
  width?: string
  fullscreen?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  isPersistent: true,
  isScrollable: false,
  width: '600px',
  fullscreen: false,
})

const emit = defineEmits(['close'])

const show = computed({
  get() {
    return props.visible
  },
  set(newValue) {
    if (!newValue)
      emit('close')
  },
})
</script>

<template>
  <VDialog
    v-model="show"
    :persistent="props.isPersistent"
    :width="!props.fullscreen ? props.width : ''"
    :scrollable="props.isScrollable"
    :fullscreen="props.fullscreen"
  >
    <slot />
  </VDialog>
</template>
