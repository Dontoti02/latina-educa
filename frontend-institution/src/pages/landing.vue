<script setup lang="ts">
import type { LandingData } from '@/models/landing'
import { LandingService } from '@/services/landing.service'

const data = ref<LandingData>()
const loading = ref(true)

const getLandingData = async () => {
  loading.value = true
  LandingService.getLandingDataStatic()
    .then(response => {
      data.value = response.data
      console.log(data.value)
    }).finally(() => {
      loading.value = false
    })
}

onMounted(() => {
  getLandingData()
})
</script>

<template>
  <div v-if="!loading && data">
    <Carrousel
      :images="data.banners"
      :institution="data.institution"
    />
    <VSpacer class="my-10" />
    <Services :services="data.services" />
    <VSpacer class="my-10" />
    <News :news="data.news" />
    <Teachers :teachers="data.teachers" />
    <Courses :careers="data.careers" />
    <Summary :summary="data.summary" />
    <Footer
      :contacts="data.contact_information"
      :institution="data.institution"
    />
  </div>
</template>

<route lang="yaml">
meta:
  layout: blank
  action: read
  subject: Auth
  redirectIfLoggedIn: false
</route>
