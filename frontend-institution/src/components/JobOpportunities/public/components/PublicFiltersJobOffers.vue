<script lang="ts" setup>
import { JobOffersFiltersForm } from '@/models/job-opportunities/job-offer';
import { ref,watch } from 'vue';
import { VCard, VCol, VForm } from 'vuetify/lib/components/index.mjs';
import { DEFAULT_JOB_OFFER_FILTERS_FORM } from '../../utils/joboffer.utils';
import { JobOfferFiltersPublic } from '@/models/job-opportunities/public-job-offer';
import emitter from '@/common/util/emitter.service';

const props = defineProps<{
  filters : JobOfferFiltersPublic
}>()
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
const formRef = ref<InstanceType<typeof VForm> | null>(null)
const form = ref<Omit<JobOffersFiltersForm,'perPage'|'page'>>(DEFAULT_JOB_OFFER_FILTERS_FORM)
const emit = defineEmits<{
  (e: 'submit', form: Omit<JobOffersFiltersForm,'perPage'|'page'>): void
}>()

const onSubmit = async () => {
  emit('submit', {
    ...form.value,
  });
}
watch(
  () => form.value.search,
  () => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(onSubmit, 500);
  }
);

const watchQuerySearch = () => {
  const search = new URLSearchParams(window.location.search).get('search');
  if (search) {
    form.value.search = search;
  }
}

const filterFields = [
  'orderBy',
  'dateFilter',
  'categoryId',
  'salary',
  'scheduleId',
  'locationId',
  'contractTypeId',
] as const;

watch(
  () => filterFields.map(field => form.value[field]),
  onSubmit
);

onMounted(() => {
  emitter.on('searchJobOffers', (event: unknown) => {
    form.value.search = event as string
  })
  watchQuerySearch()
})

onUnmounted(() => {
  emitter.off('searchJobOffers', (event: unknown) => {
    form.value.search = event as string
  })
})

</script>
<template>
  <VCard class="my-2" style="background-color: transparent; box-shadow: none;">
    <VForm
      ref="formRef"
      class="w-100"
      @submit.prevent="onSubmit"
    >
    <VRow class="pb-4 filters-row" >
        <VCol cols="auto" style="min-width: 180px;">
          <AppSelect
            v-model="form.orderBy"
            item-title="name"
            item-value="id"
            :items="props.filters.orderBy"
            variant="solo"
            placeholder="Ordenar"
            rounded
            chips
            single-line
            hide-details
            clearable
            density="compact"
          />
        </VCol>
        <VCol cols="auto" style="min-width: 180px;">
          <AppSelect
            v-model="form.dateFilter"
            item-title="name"
            item-value="id"
            :items="props.filters.dateFilters"
            variant="solo"
            class="w-100"
            placeholder="fecha"
            rounded
            chips
            single-line
            hide-details
            clearable
            density="compact"
          />
        </VCol>
        <VCol cols="auto" style="min-width: 180px;">
          <AppSelect
            v-model="form.categoryId"
            item-title="name"
            item-value="id"
            :items="props.filters.categories"
            variant="solo"
            class="w-100"
            placeholder="Categoría"
            rounded
            chips
            single-line
            hide-details
            clearable
            density="compact"
          />
        </VCol>
        <VCol cols="auto" style="min-width: 180px;">
          <AppSelect
            v-model="form.salary"
            item-title="name"
            item-value="id"
            :items="props.filters.salaryRanges"
            variant="solo"
            class="w-100"
            placeholder="Salario"
            rounded
            chips
            single-line
            hide-details
            clearable
            density="compact"
          />
        </VCol>
        <VCol cols="auto" style="min-width: 180px;">
          <AppSelect
            v-model="form.scheduleId"
            item-title="name"
            item-value="id"
            :items="props.filters.schedules"
            variant="solo"
            class="w-100"
            placeholder="Jornada"
            rounded
            chips
            single-line
            hide-details
            clearable
            density="compact"
          />
        </VCol>
        <VCol cols="auto" style="min-width: 180px;">
          <AppSelect
            v-model="form.locationId"
            item-title="name"
            item-value="id"
            :items="props.filters.locations"
            variant="solo"
            class="w-100"
            placeholder="Lugar de trabajo"
            rounded
            chips
            single-line
            hide-details
            clearable
            density="compact"
          />
        </VCol>
        <VCol cols="auto" style="min-width: 180px;">
          <AppSelect
            v-model="form.contractTypeId"
            item-title="name"
            item-value="id"
            :items="props.filters.contractTypes"
            variant="solo"
            class="w-100"
            placeholder="Contrato"
            rounded
            chips
            single-line
            hide-details
            clearable
            density="compact"
          />
        </VCol>
      </VRow>
    </VForm>
  </VCard>
</template>
<style scoped>
.filters-row {
  display: flex;
  flex-wrap: nowrap;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  gap: 16px; 
  padding-inline: 16px;
}

.filters-row::-webkit-scrollbar {
  display: none;
}
</style>
