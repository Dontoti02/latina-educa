<script setup lang="ts">
import PageHeader from '@/common/components/PageHeader.vue';
import OfferCreateComponent from '@/components/JobOpportunities/private/offers/create/Index.vue'
</script>
<template>
  <div>
      <PageHeader 
      title="Crear oferta de trabajo"
      description="Aquí puedes crear una nueva oferta de trabajo."
    />
    <OfferCreateComponent />
  </div>
</template>
<route lang="yaml">
meta:
  action: read
  subject: Offers
</route>
