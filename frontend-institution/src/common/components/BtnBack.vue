<script setup lang="ts">
import router from '@/router';
 
const back = () => {
  router.back();
}

</script>

<template>
  <VBtn
    variant="tonal"
    icon="tabler-chevron-left"
    density="compact"
    rounded="sm"
    @click="back()"
  /> 
</template>
