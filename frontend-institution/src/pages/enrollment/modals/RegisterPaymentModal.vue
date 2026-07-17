<script setup lang="ts">
import { watch } from 'vue';
import ModalBasic from '@/common/components/Modal.vue';
import { SessionStore } from '@/common/store';
import { treasuryService } from '@/services/treasury.service';

// Initial
const props = 
  defineProps<{
    show: boolean,
    enrollmentId: number
  }>();

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'register'): void
}>()
const userId=SessionStore().get().user!.id;
const movementVoucher = ref<File | null>(null)

const confirmRegister = () => {
  treasuryService.payEnrollment({
    'userId': userId,
    'movementVoucher': movementVoucher.value,
    'type': 1
  },props.enrollmentId)
  emit('register')
}
</script>
<template>
  <ModalBasic
    :visible="props.show"
    is-persistent
    width="500"
    is-scrollable
  >
    <VCard>
  
      <VCardText class="px-4 pb-4">
        <p>Registro de Pago de Matricula</p>
      </VCardText>
    <div class="px-4 pb-4">
        <VFileInput
            label="Cargar constancia"
            accept="image/*,.pdf"
            prepend-icon="mdi-paperclip"
            v-model="movementVoucher"
        />
        <p class="text-end">Opcional</p>
    </div>
      <VCardActions>
        <div class="d-flex gap-4 justify-end w-100">
          <VBtn
            class="px-4"
            color="primary"
            variant="outlined"
            @click="emit('close')"
          >
            Cancelar
          </VBtn>
          <VBtn
            class="px-4"
            color="primary"
            variant="elevated"
            @click="confirmRegister"
          >
            Guardar
          </VBtn>
        </div>
      </VCardActions>
    </VCard>
  </ModalBasic>
</template>
