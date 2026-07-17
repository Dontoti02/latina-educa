<script setup lang="ts">
import { ref } from "vue";
import ModalBasic from "@/common/components/Modal.vue";
import { treasuryService } from "@/services/treasury.service";
import { ConceptHistory } from "../../../models/treasury";

const props = defineProps<{
  show: boolean;
  conceptId:number;
}>();

const paymentHistory = ref<ConceptHistory[]>([]);
const loading = ref(false);

const headers = [
  { key: "code", title: "Código", align: "center" },
  { key: "name", title: "Nombre", align: "center" },
  { key: "payment_concept", title: "Concepto", align: "center" },
  { key: "denomination", title: "Denominación", align: "center" },
  { key: "person_change", title: "Persona que hizo el cambio", align: "center" },
  { key: "amount", title: "Cantidad", align: "center" },
  { key: "max_quotas", title: "Máximo de cuotas", align: "center" },
  { key: "is_active", title: "¿Está activo?", align: "center" },
  { key: "can_be_paid_in_quotas", title: "¿Puede pagarse en cuotas?", align: "center" },
  { key: "include_in_enrollment", title: "¿Se incluye en matrícula?", align: "center" },
  { key: "created_at", title: "Fecha", align: "center" },
]

const getPaymentHistory=()=>{
    loading.value = true;
    treasuryService.getPaymentHistory(props.conceptId).then((response) => {
        paymentHistory.value = response.data;
        loading.value = false;
    });
}
const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};


const emit = defineEmits<{
  (e: "close"): void;
}>();

watch(() => props.show, async (value) => {
  if (value) {
    await getPaymentHistory();
  }
});
</script>
<template>
 <ModalBasic :visible="props.show" is-persistent width="1300" is-scrollable>
    <VCard class="form-card">
      <VToolbar class="form-toolbar">
        <VToolbarTitle class="text-center">Historial de cambios del concepto de pago</VToolbarTitle>
      </VToolbar>
      <VCardText class="form-body">
        <v-progress-circular color="primary" indeterminate v-if="loading"></v-progress-circular>
        <div v-if="paymentHistory.length!=0">
              <h2 class="text-center">Cambios Realizados</h2>
              <VTable id="enrollment-table">
                <thead>
                  <tr>
                    <th
                      v-for="header in headers"
                      :key="header.key"
                      :class="{
                        'text-left': !header.align || header.align === 'left',
                        'text-center': header.align === 'center',
                        'text-right': header.align === 'right',
                      }"
                    >
                      {{ header.title }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                   <tr v-for="item in paymentHistory" :key="item.id">
                    <td class="text-center">{{ item.code }}</td>
                    <td class="text-center">{{ item.name }}</td>
                    <td class="text-center">{{ item.payment_concept.name }}</td>
                    <td class="text-center">{{ item.denomination.name }}</td>
                    <td class="text-center">{{ item.person_change.names }}</td>
                    <td class="text-center">S/. {{ item.amount }}</td>
                    <td class="text-center">{{ item.max_quotas }}</td>
                    <td class="text-center">{{ item.is_active?'Si':'No' }}</td>
                    <td class="text-center">{{ item.can_be_paid_in_quotas?'Si':'No' }}</td>
                    <td class="text-center">{{ item.include_in_enrollment?'Si':'No' }}</td>
                    <td class="text-center">{{ formatDate(item.created_at) }}</td>                   
                  </tr> 
                </tbody>
              </VTable> 
            </div>
      </VCardText>
      <VCardActions class="form-actions" style="align-self: self-end">
        <div class="action-buttons">
          <VBtn
            class="px-4"
            color="primary"
            variant="outlined"
            @click="emit('close')"
          >
            Cerrar
          </VBtn>
        </div>
      </VCardActions>
    </VCard>
  </ModalBasic>
</template>