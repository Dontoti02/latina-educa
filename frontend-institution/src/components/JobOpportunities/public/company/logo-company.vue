<script setup lang="ts">
import { ImageUtils } from '@/utils/images';

const props = defineProps<{
  logo: string| null,
  name?: string,
  isVerified: boolean,
}>();

const computedName = computed(() => {
  if (!props.name) return '';
  return props.name.charAt(0).toUpperCase();
});
</script>
<template>
  <div style="position: relative; width: 80px; height: 80px;">
    <VAvatar
      size="80"
      :image="props.logo ? ImageUtils.getUrlImage(props.logo) : undefined"
      color="primary"
      class="elevation-3"
    >
       <span class="text-h5 text-white">{{ computedName }}</span>
    </VAvatar>
    <template v-if="props.isVerified">
      <div class="verified-icon">
        <VIcon size="24" color="primary"
      >mdi-check-decagram-outline</VIcon>
      </div>
    </template>
  </div>
</template>
<style>
  .verified-icon {
    background-color: white;
    position: absolute;
    top: 0;
    right: 0;
    z-index: 2;
    border-radius: 50%;
    padding: 1px;
  }
</style>
