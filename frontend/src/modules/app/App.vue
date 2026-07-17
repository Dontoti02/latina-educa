<script setup lang="ts">
import ManageToast from '@/common/components/toast/AppToast.vue';
import ConfirmModal from '@/common/components/confirm-modal/AppModal.vue';
import { applyConfig, getSysParams } from '@/common/util/global';
import { onBeforeMount } from 'vue';

// System Configuration
applyConfig()
onBeforeMount(() => {
  getSysParams()
})
</script>

<template>
  <router-view />
  <ManageToast />
  <ConfirmModal />
</template>

<style lang="scss">
  :root {
    --radius: 0.75rem;
  }
</style>
