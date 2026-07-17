<script setup lang="ts">
defineProps<{
  show: boolean
}>()
</script>
<template>
  <v-fade-transition>
    <div v-if="show" class="d-flex justify-center align-center" style="
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: white;
        z-index: 9999;
      ">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>
  </v-fade-transition>
</template>
