<script setup lang="ts">
import JobSearchAutocomplete from '@/components/JobOpportunities/public/components/JobSearchAutocomplete.vue';
import JobOpportunitiesLayout from '@/components/JobOpportunities/public/Layout.vue'
import { Company } from '@/models/job-opportunities/company';
import { JobOpportunitiesCompanyService } from '@/services/job-opportutines/company';
import { VDivider } from 'vuetify/lib/components/index.mjs';
import emitter from '@/common/util/emitter.service';
import LogoCompany from '@/components/JobOpportunities/public/company/logo-company.vue';
const companies = ref<Array<Company>>([])
const router = useRouter();
const fetchCompanies = async () => {
  const { data } = await JobOpportunitiesCompanyService.getCompanies()
  companies.value = data
}

const gotoOfferList = (search:string) => {
  if (!search) {
    return
  }
  router.push({
    path: '/bolsa-laboral/empleos',
    query: {
      search,
    }
  })
}

onMounted(async () => {
  emitter.on('searchJobOffers',(event:unknown) => gotoOfferList(event as string))
  await fetchCompanies()
})

onUnmounted(() => {
  emitter.off('searchJobOffers',(event:unknown) => gotoOfferList(event as string))
})

</script>
<template>
  <JobOpportunitiesLayout>
    <template #content>
      <v-container fluid class="pt-6">
        <v-row justify="center" class="mb-6" style="position: relative;">
          <v-col cols="12" md="12">
            <v-card class="elevation-1 pa-0 text-center" elevation="0">
              <v-img
                src="https://images.unsplash.com/photo-1519389950473-47ba0277781c"
                alt="Banner"
                height="400"
                cover
                class="mb-4 rounded"
              />
              <div class="text-h5 font-weight-medium">Encuentra tu próximo trabajo soñado</div>
              <div class="text-subtitle-1 mt-2">Busca entre cientos de empresas y oportunidades laborales</div>
              <v-row justify="center" class="mb-8 search-bar">
                <v-col cols="12" md="10">
                  <JobSearchAutocomplete />
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
        
        <v-row class="text-center" v-if="companies.length > 0">
          <VDivider />
          <v-col cols="12" class="text-center" md="12">
            <div class="text-h5 font-weight-medium">Empresas</div>
          </v-col>
          <v-col
            v-for="company in companies"
            :key="company.id"
            cols="12"
            sm="6"
            md="3"
          >
            <v-card class="pa-4" elevation="2">
              <v-row no-gutters align="center">
                <v-col cols="3">
                  <LogoCompany
                    :logo="company.logo"
                    :name="company.name"
                    :is-verified="company.isVerified"
                  />
                </v-col>
                <v-col cols="9">
                  <div class="font-weight-medium text-primary text-subtitle-1">{{ company.name }}</div>
                  <div class="text-caption text-grey-darken-1">{{ company.address }}</div>
                </v-col>
              </v-row>
            </v-card>
          </v-col>
        </v-row>
      </v-row>
      </v-container>
    </template>
  </JobOpportunitiesLayout>
</template>

<style lang="scss">
  .search-bar {
    position: absolute;
    z-index: 1;
    top: 50%;
    width: 100%;
    display: flex;
    text-align: center;
    margin: 0 auto;
  }
</style>

<route lang="yaml">
meta:
  layout: blank
  action: read
  subject: Auth
</route>
