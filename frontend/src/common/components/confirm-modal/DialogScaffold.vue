<script setup lang="ts">
import { useSlots } from 'vue'

const emit = defineEmits(['close'])
const slots = useSlots()
</script>
<template>
  <v-card>
    <div class="d-flex mt-2">
      <div
        class="d-flex align-center px-4"
        style="flex: 1"
      >
        <div class="text-h6">
          <slot name="title" />
        </div>
      </div>
      <v-btn
        variant="text"
        icon
        dark
        @click="emit('close')"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>
    <div class="px-4 pb-4">
      <slot />
      <div
        v-if="slots.actions"
        class="d-flex justify-end mt-4"
      >
        <slot name="actions" />
      </div>
    </div>
  </v-card>
</template>
