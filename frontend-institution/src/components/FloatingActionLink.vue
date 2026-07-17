<template>
  <div class="floating-button">
    <VTooltip
      location="left"
      :model-value="tooltipVisible"
      @update:model-value="tooltipVisible = true"
      :content-class="'tooltip-content'"
    >
      <template #activator="{ props }">
        <VBtn
          v-bind="props"
          color="primary"
          icon
          size="large"
          elevation="8"
          @click="openLink"
        >
          <VIcon>{{ icon }}</VIcon>
        </VBtn>
      </template>
      <span>{{ tooltip }}</span>
    </VTooltip>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const props = defineProps<{
  tooltip: string
  url: string
  icon: string
}>()

const tooltipVisible = ref(true)

const openLink = () => {
  window.open(props.url, '_blank')
}

onMounted(() => {
  tooltipVisible.value = true
})
</script>

<style scoped>
.floating-button {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 9999;
}

::v-deep(.tooltip-content) {
  background-color: rgb(var(--v-theme-primary)) !important;
  color: rgb(var(--v-theme-on-primary)) !important;
  right: 80px;
  top: 30px;
}
</style>
