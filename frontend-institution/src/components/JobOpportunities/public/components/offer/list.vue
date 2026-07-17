<script lang="ts" setup>
import OfferCard from '@/components/JobOpportunities/public/components/offer/card.vue';
import { GlobalPagination } from '@/models/global';
import { JobOfferPublic } from '@/models/job-opportunities/public-job-offer';
import { ref, onMounted } from 'vue';
import { VCol } from 'vuetify/lib/components/index.mjs';

const props = defineProps<{
  offers: Array<JobOfferPublic>,
  total: number,
  pagination : GlobalPagination
  selected : JobOfferPublic | null
}>();

const emmit = defineEmits<{
  (e: 'select', offer: JobOfferPublic): void,
  (e: 'update:pagination', pagination: GlobalPagination): void
}>();

const viewportHeight = ref(window.innerHeight);

const updateHeight = () => {
  viewportHeight.value = window.innerHeight;
};

onMounted(() => {
  window.addEventListener('resize', updateHeight);
});

const height = computed(() => `calc(${viewportHeight.value}px - 10rem)`);
</script>
<template>
  <div class="offer-list" :style="{ height }">
    <VCard class="w-100 card-header" dense="compact"
    >
      <template #title>
       <VRow>
         <VCol cols="12" md="6">
           <span class="text-h6 d-flex flex-wrap gap-4">
            <router-link to="/bolsa-laboral" class="text-decoration-none">
              Bolsa Laboral
            </router-link>
            <span>
              <strong>
                {{ props.total }}
              </strong>
              &nbsp;Ofertas de Trabajo
            </span>
          </span>
         </VCol>
          <VCol cols="12" md="6" class="text-end">
            <v-pagination 
              :length="pagination.lastPage"
              rounded="circle"
              :total-visible="2"
              v-model="pagination.currentPage"
              density="compact"
              @update:modelValue="emmit('update:pagination', pagination)"
            ></v-pagination>
          </VCol>
       </VRow>
      </template>
    </VCard>
    <OfferCard
      v-for="offer in props.offers"
      :key="offer.id"
      :offer="offer"
      :selected="props.selected? props.selected.id === offer.id : false"
      @click="emmit('select', offer)"
      class="mb-2"
    />
  </div>
</template>

<style>
.card-header {
  position: sticky;
  top: 0;
  z-index: 1;
}
.offer-list {
  overflow-y: scroll;
  padding-left:.5rem;
  padding-right:.5rem;
}

</style>
