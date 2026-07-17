<script setup lang="ts">
import OfferFilters from './OfferFilters.vue'
import { JobOfferFiltersResponse, JobOfferListResponse, JobOffersFiltersForm } from '@/models/job-opportunities/job-offer'
import { JobOpportunitiesJobOfferService } from '@/services/job-opportutines/job-offer'
import { VSkeletonLoader } from 'vuetify/lib/labs/components.mjs'
import OfferTable from './OfferTable.vue'
import { DEFAULT_JOB_OFFER_FILTERS_FORM, DEFAULT_JOB_OFFER_LIST_FILTERS } from '../../../utils/joboffer.utils'
import { GlobalPagination } from '@/models/global'

const loading = ref(false)
const filtersList = ref<JobOfferFiltersResponse>(DEFAULT_JOB_OFFER_LIST_FILTERS)
const pagination = ref<GlobalPagination>({
  totalItems: 0,
  currentPage: DEFAULT_JOB_OFFER_FILTERS_FORM.page,
  itemsPerPage: DEFAULT_JOB_OFFER_FILTERS_FORM.perPage,
})
const filtersForm = ref<JobOffersFiltersForm>(DEFAULT_JOB_OFFER_FILTERS_FORM)
const items = ref<JobOfferListResponse>([])

const fetchOffers = async () => {
  const { data } = await JobOpportunitiesJobOfferService.list(filtersForm.value)
  items.value = data.items
  pagination.value = data.pagination
}

const fetchFilters = async () => {
  const { data } = await JobOpportunitiesJobOfferService.filters()
  filtersList.value = data
}

const fetchOffersForFilters = async (form: Omit<JobOffersFiltersForm, 'perPage' | 'page'>) => {
  console.log('fetchOffersForFilters', form)
  filtersForm.value = {
    ...filtersForm.value,
    ...form,
  }
  await fetchOffers()
}

const setPagination = (page: number) => {
  filtersForm.value.page = page
  fetchOffers()
}
onMounted(async () => {
  loading.value = true
  await Promise.all([fetchFilters(), fetchOffers()])
  loading.value = false
})

</script>

<template>
  <div>
    <div v-if="loading">
      <VRow>
        <VCol cols="12">
          <VSkeletonLoader type="table" />
        </VCol>
      </VRow>
    </div>
    <template v-else>
      <OfferFilters 
        :filters="filtersList" 
        @submit="fetchOffersForFilters"
      />
      <OfferTable 
        :results="items"
        :pagination="pagination"
        :isAdmin="filtersList.isAdmin"
        @reload="fetchOffers"
        @setPage="setPagination"
      />
    </template>
  </div>
</template>
