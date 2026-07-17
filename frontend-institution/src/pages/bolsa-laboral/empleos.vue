<script setup lang="ts">
import PublicFiltersJobOffers from '@/components/JobOpportunities/public/components/PublicFiltersJobOffers.vue';
import JobOpportunitiesLayout from '@/components/JobOpportunities/public/Layout.vue'
import { DEFAULT_JOB_OFFER_FILTERS_FORM } from '@/components/JobOpportunities/utils/joboffer.utils';
import { JobOffersFiltersForm } from '@/models/job-opportunities/job-offer';
import { JobOfferFiltersPublic, JobOfferPublic } from '@/models/job-opportunities/public-job-offer';
import { JobOpportunitiesJobOfferService } from '@/services/job-opportutines/job-offer';
import OfferList from '@/components/JobOpportunities/public/components/offer/list.vue';
import { ref } from 'vue';
import { GlobalPagination } from '@/models/global';
import { VSkeletonLoader } from "vuetify/lib/labs/components.mjs";
import CardOfferDetail from '@/components/JobOpportunities/public/components/offer/detail.vue';
import JobSearchAutocomplete from '@/components/JobOpportunities/public/components/JobSearchAutocomplete.vue';

const filters  = ref<JobOfferFiltersPublic>()
const offers = ref<Array<JobOfferPublic> | null>(null)
const selectedOffer = ref<JobOfferPublic | null>(null)
const formFilters = ref<JobOffersFiltersForm>(DEFAULT_JOB_OFFER_FILTERS_FORM);
const pagination = ref<GlobalPagination>({
  currentPage: 0,
  itemsPerPage: 0,
  totalItems: 0,
  lastPage: 1,
})
const loaders = ref({
  filters: false,
  offers: false,
})

const viewportHeight = ref(window.innerHeight);

const updateHeight = () => {
  viewportHeight.value = window.innerHeight;
};

onMounted(() => {
  window.addEventListener('resize', updateHeight);
});

const height = computed(() => `calc(${viewportHeight.value}px - 15rem)`);

const fetchPublicJobOffersFilters = async () => {
  loaders.value.filters = true
  try {
    const { data } = await JobOpportunitiesJobOfferService.publicfilters()
    filters.value = data
  } finally {
    loaders.value.filters = false
  }
}

const fetchJobOffers = async () => {
  loaders.value.offers = true
  try {
    const { data } = await JobOpportunitiesJobOfferService.publicList(formFilters.value)
    offers.value = data.items
    pagination.value = data.pagination
  } finally {
    loaders.value.offers = false
  }
}

const applyFilters = async (form: Omit<JobOffersFiltersForm, 'perPage' | 'page'>) => {
  formFilters.value = {
    ...form,
    page: 1,
    perPage: pagination.value.itemsPerPage,
  }
  selectedOffer.value = null
  await fetchJobOffers()
}

const onChangePagination = (aux: GlobalPagination) => {
  pagination.value.currentPage = aux.currentPage
  formFilters.value.page = aux.currentPage
  fetchJobOffers()
}
onMounted(async () => {
  await Promise.all([
    fetchPublicJobOffersFilters(),
    fetchJobOffers()
  ])
})

onUnmounted(() => {
})
</script>
<template>
  <JobOpportunitiesLayout
    :showSearchBar="true"
  >
    <template #content>

      <JobSearchAutocomplete class="hidden-desktop" />

      <PublicFiltersJobOffers
        v-if="filters && !loaders.filters"
        :filters="filters!"
        @submit="applyFilters"
      />

      <VSkeletonLoader
        v-if="loaders.filters"
        class="mt-4"
        type="list-item,list-item-three-line,list-item-three-line,list-item-three-line,list-item-three-line,list-item-three-line,list-item-three-line" 
        :loading-text="'Cargando filtros de ofertas de trabajo...'"
        :height="height"
        :rounded="8"
      />

      <v-row v-else-if="!offers">
        <VCard  class="text-center w-100">
          <VCol cols="12" class="py-4">
            <span class="text-caption text-grey">
              No hay ofertas de trabajo disponibles.
            </span>
          </VCol>
        </VCard>
      </v-row>

      <v-row dense v-else-if="offers.length > 0">
        <v-col cols="12" md="4">
          <OfferList
            :offers="offers"
            :total=pagination.totalItems
            :pagination="pagination"
            :selected="selectedOffer"
            @select="selectedOffer = $event"
            @update:pagination="onChangePagination($event)"
          /> 
        </v-col>

        <v-col cols="12" md="8">
            <CardOfferDetail 
              v-if="selectedOffer"
              :slug="selectedOffer.slug"
            />
            <VCard v-else>
              <VCardTtile>
                <VRow class="pt-4">
                  <VCol cols="12" class="text-center">
                    <VIcon size="48" color="primary">
                      mdi-note-search-outline
                    </VIcon>
                  </VCol>
                </VRow>
              </VCardTtile>
              <VCardText class="text-center py-4 m-auto" :style="{ height }">
                <VRow>
                  <VCol cols="12" class="text-center">
                    <img src="@/assets/images/svg/search.svg" alt="No se encontró la oferta de trabajo" width="200" />
                  </VCol>
                </VRow>
                <VRow>
                  <VCol cols="12" class="text-center">
                    <h3 class="text-h5">
                      Selecciona una oferta de trabajo para ver los detalles
                    </h3>
                    <p class="text-caption">
                      Si no encuentras la oferta que buscas, puedes aplicar filtros para encontrarla más fácilmente.
                    </p>
                  </VCol>
                </VRow>
              </VCardText>
            </VCard>
        </v-col>
      </v-row>

      
    </template>
  </JobOpportunitiesLayout>
</template>

<style lang="scss">
  @media (min-width: 701px) {
    .hidden-desktop {
      display: none !important;
    }
  }
</style>

<route lang="yaml">
meta:
  layout: blank
  action: read
  subject: Auth
</route>
