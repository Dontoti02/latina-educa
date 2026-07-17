<script setup lang="ts">
import { computed } from 'vue';
import { ResumenInstitution } from '../../../domain/Institution';
import { Environment } from '@/common/services/environment';

const props = defineProps<{data:ResumenInstitution}>()

const url = computed(() => Environment.storageUrl  + '/' + props.data.icon)

</script>

<template>
  <VCard hover class="pa-2">
    <!-- <VCardTitle class="text-indigo">
        <VIcon>mdi-arrow-left</VIcon>
    </VCardTitle> -->
    <VCardSubtitle>
      Bienvenido a {{ data.name }}
    </VCardSubtitle>
    <VCardText>
        <VImg
            :src="url"
            height="50"
            class="w-100"
          />
    </VCardText>
  </VCard>
</template>

<style lang="scss" scoped>
</style>
