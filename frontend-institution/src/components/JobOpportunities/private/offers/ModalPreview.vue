<script setup lang="ts">
import { JobOfferDetailPublic } from '@/models/job-opportunities/public-job-offer';
import { JobOpportunitiesJobOfferService } from '@/services/job-opportutines/job-offer';
import LogoCompany from '@/components/JobOpportunities/public/company/logo-company.vue';
import { VSkeletonLoader } from 'vuetify/lib/labs/components.mjs';
import { VCol } from 'vuetify/lib/components/index.mjs';
import ModalBasic from "@/common/components/Modal.vue";
const props = defineProps<{
  slug: string;
   show: boolean;
}>();

const loading = ref<boolean>(false);
const detail = ref<JobOfferDetailPublic | null>(null);

const viewportHeight = ref(window.innerHeight);
const emmit = defineEmits<{
  (e: "close"): void;
}>();

const fetchDetail = async () => {
  try {
    loading.value = true;
    const { data } = await JobOpportunitiesJobOfferService.publicDetail(props.slug);
    detail.value = data;
  } catch (error) {
    detail.value = null;
  } finally {
    loading.value = false;
  }
};

const updateHeight = () => {
  viewportHeight.value = window.innerHeight;
};

onMounted(() => {
  window.addEventListener('resize', updateHeight);
});

const height = computed(() => `calc(${viewportHeight.value}px - 23rem)`);

watch(() => props.slug, async () => {
  if (props.slug) {
    await fetchDetail();
  }
}, { immediate: true });
</script>
<template>
  <ModalBasic :visible="props.show" is-persistent width="1000" is-scrollable>
    <template v-if="loading">
      <VRow class="text-center py-4">
        <VCol cols="12">
          <!-- VSkeleton -->
          <VSkeletonLoader
            class="w-100"
            type="list-item-three-line,list-item-three-line,list-item-three-line,list-item-three-line" 
            :loading="loading"
            :height="height"
            :rounded="8"
            :width="400"
            :loading-text="'Cargando oferta de trabajo...'"
          />
        </VCol>
      </VRow>
    </template>
    <template v-else>
      <VCard v-if="detail">
        <VToolbar>
          <div class="mx-5 mt-5"></div>
          <VSpacer />
          <VBtn icon @click="emmit('close')">
            <VIcon>mdi-close</VIcon>
          </VBtn>
        </VToolbar>
        <VCardTitle class="py-4"  style="white-space: normal;">
          <VRow>
            <VCol cols="12" md="9">
              <h2>
                {{ detail.title }}
              </h2>
              <a v-if="detail.company.website" :href="detail.company.website" target="_blank" class="text-decoration-none">
                <h3 class="text-h6 text-subtitle-1 py-2">
                  {{ detail.company.name }}
                </h3>
              </a>
              <h3 v-else class="py-2 text-primary">{{ detail.company.name }}</h3>
              
              <p class="text-caption my-0 py-0">{{ detail.company.address }}</p>
            </VCol>
            <VCol cols="12" md="3" class="text-center">
              <LogoCompany
                :logo="detail.company.logo"
                :name="detail.company.name"
              />
            </VCol>
          </VRow>
        </VCardTitle>
        <VDivider />
        <VCardText :style="{ height }" class="card-offer-body-detail">
          <ul class="detail-ul pb-4">
            <li>
              <VIcon>
                mdi-cash
              </VIcon>{{ detail.salaryCurrency === 'SOL' ? 'S/' : detail.salaryCurrency }} &nbsp;{{ detail.salary }} 
            </li>
            <li>
              <VIcon>
                mdi-briefcase-outline
              </VIcon>
              {{ detail.scheduleName }}
            </li>
            <li>
              <VIcon>
                mdi-calendar-outline
              </VIcon>
              {{ detail.contractTypeName }}
            </li>
            <li>
              <VIcon>
                mdi-map-marker-outline
              </VIcon>
              {{ detail.locationName }}
            </li>
          </ul>
          <template v-if="detail.description">
            <VDivider />
            <div class="py-4">
              <h3 class="text-h5 pb-2">Descripción:</h3>
              <p v-html="detail.description"></p>
            </div>
          </template>
          <template v-if="detail.requirements">
            <VDivider />
            <div class="py-4">
              <h3 class="text-h5 pb-2">Requisitos:</h3>
              <p v-html="detail.requirements"></p>
            </div>
          </template>
          <template v-if="detail.benefits">
            <VDivider />
            <div class="py-4 ">
              <h3 class="text-h5 pb-2">Beneficios:</h3>
              <p v-html="detail.benefits"></p>
            </div>
          </template>
          <VRow>
            <VCol cols="12" class="text-center">
              <p class="text-caption text-secondary">
                Publicado el {{ new Date(detail.publicationDate).toLocaleDateString() }}
              </p>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
      <VCard v-else>
        <VCardTtile >
          <VRow class="pt-4">
            <VCol cols="12" class="text-center">
              <VIcon size="48" color="error">
                mdi-alert-circle-outline
              </VIcon>
            </VCol>
          </VRow>
        </VCardTtile>
        <VCardText class="text-center py-4 m-auto" :style="{ height }">
          <VRow>
            <VCol cols="12" class="text-center">
              <img src="@/assets/images/svg/empty_file_search.svg" alt="No se encontró la oferta de trabajo" width="200" />
            </VCol>
          </VRow>
          <VRow>
            <VCol cols="12" class="text-center">
              <h3 class="text-h5">No se encontró la oferta de trabajo</h3>
              <p class="text-caption">Intente nuevamente más tarde o contacte al administrador del sistema.</p>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </template>
  </ModalBasic>
  
</template>
<style>
.detail-ul {
  list-style: none;
}
.detail-ul li {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}
.card-offer-body-detail {
  overflow-y: auto;
}
</style>
