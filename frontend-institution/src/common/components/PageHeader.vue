<script lang="ts" setup>
import BulbLightImg from '@images/illustrations/bulb-light.png'
import PencilRocketImg from '@images/illustrations/pencil-rocket.png'
import { VCard, VCol } from 'vuetify/lib/components/index.mjs';
const props = defineProps({
  title: {
    type: String,
    default: 'Ofertas de trabajo',
  },
  description: {
    type: String,
    default: 'Aquí puedes ver todas las ofertas de trabajo disponibles.',
  },
})
</script>
<template>
  <VCard>
    <VRow>
      <VCol cols="2" class="pl-8 pt-6 pb-0">
        <img :src="BulbLightImg" height="100" />
      </VCol>
      <VCol cols="8" class="pt-6 px-8 d-flex text-center justify-center align-center flex-column">
        <VRow align="center" justify="center" class="mx-0 my-0 w-100">
          <VCol cols="12" class="py-0">
            <h1>
              {{ props.title }}
            </h1>
            <p class="my-0">
              {{ props.description }}
            </p>
          </VCol>
        </VRow>
      </VCol>
      <VCol cols="2" class="pb-0 d-flex justify-end align-end">
        <img :src="PencilRocketImg" height="140" />
      </VCol>
    </VRow>
  </VCard>
</template>
