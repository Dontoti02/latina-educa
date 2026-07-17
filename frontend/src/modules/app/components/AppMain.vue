<script setup lang="ts">
import AppBar from '@/modules/app/components/AppBar.vue'

</script>

<template>
  <AppBar />
  <v-main class="main">
    <slot />
  </v-main>
</template>

<style scoped lang="scss">
  .main {
    margin: 2rem 2rem 0rem 2rem;
  }
</style>