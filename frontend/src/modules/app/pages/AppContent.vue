<script setup lang="ts">

</script>

<template>
  <v-container fluid class="app-content d-flex flex-column my-0 py-0">
    <div style="color: var(--primary-blue-color)">
      <h2 class="my-0 mb-0 font-weight-medium">
        <slot name="title"></slot>
      </h2>
      <p class="my-0 text-body-2">
        <slot name="subtitle"></slot>
      </p>
    </div>
    <slot></slot>
  </v-container>
</template>

<style lang="scss"></style>
