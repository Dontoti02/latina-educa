<script setup lang="ts">
import PageHeader from '@/common/components/PageHeader.vue';
import { modalConfirmation } from '@/common/util/modal.service';
import { toastError, toastSuccess } from '@/common/util/toast.service';
import { Company } from '@/models/job-opportunities/company';
import { JobOpportunitiesCompanyService } from '@/services/job-opportutines/company';
import { ImageUtils } from '@/utils/images';
import { VCardTitle, VCol } from 'vuetify/lib/components/index.mjs';
import { VSkeletonLoader } from 'vuetify/lib/labs/components.mjs';

const loaders = ref({
  list: false,
});

const companies = ref<Company[]>([]);

const search = ref<string>('');

const fetchCompanies = async () => {
  try {
    loaders.value.list = true;
    const {data } = await JobOpportunitiesCompanyService.getCompanies();
    companies.value = data;
  } catch (error) {
    console.error('Error fetching companies:', error);
  } finally {
    loaders.value.list = false;
  }
};

const memoryCompaniesFilter = computed(() => {
  if (!search.value) return companies.value;
  return companies.value.filter((company) =>
    company.name.toLowerCase().includes(search.value.toLowerCase())
  );
});

const verifyCompany = async (company: Company) => {
  const modalConfirm = await modalConfirmation({
    title: 'Verificar Empresa',
    content: `¿Estás seguro de que deseas verificar la empresa "${company.name}"?`
  });
  if (!modalConfirm) return;
  try {
    const {success,message} = await JobOpportunitiesCompanyService.verifyCompany(company.id);
    if (!success) {
      toastError(message)
      return;
    }
    toastSuccess(message);
    company.isVerified = true;
  } catch (error) {
    toastError(error as string);
  }
};
const unVerifyCompany = async (company: Company) => {
  const modalConfirm = await modalConfirmation({
    title: 'Desverificar Empresa',
    content: `¿Estás seguro de que deseas desverificar la empresa "${company.name}"?`
  });
  if (!modalConfirm) return;
  try {
    const {success,message} = await JobOpportunitiesCompanyService.unverifyCompany(company.id);
    if (!success) {
      toastError(message)
      return;
    }
    toastSuccess(message);
    company.isVerified = false;
  } catch (error) {
    toastError(error as string);
  }
};

const deleteCompany = async (company: Company) => {
  const modalConfirm = await modalConfirmation({
    title: 'Eliminar Empresa',
    content: `¿Estás seguro de que deseas eliminar la empresa "${company.name}"?`
  });
  if (!modalConfirm) return;
  try {
    const { success, message } = await JobOpportunitiesCompanyService.deleteCompany(company.id);
    if (!success) {
      toastError(message)
      return;
    }
    toastSuccess(message);
    companies.value = companies.value.filter((c) => c.id !== company.id);
  } catch (error) {
     toastError(error as string);
  }
};

onMounted(() => {
  fetchCompanies();
});
</script>
<template>
  <div>
    <PageHeader
      title="Bolsa Laboral - Empresas"
      description="Aquí podrás ver las empresas que están registradas en la bolsa laboral."
    />
    <VSkeletonLoader
      v-if="loaders.list"
      class="mb-4"
      width="100%"
      height="40px"
      type="list-item,list-item-three-line,list-item-avatar"
     ></VSkeletonLoader>
    <template v-else>
      
      <VCard elevation-0 class="mt-4">
        <VCardTitle class="text-h5 text-center">
          <VRow>
            <VCol cols="12" md="6" class="d-flex justify-start align-center">
              <span class="text-h5">
                Empresas Registradas <span class="text-caption text-secondary">({{ companies.length }})</span>
              </span>
            </VCol>
            <VCol cols="12" md="6" class="d-flex justify-end align-center">
              <!-- input search with icon -->
              <VTextField
                v-model="search"
                placeholder="Buscar empresa..."
                prepend-inner-icon="mdi-magnify"
                class="w-100"
                hide-details
                variant="outlined"
                density="compact"
                clearable
              ></VTextField>
            </VCol>
          </VRow>
        </VCardTitle>
        <VCardText>
          <VRow>
            <VCol cols="12" md="4" v-for="item in memoryCompaniesFilter" :key="item.id">
              <VCard class="pa-4" elevation="0">
                <VRow no-gutters>
                  <VCol cols="12" md="3" class="d-flex justify-center align-center">
                    <div style="position: relative; width: 80px; height: 80px;">
                      <VAvatar
                        size="80"
                        :image="item.logo ? ImageUtils.getUrlImage(item.logo) : undefined"
                        color="primary"
                        class="elevation-3"
                      >
                        <span class="text-h5 white--text">{{ item.name ? item.name.charAt(0).toUpperCase() : '?' }}</span>
                      </VAvatar>
                      <template v-if="item.isVerified">
                          <div style="background-color: white;position: absolute; top:0 ; right:0;z-index: 2;
border-radius: 50%; padding: 1px; ">
                            <VIcon size="24" color="primary"
                          >mdi-check-decagram-outline</VIcon>
                          </div>
                        </template>
                    </div>
                  </VCol>

                  <VCol cols="12" md="9" class="mx-0">
                    <VCardTitle class="text-h6 d-flex justify-space-between align-center px-2">
                      {{ item.name }}
                      <VMenu :location="'bottom'">
                        <template v-slot:activator="{ props }">
                          <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props"></v-btn>
                        </template>
                        <v-list>
                          <VListSubheader>Acciones</VListSubheader>
                          <VListItem @click="verifyCompany(item)" v-if="!item.isVerified">
                            <VListItemTitle >
                              <VIcon start color="primary">
                                mdi-check-decagram-outline
                              </VIcon>
                              Verificar
                            </VListItemTitle>
                          </VListItem>
                          <VListItem @click="unVerifyCompany(item)" v-else>
                            <VListItemTitle>
                              <VIcon start color="warning">
                                mdi-alert-decagram-outline
                              </VIcon>
                              Desverificar
                            </VListItemTitle>
                          </VListItem>

                          <VListItem @click="deleteCompany(item)">
                            <VListItemTitle>
                              <VIcon start color="error">
                                mdi-trash-outline
                              </VIcon>
                              Eliminar
                            </VListItemTitle>
                          </VListItem>
                        </v-list>
                      </VMenu>
                    </VCardTitle>

                    <VCardText class="py-2 px-2">
                      <div><strong>Email:</strong> {{ item.email }}</div>
                      <div><strong>RUC:</strong> {{ item.ruc }}</div>
                      <div><strong>Teléfono:</strong> {{ item.phone }}</div>
                      <div><strong>N° Ofertas:</strong> {{ item.totalOffers }}</div>
                      <VChip
                        :color="item.isVerified ? 'success' : 'warning'"
                        label
                      >
                        {{ item.isVerified ? 'Verificado' : 'No verificado' }}
                      </VChip>
                    </VCardText>
                  </VCol>
                </VRow>
              </VCard>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </template>
  </div>
</template>
<route lang="yaml">
meta:
  action: read
  subject: Companies
</route>
