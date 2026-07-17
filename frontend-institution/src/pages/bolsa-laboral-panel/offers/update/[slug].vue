<script lang="ts" setup>
  import PageHeader from '@/common/components/PageHeader.vue'
  import OfferCreateComponent from '@/components/JobOpportunities/private/offers/create/Index.vue';
  const route = useRoute()
</script>

<template>
  <div>
    <PageHeader
      title="Editar oferta de trabajo"
    />
    <OfferCreateComponent :slug="Array.isArray(route.params.slug) ? route.params.slug[0] : route.params.slug" />
  </div>
</template>
<route lang="yaml">
meta:
  action: read
  subject: Offers
</route>
