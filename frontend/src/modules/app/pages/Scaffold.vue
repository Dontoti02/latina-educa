<script setup lang="ts">
import AppNavigation from '@/modules/app/components/AppNavigation.vue'
import AppMain from '@/modules/app/components/AppMain.vue'
import AppLoadingLayer from '@/modules/app/components/AppLoadingLayer.vue'

</script>

<template>
  <v-layout class="d-flex flex-column" style="height: 100vh">
    <AppNavigation />
    <AppMain>
      <router-view />
    </AppMain>
  </v-layout>

  <AppLoadingLayer :show="false" />
</template>

<style lang="scss">
  :root {
    --radius: 0.75rem;
  }
</style>
