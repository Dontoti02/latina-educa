<script setup lang="ts">
import { ref } from "vue";
import ModalBasic from "@/common/components/Modal.vue";
import { VDivider, VLabel, VSelect } from "vuetify/lib/components/index.mjs";
import { treasuryService } from "@/services/treasury.service";
import { ActionsPaymentTable, EventPaymentTable, Movement, MovementDetails } from "@/models/treasury";
import { ToastService } from "@/common/util/toast.service";

const PaymentsData=ref<MovementDetails[]>([]);
const payedMovementsData=ref<MovementDetails[]>([]);
const loading=ref(false);
const headers = [
  { title: "Fecha de Pago", key: "payment_date", align: "center" },
  { title: "Numero de Cuota", key: "quota", align: "center" },
  { title: "Monto pagado", key: "amount", align: "center" },
  {
    title: "Acciones",
    key: "actions",
    align: "center",
  }
];

const eventsTable : EventPaymentTable = {
  generate_invoice : (item)  => generateInvoice(item)
}
const actionSelected = (body : {
  event:ActionsPaymentTable,
  item: MovementDetails
}) => {
  const  { event, item } = body
  eventsTable[event](item)
}
const generateInvoice = async (item: MovementDetails) => {
 // 
  const result = await treasuryService.getTicket(item.id)
  if (result) {
    const url = window.URL.createObjectURL(new Blob([result.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `boleta_pago_${item.id}.pdf`);
    document.body.appendChild(link);
    link.click();
  }
};

watch(() => props.show, (newValue) => {
  if (newValue==true) {
    loading.value=true;
    treasuryService.getDetails(props.movementId).then((value) => {
      PaymentsData.value = value.data.nextMovements;
      payedMovementsData.value = value.data.payedMovements;
      loading.value=false;
    });
  }
});
const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};
const RegisterPayment=()=>{
  treasuryService.registerPayment(props.movementId).then((value) => {
    ToastService.success("Pago registrado correctamente");
    emit("register");
    emit("close");
  });
}

const props = defineProps<{
  show: boolean;
  movementId:number;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "register"): void;
}>();
</script>
<template>
  <ModalBasic :visible="props.show" is-persistent width="1000" is-scrollable>
    <VCard class="form-card">
      <VToolbar class="form-toolbar">
        <VToolbarTitle class="text-center">¿Desea Registrar el Pago de la Siguiente Cuota?</VToolbarTitle>
      </VToolbar>
      <VCardText class="form-body">
        <v-progress-circular color="primary" indeterminate v-if="loading"></v-progress-circular>
        <VForm v-else>
          <VRow class="text-center">
            <VCol cols="12" sm="4" class="info-item">
              <VCard class="info-card" variant="outlined">
          <VCardTitle class="info-label">Cuotas Restantes</VCardTitle>
          <VCardText class="info-value">
            <VChip color="primary" text-color="white" class="ma-2" pill>
              {{ PaymentsData!.length }}
            </VChip>
          </VCardText>
              </VCard>
            </VCol>
            <VCol cols="12" sm="4" class="info-item">
              <VCard class="info-card" variant="outlined">
          <VCardTitle class="info-label">Monto de la Próxima Cuota</VCardTitle>
          <VCardText class="info-value">
            <VChip color="success" text-color="white" class="ma-2" pill>
              S/. {{ PaymentsData![0].amount }}
            </VChip>
          </VCardText>
              </VCard>
            </VCol>
            <VCol cols="12" sm="4" class="info-item">
              <VCard class="info-card" variant="outlined">
          <VCardTitle class="info-label">Próxima Fecha de Pago</VCardTitle>
          <VCardText class="info-value">
            <VChip color="info" text-color="white" class="ma-2" pill>
              {{ formatDate(PaymentsData![0].due_date) }}
            </VChip>
          </VCardText>
              </VCard>
            </VCol>
          </VRow>
        </VForm>
        <VDivider class="my-4" />
        <div v-if="payedMovementsData.length!=0">
              <h2 class="text-center">Pagos Realizados</h2>
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
                   <tr v-for="item in payedMovementsData" :key="item.id">
                    <td class="text-center">{{ formatDate(item.payment_date) }}</td>
                    <td class="text-center">
                      Cuota {{ item.index ?? "-" }}
                    </td>
                    <td class="text-capitalize text-center">
                      S/. {{ item.amount }}
                    </td>
                    <td>
                      <MoreBtn
                        :menu-list="[
                          {
                            title: 'Generar boleta de pago',
                            value: 'generate_invoice',
                            icon: 'tabler-file-text',
                          }
                        ]"
                        @change="actionSelected({
                          event: $event[0],
                          item:item as MovementDetails
                        })" 
                      />
                    </td>
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
            Cancelar
          </VBtn>
          <VBtn
            variant="elevated"
            class="px-4"
            color="success"
            @Click="RegisterPayment"
          >
            Registrar pago
          </VBtn>
        </div>
      </VCardActions>
    </VCard>
  </ModalBasic>
</template>

<style scoped>
.form-card {
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
}

.form-toolbar {
  padding: 12px 16px;

  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
}

.form-toolbar .v-toolbar-title {
  font-weight: 600;
  font-size: 20px;
}

.form-body {
  padding: 24px;
}

.form-field {
  margin-bottom: 20px;
}

.form-checkbox {
  margin-bottom: 20px;
}

.form-scale-section {
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.form-actions {
  padding: 16px;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}

</style>
