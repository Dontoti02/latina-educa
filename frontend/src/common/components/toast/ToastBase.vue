<script setup lang="ts">
import { ref } from 'vue'

const props = withDefaults(
  defineProps<{
    open: boolean
    type: string
  }>(),
  {
    open: false,
    type: ''
  }
)

const timeout = ref(3000)
</script>

<template>
  <v-snackbar v-model="props!.open" :timeout="timeout" elevation="24" multi-line>
    <v-icon :color="props.type" v-if="props.type === 'success'" icon="mdi-check-circle">
    </v-icon>
    <v-icon :color="props.type" v-if="props.type === 'error'" icon="mdi-alert-circle"></v-icon>&nbsp;&nbsp;Atención
    <slot></slot>
    <template v-slot:actions>
      <v-btn :color="props.type" @click="$emit('close')"> Cerrar </v-btn>
    </template>
  </v-snackbar>
</template>
