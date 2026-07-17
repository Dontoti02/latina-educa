<script lang="ts" setup>
import { JobOfferPublic } from '@/models/job-opportunities/public-job-offer';
import { DateFormatting } from '@/utils/date-formatting';
import { VCard, VCardActions, VCardTitle } from 'vuetify/lib/components/index.mjs';

const props = defineProps<{
  offer: JobOfferPublic,
  selected : boolean
}>();

</script>
<template>
  <VCard
    append-icon="mdi-chevron-right"
    :subtitle="props.offer.companyName"
    class="w-100 card-offer"
    :class="{ 'card-selected': props.selected }"
  >
    <template #title>
      <span style="white-space: normal;">
        {{ props.offer.title.length > 60 ? props.offer.title.slice(0, 60) + '...' : props.offer.title }}
      </span>
    </template>
    <VCardActions>
      <span class="text-caption text-grey px-3">
        {{ DateFormatting.timeAgo(DateFormatting.toValidDate(props.offer.publicationDate)) }}
      </span>
    </VCardActions>
  </VCard>
</template> 

<style>
.card-offer .v-card-item {
  padding-bottom: 0;
}
.card-offer {
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.card-offer:hover {
  background-color: var(--v-theme-surface-variant);
}
.card-selected {
  color: rgb(var(--v-theme-on-primary));
  border: 1px solid rgb(var(--v-theme-primary));
}
</style>
