<script lang="ts" setup>
import PageHeader from '@/common/components/PageHeader.vue';
import { toastError } from '@/common/util/toast.service';
import { CheckApplicantResponse } from '@/models/job-opportunities/job-offer';
import { JobOpportunitiesJobOfferService } from '@/services/job-opportutines/job-offer';
import { VCardActions, VCardText, VCol, VContainer, VForm, VRow } from 'vuetify/lib/components/index.mjs';
import { VSkeletonLoader } from 'vuetify/lib/labs/components.mjs';
import CvUpload from '@/components/JobOpportunities/private/me/cv/upload.vue';
import emitter from '@/common/util/emitter.service';
import { modalConfirmation } from '@/common/util/modal.service';

const route = useRoute();
const loading = ref(false);
const loadingForm = ref(false);
const result = ref<CheckApplicantResponse|null>(null);
const formRef = ref<InstanceType<typeof VForm> | null>(null)

const form = ref<{
  fullname: string;
  cvId: number | null;
  message: string | null;
  offerId: number | null;
}>({
  fullname: '',
  cvId: null,
  offerId: null,
  message: ''
});

const checkApplication = async () => {
  try {
    loading.value = true
    const { success,message, data } = await JobOpportunitiesJobOfferService.checkApplicant(route.params.slug as string);
    if (!success) {
      toastError(message)
      return
    }
    result.value = data
    form.value = {
      fullname: data.applicantName,
      cvId: data.cvs.length > 0 ? data.cvs[0].id : null,
      message: null,
      offerId: data.offerId
    }
  } catch(error) {
    toastError('Error al verificar la postulación: ' + (error as Error).message);
  } finally {
    loading.value = false;
  }
}

const applyToOffer = async () => {
  if (!form.value.fullname || !form.value.cvId) {
    toastError('Por favor, completa todos los campos requeridos.');
    return;
  }
  try {
    loading.value = true;
    const { success, message,data } = await JobOpportunitiesJobOfferService.applyToOffer({
      fullname: form.value.fullname,
      cvId: form.value.cvId,
      message: form.value.message || '',
      offerId: form.value.offerId!
    });
    if (!success) {
      toastError(message);
      return;
    }
    result.value = data;
    modalConfirmation({
      title: 'Postulación exitosa',
      content: 'Tu postulación ha sido enviada correctamente. Revisa tu correo electrónico para más detalles.',
    })
    formRef.value?.reset();
  } catch (error) {
    toastError('Error al enviar la postulación: ' + (error as Error).message);
  } finally {
    loading.value = false;
  }
};

const onAddCV = (cvItem: {
  id: number;
  version: string;
  url: string;
}) => {
  if (!result.value) return;
  result.value.cvs.unshift({
    id: cvItem.id,
    version: cvItem.version,
    url: cvItem.url
  });
  form.value.cvId = cvItem.id;
};

onMounted(async () => {
  await checkApplication();
  emitter.on('uploadCV', (event) => onAddCV(event as { id: number; version: string; url: string; }));
});
onUnmounted(() => {
  emitter.off('uploadCV',(event) => onAddCV(event as { id: number; version: string; url: string; }));
});

</script>
<template>
  <VContainer>
    <PageHeader
      title="Postulación a oferta de trabajo"
      description="Aquí puedes postularte a una oferta de trabajo."
      :back-button="{ path: '/bolsa-laboral/empleos' }"
    />
    <VSkeletonLoader
      v-if="loading"
      class="mt-4"
      type="list-item,list-item-three-line,list-item-three-line,list-item-three-line,list-item-three-line,list-item-three-line,list-item-three-line" 
      :loading-text="'Cargando filtros de ofertas de trabajo...'"
      :height="500"
      :rounded="8"
    />
    <template v-else-if="result">
      <VCard>
      <VForm ref="formRef" @submit.prevent="applyToOffer" class="pa-4">
        <template v-if="!result.isActive">
          <VCardTitle>
            <h1 class="text-h4 text-primary">
              Esta oferta de trabajo ya no está activa.
            </h1>
          </VCardTitle>
          <VCardText>
            <p>La oferta de trabajo con nombre:</p>
            <p class="text-h6">{{ result.offerTitle }}</p>
            <p>Por favor, verifica si la oferta ha sido cerrada o si la url es correcto.</p>
          </VCardText>
        </template>
        <template v-else-if="result.hasApplied">
          <VCardTitle>
            <h1 class="text-h4 text-primary">
              Ya has postulado a esta oferta de trabajo.
            </h1>
          </VCardTitle>
          <VCardText>
            <p>La oferta de trabajo con nombre:</p>
            <p class="text-h6">{{ result.offerTitle }}</p>
            <p>Tu postulación ha sido registrada correctamente.</p>
            <p>Por favor, revisa tu correo electrónico para más detalles.</p>
          </VCardText>
        </template>
        <template v-else>
        
            <VCol cols="12">
              <h1 class="text-h4">Formulario de postulación</h1>
              <p class="text-h6 py-4 mb-0 pb-0">
                <strong>
                  {{ result.offerTitle }}
                </strong>
              </p>
            </VCol>
            <VCol cols="12">
              <p>Por favor, completa el siguiente formulario para postularte a esta oferta de trabajo.</p>
              <VRow>
                <VCol cols="12" md="12">
                  <VTextField
                    label="Nombre"
                    v-model="form.fullname"
                    required
                    readonly
                  />
                </VCol>
                <VCol cols="12" md="12">
                  <VTextField
                    label="Título de la postulación"
                    :model-value="result.offerTitle"
                    readonly
                  />
                </VCol>
                <VCol cols="12" md="12">
                  <VSelect
                    label="Selecciona tu CV"
                    :items="result.cvs"
                    v-model="form.cvId"
                    :append-inner-icon="CvUpload"
                    item-title="version"
                    item-value="id"
                    required
                  />
                </VCol>
                <VCol cols="12">
                  <VTextarea
                    label="Comentarios o mensaje (opcional)"
                    v-model="form.message"
                    rows="3"
                    auto-grow
                  />
                </VCol>
              </VRow>
            </VCol>
          
        </template>
        <VDivider />
        <VCardActions class="my-2">
          <VBtn color="secondary" @click="$router.push({path : '/bolsa-laboral/empleos' })"
            type="button"
          >
            <VIcon>
              mdi-arrow-left
            </VIcon> Ir a ofertas
          </VBtn>
          <VBtn color="primary"
            v-if="!result.hasApplied && result.isActive"
            :disabled="!form.fullname || !form.cvId"
            class="ml-auto"
            rounded="xl"
            size="large"
            :loading="loadingForm"
            variant="tonal"
            @click="applyToOffer"
            type="submit"
          >
            Postularme
          </VBtn>
        </VCardActions>
        </VForm>
      </VCard>
    </template>
  </VContainer>
</template>
<route lang="yaml">
meta:
  action: read
  subject: Candidate
</route>
