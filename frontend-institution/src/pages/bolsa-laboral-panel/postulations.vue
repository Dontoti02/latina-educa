<script setup lang="ts">
import PageHeader from '@/common/components/PageHeader.vue';
import emitter from '@/common/util/emitter.service';
import { modalConfirmation } from '@/common/util/modal.service';
import { toastError, toastSuccess } from '@/common/util/toast.service';
import { HeaderProp } from '@/components/common/Table.vue';
import { Applicant, ApplicationsByOffer, ApplicationStateEnum, FiltersAplications } from '@/models/job-opportunities/applicant';
import { JobOpportunitiesApplicantService } from '@/services/job-opportutines/applicants.service';
import { ImageUtils } from '@/utils/images';
import { SessionStore } from "@/common/store";
import { VCardSubtitle, VCol } from 'vuetify/lib/components/index.mjs';
import { VSkeletonLoader } from 'vuetify/lib/labs/components.mjs';
import { RolEnum } from '@/common/enum/rol.enum';
const route = useRoute();

const filters = ref<FiltersAplications>({
  permission: {
    state: false,
    message: 'No tienes permiso para ver las postulaciones a ofertas de trabajo.'
  },
  filters: {
    companies: [],
    offers: []
  }
});

const result = ref<ApplicationsByOffer>({
  applicants : [],
  offer : {
    id : 0,
    title : '',
    slug : ''
  }
});

const formFilters = ref<{
  companyId : number | null;
  offerId: number | null;
}>({
  companyId: null,
  offerId: null,
})

const loaders = ref({
  filters: false,
  postulations: false,
  table: false
});

const feedback = ref<string | null>(null);

const headers = ref<HeaderProp[]>([
  { title: '', key: 'status', fixed:true, align: 'center' },
  { title: 'POSTULANTE', key: 'fullname', fixed:true, align:'left' },
  { title: 'FECHA POSTULACION', key: 'appliedAt', nowrap:true, align: 'right'},
  { title: 'EMAIL', key: 'email',nowrap : true,align: 'center' },
  { title: 'TELEFONO', key: 'phone', nowrap : true,align: 'center' },
  { title: 'CV', key: 'cvUrl',nowrap : true, align: 'center' },
  { title: '', key: 'actions',fixed:true, align: 'center' },
])

const fetchFilters = async () => {
  try {
    loaders.value.filters = true;
    const {data} = await JobOpportunitiesApplicantService.byOfferFilters({
      companyId: formFilters.value.companyId,
      offerId: formFilters.value.offerId
    });
    filters.value = data;
    if (hasRoleCompany.value) {
      formFilters.value.companyId = filters.value.filters.companies.length > 0 ?  filters.value.filters.companies[0].id : null;
    }
  } catch (error) {
    throw error;
  } finally {
    loaders.value.filters = false;
  }
};

const onChangeCompany = async () => {
  if (!filtersOffers.value.some(item => item.id === formFilters.value.offerId)) {
     formFilters.value.offerId = null;
  }
  ; 
};

const filtersOffers = computed(() => {
  return filters.value.filters.offers.filter(o => o.companyId === formFilters.value.companyId);
});

const fetchPostulations = async () => {
  const { companyId, offerId } = formFilters.value;
  if (!offerId) {
    return
  }
  try {
    loaders.value.postulations = true;
    const {data} = await JobOpportunitiesApplicantService.byOffer({
      companyId,
      offerId
    });
    result.value = data;
  } catch (error) {
    console.error('Error fetching postulations:', error);
    throw error;
  } finally {
    loaders.value.postulations = false;
  }
};

watch(() => formFilters.value, async () => {
  if (formFilters.value.offerId && formFilters.value.companyId) {
    await fetchPostulations();
  }
}, { deep: true });

 const sessionStore = SessionStore();

const dictionaryState = {
  [ApplicationStateEnum.POSTULATED]: 'Pendiente',
  [ApplicationStateEnum.ACCEPTED]: 'Aprobado',
  [ApplicationStateEnum.REJECTED]: 'Rechazado'
};

const hasRoleCompany = computed(() => {
  return sessionStore.roles.some(role => role.id === RolEnum.COMPANY_ID);
});

const setStateApplicant = async (item: Applicant, state:ApplicationStateEnum) => {
  const confirm = await  modalConfirmation({
    title: `Cambiar estado de la postulación`,
    content: `¿Estás seguro de que deseas cambiar el estado de la postulación de ${item.fullname} a ${dictionaryState[state]}?`,
    input: {
      required: false,
      label: 'Feedback (opcional)',
      type: 'text',
    },
    config : {
      width: 800
    }
  })
  if (!confirm) return;
  
  try {
    loaders.value.table = true;
   const {success, message } =  await JobOpportunitiesApplicantService.setState({
      applicantId: item.id,
      state,
      feedback : feedback.value
    });
    console.log({success, message});
    if(!success) {
      toastError(message);
      return;
    }
    feedback.value = null;
    toastSuccess(`El estado de la postulación de ${item.fullname} ha sido cambiado.`);
    await fetchPostulations();
  } catch (error) {
    toastError(error as string);
    throw error;
  } finally {
    loaders.value.table = false;
  }
};

onMounted(async () => {
  const query = route.query;
  formFilters.value = {
    companyId: query.companyId ? parseInt(query.companyId as string) : null,
    offerId: query.offerId ? parseInt(query.offerId as string) : null
  };
  await fetchFilters();
  emitter.on('modalInput', async ({value}) => {
    if (value) {
      feedback.value = value;
    }
  });
});
onUnmounted(() => {
  emitter.off('modalInput');
});

</script>
<template>
  <div>
    <PageHeader 
      title="Postulaciones a ofertas de trabajo"
      description="Aquí puedes ver las postulaciones a las ofertas de trabajo."
    />
    <!-- section filters -->
     <VSkeletonLoader
      v-if="loaders.filters"
      class="mb-4"
      width="100%"
      height="40px"
      type="list-item,list-item-three-line"
     ></VSkeletonLoader>
     <template v-else>
        <VCard v-if="!filters.permission.state">
          <VCardText class="text-center">
            {{ filters.permission.message }}
          </VCardText>
        </VCard>
        <VCard class="my-2" v-else>
          <VCardText>
            <VForm
              ref="formRef"
              class="w-100"
            >
              <VRow class="pb-4" style="justify-content: end;">
                <VCol cols="12" md="4">
                  <VBtn
                    variant="text"
                    color="primary"
                    @click="$router.go(-1)"
                    class="mb-2"
                    prepend-icon="mdi-arrow-left"
                  >
                    Volver
                  </VBtn>
                  <p>
                    Total de postulaciones:
                    <strong>{{ result.applicants.length }}</strong>
                  </p>
                </VCol>
                <VCol cols="12" md="4">
                  <AppSelect
                    v-model="formFilters.companyId"
                    item-title="name"
                    item-value="id"
                    :items="filters.filters.companies"
                    variant="solo"
                    class="w-100"
                    label="Empresa"
                    placeholder="Seleccionar empresa"
                    clearable
                    :disabled="hasRoleCompany"
                    @update:modelValue="onChangeCompany()"
                  />
                </VCol>
                <VCol cols="12" md="4">
                  <AppSelect
                    v-model="formFilters.offerId"
                    item-title="title"
                    item-value="id"
                    :items="filtersOffers"
                    variant="solo"
                    class="w-100"
                    label="Oferta"
                    clearable
                    placeholder="Seleccionar oferta"
                  />
                </VCol>
              </VRow>
            </VForm>
            <VRow>
              <VCol cols="12"  v-if="loaders.postulations">
                <VSkeletonLoader
                  class="mb-4"
                  width="100%"
                  height="40px"
                  type="list-item,list-item-three-line"
                ></VSkeletonLoader>
              </VCol>
              <VCol cols="12" v-else-if="!formFilters.offerId || !formFilters.companyId">
                <VCard class="w-100" elevation="0" outlined>
                  <VCardTitle>
                    Selecciona una oferta para ver las postulaciones
                  </VCardTitle>
                  <VCardSubtitle>
                    Para ver las postulaciones a una oferta de trabajo, primero debes seleccionar una empresa y luego una oferta de trabajo.
                  </VCardSubtitle>
                </VCard>
              </VCol>
              <VCol cols="12" v-if="result.applicants.length > 0 && formFilters.offerId && formFilters.companyId">
                <VCard class="p-0 m-0">
                  <VRow>
                    <Table
                      style="max-width: 100%;"
                      :config="{
                        index:false,
                        loading: false,
                        styles: {
                          headerColor: 'primary'
                        },
                        pagination: {
                          peerPage:10,
                          totalItems : result.applicants.length,
                        }
                      }"
                      :header="headers"
                      :items="result.applicants"
                  >
                    <template #status="{ item }">
                      <VTooltip text="Aprobado" v-if="item.status === ApplicationStateEnum.ACCEPTED">
                        <template #activator="{ props }">
                          <VIcon
                            v-bind="props"
                            color="success"
                            :size="20"
                          >
                            mdi-check-circle-outline
                          </VIcon>
                        </template>
                      </VTooltip>
                      <VTooltip text="Rechazado" v-else-if="item.status ===  ApplicationStateEnum.REJECTED">
                        <template #activator="{ props }">
                          <VIcon
                          v-bind="props"
                          color="error"
                          :size="20"
                          >
                          mdi-close-circle-outline
                          </VIcon>
                        </template>
                      </VTooltip>
                      <VTooltip text="Pendiente" v-else>
                        <template #activator="{ props }">
                          <VIcon
                          v-bind="props"
                          color="warning"
                          :size="20"
                          >
                          mdi-account-clock-outline
                          </VIcon>
                        </template>
                      </VTooltip>
                    </template>
                    <template #fullname="{ item }">
                      <span v-if="item.message && item.message !== ''">
                        <VTooltip :text="item.message">
                          <template #activator="{ props }">
                            <span v-bind="props">{{ item.fullname }}</span>
                          </template>
                        </VTooltip>
                      </span>
                      <span v-else>
                        {{ item.fullname }}
                      </span>
                    </template>
                    <template #cvUrl="{ item }">
                      <VBtn
                        v-if="item.cvUrl"
                        :href="ImageUtils.getUrlImage(item.cvUrl)"
                        target="_blank"
                        variant="text"
                        icon
                      >
                        <VIcon size="25">mdi-file-pdf</VIcon>
                      </VBtn>
                      <span v-else>No disponible</span>
                    </template>
                    <template #actions="{item}" >
                      <VMenu :location="'bottom'"  v-if="item.status === ApplicationStateEnum.POSTULATED">
                        <template v-slot:activator="{ props }">
                          <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props"></v-btn>
                        </template>
                        <v-list>
                          <VListSubheader>Acciones</VListSubheader>
                          <VListItem @click="() => setStateApplicant(item, ApplicationStateEnum.ACCEPTED)">
                            <VListItemTitle>
                              <VIcon start color="success">
                                mdi-check-circle-outline
                              </VIcon>
                              Aprobar
                            </VListItemTitle>
                          </VListItem>

                          <VListItem @click="() => setStateApplicant(item, ApplicationStateEnum.REJECTED)">
                            <VListItemTitle>
                              <VIcon start color="error">
                                mdi-close-circle-outline
                              </VIcon>
                              Rechazar
                            </VListItemTitle>
                          </VListItem>
                        </v-list>
                      </VMenu>
                    </template>
                  </Table>
                  </VRow>
                </VCard>
              </VCol>
              <VCol cols="12" v-else-if="result.applicants.length === 0 && formFilters.offerId && formFilters.companyId">
                <VCard class="w-100" elevation="0" outlined>
                  <VCardTitle>
                    No hay postulaciones
                  </VCardTitle>
                  <VCardSubtitle>
                    No hay postulaciones para esta oferta de trabajo.
                  </VCardSubtitle>
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
  subject: Applications
</route>
