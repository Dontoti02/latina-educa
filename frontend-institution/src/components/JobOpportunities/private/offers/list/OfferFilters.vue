<script lang="ts" setup>
import { ref,watch } from 'vue';
import { useRouter } from 'vue-router';
import { VCard, VCol, VForm } from 'vuetify/lib/components/index.mjs';
import { DEFAULT_JOB_OFFER_FILTERS_FORM } from '../../../utils/joboffer.utils';
import { JobOfferFiltersResponse, JobOffersFiltersForm } from '../../../../../models/job-opportunities/job-offer';

const props = defineProps<{
  filters : JobOfferFiltersResponse
}>()
let debounceTimeout: ReturnType<typeof setTimeout> | null = null;
const router = useRouter()
const formRef = ref<InstanceType<typeof VForm> | null>(null)
const form = ref<Omit<JobOffersFiltersForm,'perPage'|'page'>>(DEFAULT_JOB_OFFER_FILTERS_FORM)
const emit = defineEmits<{
  (e: 'submit', form: Omit<JobOffersFiltersForm,'perPage'|'page'>): void
}>()

const clearFilters = () => {
  formRef.value?.reset()
}
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

const filterFields = [
  'orderBy',
  'dateFilter',
  'categoryId',
  'salary',
  'scheduleId',
  'locationId',
  'contractTypeId',
  'companyId',
] as const;

watch(
  () => filterFields.map(field => form.value[field]),
  onSubmit
);

</script>
<template>
  <VCard class="my-2" style="background-color: transparent; box-shadow: none;">
    <VForm
      ref="formRef"
      class="w-100"
      @submit.prevent="onSubmit"
    >
    <vRow style="justify-content: center;">
      <VCol
          cols="12"
          md="6"
          lg="8"
          class="d-flex gap-2"
        >
        <VTextField
          v-model="form.search"
          placeholder="Buscar convocatorias"
          clearable
          variant="solo"
          density="compact"
        />
      </VCol>
      <VCol
          cols="12"
          md="6"
          lg="2"
          class="d-flex gap-2"
        >
        <VBtn
          color="secondary"
          @click="clearFilters"
          class="w-100"
        >
          Limpiar filtros
        </VBtn>
      </VCol>
      <VCol
          cols="12"
          md="6"
          lg="2"
          class="d-flex gap-2"
        >
        <VBtn
          color="primary"
          @click="router.push({ name: 'bolsa-laboral-panel-offers-create' })"
          class="w-100"
        >Crear Oferta</VBtn>  
      </VCol>
    </vRow>
    <VRow class="pb-4" style="justify-content: center;">
        <VCol cols="12" md="3">
          <AppSelect
            v-model="form.orderBy"
            item-title="name"
            item-value="id"
            :items="props.filters.orderBy"
            variant="solo"
            class="w-100"
            placeholder="Ordenar"
          />
        </VCol>
        <VCol cols="12" md="3">
          <AppSelect
            v-model="form.dateFilter"
            item-title="name"
            item-value="id"
            :items="props.filters.dateFilters"
            variant="solo"
            class="w-100"
            placeholder="fecha"
          />
        </VCol>
        <VCol cols="12" md="3">
          <AppSelect
            v-model="form.categoryId"
            item-title="name"
            item-value="id"
            :items="props.filters.categories"
            variant="solo"
            class="w-100"
            placeholder="Categoría"
          />
        </VCol>
        <VCol cols="12" md="3">
          <AppSelect
            v-model="form.salary"
            item-title="name"
            item-value="id"
            :items="props.filters.salaryRanges"
            variant="solo"
            class="w-100"
            placeholder="Salario"
          />
        </VCol>
        <VCol cols="12" md="3">
          <AppSelect
            v-model="form.scheduleId"
            item-title="name"
            item-value="id"
            :items="props.filters.schedules"
            variant="solo"
            class="w-100"
            placeholder="Jornada"
          />
        </VCol>
        <VCol cols="12" md="3">
          <AppSelect
            v-model="form.locationId"
            item-title="name"
            item-value="id"
            :items="props.filters.locations"
            variant="solo"
            class="w-100"
            placeholder="Lugar de trabajo"
          />
        </VCol>
        <VCol cols="12" md="3">
          <AppSelect
            v-model="form.contractTypeId"
            item-title="name"
            item-value="id"
            :items="props.filters.contractTypes"
            variant="solo"
            class="w-100"
            placeholder="Contrato"
          />
        </VCol>
        <VCol cols="12" md="3" v-if="props.filters.isAdmin">
          <AppSelect
            v-model="form.companyId"
            item-title="name"
            item-value="id"
            :items="props.filters.companies"
            variant="solo"
            class="w-100"
            placeholder="Empresa"
          />
        </VCol>
      </VRow>
    </VForm>
  </VCard>
</template>
