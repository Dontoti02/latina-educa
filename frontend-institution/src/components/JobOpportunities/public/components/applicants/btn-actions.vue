<script setup lang="ts">
import { SessionStore } from '@/common/store';
import { modalConfirmation } from '@/common/util/modal.service';
import SharedCopyOfferModal from '@/components/JobOpportunities/private/offers/SharedCopyOfferModal.vue';
import { JobOfferDetailPublic } from '@/models/job-opportunities/public-job-offer';

const props = defineProps<{
  detail: JobOfferDetailPublic,
  center?: boolean,
}>();

const modalShared = ref(false);

const router = useRouter();
const session = SessionStore()

const gotoApplicants = () => {
  if (!session.isLoggedIn()) {
    modalConfirmation({
      title: 'Iniciar sesión',
      content: 'Para postularte a esta oferta de trabajo, debes iniciar sesión primero.',
    }).then((confirmed: boolean) => {
      if (confirmed) {
        router.push({ name: 'login', query: { to: '/bolsa-laboral-panel/me/'  + props.detail.slug } });
      }
    });
    return;
  }

  if (session.isStudent() || session.isTeacher()) {
    router.push({ path: `/bolsa-laboral-panel/me/${props.detail.slug}`, params: { slug: props.detail.slug } });
    return;
  }

  modalConfirmation({
    title: 'Acceso denegado',
    content: 'Solo los estudiantes y profesores pueden postularse a ofertas de trabajo.',
  });
};
</script>
<template>
  <div>
    <VCol cols="12" class="text-left d-flex align-center gap-2"
      :class="{
        'justify-start': !props.center,
        'justify-center': props.center
      }"
    >
      
      <VBtn color="primary" rounded="xl" size="large"
        @click="gotoApplicants()"
        :disabled="props.detail.alreadyPostulated"
      >
        {{ props.detail.alreadyPostulated ? 'Ya postulado' : 'Postularme' }}
      </VBtn>
      
      <VBtn color="primary" icon variant="outlined"
        @click="modalShared = true"
      >
        <v-icon>mdi-share-variant</v-icon>
      </VBtn>
    </VCol>

      <SharedCopyOfferModal
        v-if="modalShared"
        :modelValue="modalShared"
        :offer-slug="props.detail.slug"
        :offer-title="props.detail.title"
        @update:modelValue="modalShared = false"
      />
  </div>
</template>
