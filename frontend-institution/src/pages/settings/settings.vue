<script setup lang="ts">
import SettingsView from '@/components/settings/SettingsView.vue'
import BulbLightImg from '@images/illustrations/bulb-light.png'
import PencilRocketImg from '@images/illustrations/pencil-rocket.png'
</script>

<template>
  <div>
    <div>
      <VCard>
        <VRow class="">
          <VCol
            cols="3"
            class="pl-8 pt-6"
          >
            <img
              :src="BulbLightImg"
              height="100"
            >
          </VCol>
          <VCol
            cols="6"
            class="pt-6 px-8 d-flex text-center justify-center align-center flex-column"
          >
            <h1>Ajustes del sistema</h1>
            <p>Aquí podrás modifcar los parámetros de funcionamiento de la institución.</p>
          </VCol>
          <VCol
            cols="3"
            class="d-flex justify-end align-end"
          >
            <img
              :src="PencilRocketImg"
              height="140"
            >
          </VCol>
        </VRow>
      </VCard>
      <VSpacer />
      <SettingsView />
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  action: manage
  subject: Settings
    </route>
