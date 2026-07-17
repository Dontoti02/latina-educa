<script setup lang="ts">
import { FindJobOffer, JobOfferFiltersResponse} from '@/models/job-opportunities/job-offer'
import { JobOpportunitiesJobOfferService } from '@/services/job-opportutines/job-offer'
import { VSkeletonLoader } from 'vuetify/lib/labs/components.mjs'
import { DEFAULT_JOB_OFFER_LIST_FILTERS } from '../../../utils/joboffer.utils'
import OfferCreateForm from '@/components/JobOpportunities/private/offers/create/Form.vue';
import { JobOffersStateEnum } from '@/common/enum/job-offers-state.enum';

const loading = ref(false)
const filters = ref<JobOfferFiltersResponse>(DEFAULT_JOB_OFFER_LIST_FILTERS)
const item = ref<FindJobOffer| null>(null)
const canEdit = ref(true)

const fetchFilters = async () => {
  const { data } = await JobOpportunitiesJobOfferService.filters()
  filters.value = data
}

const props = defineProps<{
  slug?: string
}>()

const fethFindOffer = async () => {
  if (props.slug) {
    const { data } = await JobOpportunitiesJobOfferService.find('slug',props.slug)
    item.value = data
    canEdit.value = data.state.key !== JobOffersStateEnum.FINISHED
  }
}

const init = async () => {
  loading.value = true
  await Promise.all([fetchFilters(), fethFindOffer()])
  loading.value = false
}

watch(() => props.slug, () => init())

onMounted(() => init())


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
      <VRow class="pt-4">
        <VCol cols="12" class="d-flex gap-2">
          <VBtn variant="text" color="primary" @click="$router.back()">
            <VIcon left>mdi-arrow-left</VIcon>
            Volver
          </VBtn>
        </VCol>
      </VRow>
      <VRow v-if="props.slug && !canEdit">
        <VCol cols="12">
          <VAlert
            type="error"
            border="left"
            class="mb-4"
          >
            <template #title>
              No puedes editar la oferta
            </template>
            Esta oferta ya ha sido cerrada y no puede ser editada.
          </VAlert>
        </VCol>
      </VRow>
      <OfferCreateForm 
        :filters="filters" 
        :loading-params="loading"
        :item="item"
        v-if="canEdit"
      />
    </template>
  </div>
</template>
