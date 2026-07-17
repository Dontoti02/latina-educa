<script setup lang="ts">
import JobOpportunitiesLayout from '@/components/JobOpportunities/public/Layout.vue'
import CardOfferDetail from '@/components/JobOpportunities/public/components/offer/detail.vue';
const slug = ref<string |  null>(null)
const route = useRoute()

onMounted(() => {
  const slugParams = route.params.slug as string;
  if (slugParams) {
    slug.value = slugParams;
  }
});
</script>

<template>
  <JobOpportunitiesLayout>
    <template #content>
      <VRow>
        <v-col cols="12" md="12" class="text-center my-0 ">
          <h1 class="text-h4 font-weight-bold">Oferta de Trabajo</h1>
          <h2 class="text-h6 font-weight-light">Detalles de la oferta</h2>
        </v-col>
        <v-col cols="12" md="12" class="text-center my-0 pt-0" style="position: relative;">
          <v-btn
            color="primary"
            rounded="xl"
            size="md"
            variant="text"
            @click="$router.push({ path: '/bolsa-laboral/empleos' })"
            style="position: absolute;left: 2rem;top: -1rem;"
          >
           <VIcon>
            mdi-arrow-left
           </VIcon> Volver a la lista de ofertas
          </v-btn>
        </v-col>
      </VRow>
      <v-col cols="12" md="12">
        <CardOfferDetail
          v-if="slug"
          :slug="slug"
        />
      </v-col>
    </template>
  </JobOpportunitiesLayout>
</template>

<style lang="scss">

</style>

<route lang="yaml">
meta:
  layout: blank
  action: read
  subject: Auth
</route>
