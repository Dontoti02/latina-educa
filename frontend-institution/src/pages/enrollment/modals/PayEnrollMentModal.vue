<script setup lang="ts">
import { watch } from "vue";
import ModalBasic from "@/common/components/Modal.vue";
import { VCheckbox, VCol, VDivider, VIcon, VRow, VTextField } from "vuetify/lib/components/index.mjs";
import { treasuryService } from "@/services/treasury.service";
import { Concept } from "@/models/treasury";
import RegisterPaymentModal from "./RegisterPaymentModal.vue";
import { ToastService } from "@/common/util/toast.service";
import { SessionStore } from "@/common/store";
import { PaymentConceptEnum } from "@/common/enum/payment-concept.enum";

// Initial
const props = defineProps<{
  show: boolean;
  isScale: boolean;
  scaleAmount: number;
  enrollmentId: number;
  maxMonthsPeriod:number;
}>();
const concepts = ref<Concept[]>([]);
const showModal = ref<boolean>(false);
const totalConceptAmount = ref<number>(0);
const pensionData = ref<Concept>({
  id:                       -1,
  code:                     '',
  name:                     '',
  treasury_denomination_id: -1,
  gross_amount:                   '',
  igv_amount:                   '',
  net_amount:                   '',
  max_quotas:               0,
  is_active:                false,
  can_be_paid_in_quotas:    false,
  include_in_enrollment:    false,
  created_at:               '',
  updated_at:               '',
  deleted_at:               null
});
const pensionSelect = ref<boolean[]>([]);
const paymentMade = ref<boolean>(false);
const isExonerated = ref<boolean>(false);
const exonerationReason = ref<string>("");

const emit = defineEmits<{
  (e: "close"): void;
}>();

const registerEnrollPayment = () => {
  showModal.value = false;
  paymentMade.value = true;
  ToastService.success("Pago de matricula registrado correctamente");
};

const clearData = () => {
  pensionSelect.value = new Array(props.maxMonthsPeriod).fill(false);
  paymentMade.value = false;
  isExonerated.value = false;
  exonerationReason.value = "";
};

onMounted(() => {
  treasuryService.getEnrollmentConceptsData().then((data) => {
    concepts.value = data.data;
    totalConceptAmount.value = concepts.value
      .filter((c) => c.code === PaymentConceptEnum.enrollment)
      .reduce((acc, c) => Number(acc) + Number(c.net_amount), 0);

    const find  = concepts.value.find(
      (c) => c.code === PaymentConceptEnum.monthly
    );

    if (find) {
      pensionData.value = find;
    }
    pensionSelect.value = new Array(props.maxMonthsPeriod).fill(false);
  });
});

const confirmRegister = () => {
 
  treasuryService.payEnrollment({
    'userId': SessionStore().get().user!.id,
    'pensionSelect': pensionSelect.value.join(','),
    'type': 2,
    'isExonerated': isExonerated.value,
    'exonerationReason': exonerationReason.value
  }, props.enrollmentId).then(() => {
    emit('close')
    ToastService.success("Pago de pensiones registrado correctamente")
    clearData()
  }).catch(() => {
    ToastService.error("Error al registrar el pago de pensiones")
  })
  
};

watch(isExonerated, (value) => {
  if (value) {
    totalConceptAmount.value = concepts.value!
      .filter((c) => c.treasury_denomination_id == 1)
      .reduce((acc, c) => Number(acc) + Number(c.gross_amount), 0);
  } else {
    totalConceptAmount.value = concepts.value!
      .filter((c) => c.treasury_denomination_id == 1)
      .reduce((acc, c) => Number(acc) + Number(c.net_amount), 0);
  }
});

const enrollmentConcept = computed(() => {
  return concepts.value!.find((c) => c.code === PaymentConceptEnum.enrollment);
});

const pensionConcept = computed(() => {
  return concepts.value!.find((c) => c.code === PaymentConceptEnum.monthly);
});

const pensionDetail = computed(() => {
  const scaleAmount = props.scaleAmount || 0;
  const amount = isExonerated.value ? Number(pensionData.value!.gross_amount) : Number(pensionData.value!.net_amount);
  const individualAmount = amount - scaleAmount;
  const totalPensionAmount = individualAmount * props.maxMonthsPeriod;
  return {
    info : {
      scaleAmount,
      amount,
      individualAmount,
      totalPensionAmount
    },
    pensions : [
      ...Array(props.maxMonthsPeriod).keys()
    ].map((i) => ({
      number: i,
      amountWithScale: amount,
      scaleAmount,
      amount: individualAmount,
      total: totalPensionAmount
    }))
  }
});

</script>
<template>
  <ModalBasic :visible="props.show" is-persistent width="800" is-scrollable>
    <VCard>
      <VToolbar>
        <VToolbarTitle>Pagos a realizar en la matricula</VToolbarTitle>
        <VSpacer />
        <VBtn icon @click="emit('close')">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VToolbar>
      <VCardText class="px-4 pb-4">
        <VCard 
          class="px-4 py-4" 
          :disabled="paymentMade"
        >
            <VCol cols="12" sm="12">
              <VRow style="align-items: center;">
                <VCol cols="12" sm="12">
                  <VCheckbox v-model="isExonerated" label="Exonerar de IGV"> </VCheckbox>
                </VCol>
                <VCol cols="12" sm="12" v-if="isExonerated">
                  <VTextField v-model="exonerationReason" label="Motivo de Exoneración" outlined>
                  </VTextField>
                </VCol>
              </VRow>
            </VCol>
            <VDivider class="mt-2 mb-2"></VDivider>
            <VCol cols="12" sm="12">
              <strong>
                1.- Pago por concepto de matricula
              </strong>
            </VCol>
            <VCol cols="12" sm="12">
              <VRow style="align-items: center;" v-if="enrollmentConcept">
                <VCol cols="12" sm="4">
                  Total  Bruto: S/. {{ enrollmentConcept.gross_amount }}
                </VCol>
                <VCol cols="12" sm="4">
                  Total IGV: S/. {{ enrollmentConcept.igv_amount }}
                </VCol>
                <VCol cols="12" sm="4">
                  Total Neto: S/. {{ enrollmentConcept.net_amount }}
                </VCol>
              </VRow>
              <VRow style="align-items: center;">
                <VCol cols="12" sm="8">
                  <strong>
                    Total a Pagar: S/.
                  {{ totalConceptAmount }}
                  </strong>
                </VCol>
                <VCol cols="12" sm="4">
                  <VBtn @click="showModal = true">
                    Registrar Pago
                    <v-tooltip activator="parent" location="bottom">
                      Click para registrar el pago por concepto de matricula.
                    </v-tooltip>
                  </VBtn>
                </VCol>
              </VRow>
            </VCol>         
        </VCard>

        <VCard class="px-4 my-4">
            <VCol cols="12" sm="12">
              <strong>
                2.- Cronograma de pensiones
              </strong>
            </VCol>

            <VCol cols="12" sm="12">
              <VRow style="align-items: center;" v-if="pensionConcept">
                <VCol cols="12" sm="4">
                  Total  Bruto: S/. {{ (Number(pensionConcept.gross_amount) * props.maxMonthsPeriod) }} 
                </VCol>
                <VCol cols="12" sm="4">
                  Total IGV: S/. {{ Number(pensionConcept.igv_amount) * props.maxMonthsPeriod }}
                </VCol>
                <VCol cols="12" sm="4">
                  Total Neto: S/. {{ Number(pensionConcept.net_amount) * props.maxMonthsPeriod }}
                </VCol>
              </VRow>
            </VCol>

            <VCol cols="12" sm="12">
              <VRow style="align-items: center;">
                <VCol cols="12" sm="4" v-if="isScale">
                 Total Escala: S/. {{ (props.scaleAmount * props.maxMonthsPeriod)|| 0 }}
                  <span>
                    <VIcon size="sm" color="info">mdi-information</VIcon>
                    <v-tooltip activator="parent" location="bottom">
                      Descuentos, se aplica a cada pensión individualmente.
                    </v-tooltip>
                 </span>
                </VCol>

                <VCol cols="12" sm="4" style="align-items: center;">
                 N° pensiones {{ maxMonthsPeriod }} 
                 <span>
                    <VIcon size="sm" color="info">mdi-information</VIcon>
                    <v-tooltip activator="parent" location="bottom">
                      Obtenido a partir de la fecha de inicio y fin del periodo academico actual.
                    </v-tooltip>
                 </span>
                </VCol>

                <VCol cols="12" :sm="isScale ? 4 : 8">
                  <strong>
                    Total a pagar S/. {{ pensionDetail.info.totalPensionAmount }}
                  </strong>
                </VCol>

                
              </VRow>
            </VCol>
           
          <VRow>
            <VCol cols="12" sm="12">
              <v-table>
                <thead>
                  <tr>
                    <th class="text-center"> N° Pensión </th>
                    <th  class="text-right">
                      Subtotal
                    </th>
                    <th  class="text-right"> Descuento </th>
                    <th  class="text-right"> Monto a Pagar </th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in pensionDetail.pensions" :key="item.number">
                    <td class="text-center"> {{ (item.number + 1) }} </td>
                    <td class="text-right">
                      <span>
                        S/. {{ item.amountWithScale }}
                      </span>
                    </td>
                    <td class="text-right">
                      <span>
                        S/. {{ item.scaleAmount }}
                      </span>
                    </td>
                    <td class="text-right"> S/. {{ item.amount }} </td>
                    <td> 
                      <VCheckbox v-model="pensionSelect[item.number]"> </VCheckbox>
                    </td>

                  </tr>
                </tbody>
              </v-table>
            </VCol>
          </VRow>
        </VCard>
      </VCardText>
      <VCardActions>
        <div class="d-flex gap-4 justify-end w-100">
          <VBtn 
            class="px-4" 
            color="primary" 
            variant="elevated" 
            :disabled="!paymentMade" 
            @click="confirmRegister"
          >
            Generar pago pensiones
          </VBtn>
        </div>
      </VCardActions>
    </VCard>
  </ModalBasic>
  <RegisterPaymentModal 
    :show="showModal" 
    @close="showModal = false" 
    :enrollmentId="props.enrollmentId"
    @register="registerEnrollPayment" 
  />
</template>
