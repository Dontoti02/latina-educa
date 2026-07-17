<template>
     <v-overlay
        v-model="loader!"
        class="align-center justify-center"
        contained
        :opacity="opacity"
    >
      <slot v-if="hasDefaultSlot" name="default" />
      
      <v-progress-circular
        v-else
        color="primary"
        size="64"
        indeterminate
      ></v-progress-circular>
    </v-overlay>
  </template>
  <script lang="ts" setup>
  import { computed, useSlots } from 'vue';

  withDefaults(defineProps<{
      loader: boolean,
      opacity?:number,
    }>(), {
      loader: false,
      opacity: 0.6
    })

    const slots = useSlots()
    const hasDefaultSlot = computed(() =>   slots.default)
  </script>
  