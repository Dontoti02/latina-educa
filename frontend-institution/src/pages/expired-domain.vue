<script setup lang="ts">
import AccessDenied from '@images/login/access-denied.svg'

const route = useRoute()

const message = route.query.message || 'El dominio de tu institución ha expirado. ¡Vuelve al Login!'
</script>

<template>
  <div class="misc-wrapper">
    <div class="misc-center-content text-center mb-12">
      <!-- 👉 Title and subtitle -->
      <h4 class="text-h4 font-weight-medium mb-3">
        Dominio expirado :(
      </h4>
      <p>{{ message }}</p>
    </div>
    <div class="w-100 text-center">
      <VImg
        :src="AccessDenied"
        alt="Coming Soon"
        :max-width="380"
        class="mx-auto"
      />
    </div>
  </div>
</template>

<style lang="scss">
@use "@core/scss/template/pages/misc.scss";
</style>

<route lang="yaml">
meta:
  layout: blank
  action: read
  subject: Auth
</route>
