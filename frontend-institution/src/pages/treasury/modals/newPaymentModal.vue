<script setup lang="ts">
import { ref } from "vue";
import ModalBasic from "@/common/components/Modal.vue";
import { VDivider, VLabel, VSelect } from "vuetify/lib/components/index.mjs";
import { treasuryService } from "@/services/treasury.service";
import { debounce } from "lodash";
import { SessionStore } from "@/common/store";
import { ToastService } from "@/common/util/toast.service";
import { MovementByConcept, MovementDetails } from "@/models/treasury";

const searchInput = ref("");
const concept = ref(null);
const concepts = ref([]);
const conceptsData = ref([]);
const isRefund=ref(false);
const tab = ref(0);
const form = ref({
  concept: null,
  initialAmount: 0,
  exonerationReason: "",
  isExonerated: false,
  isQuota: false,
  quota: 1,
  userId: SessionStore().get().user!.id,
  movementType: 1,
  personId:0,
});
const selectedConceptData = ref({
  id: null,
  can_be_quotas: false,
  gross_amount: 0,
  igv_amount: 0,
  net_amount: 0,
  max_quotas: 0,
});
const movementsToRefund=ref<MovementByConcept[]>([]);

const clearAllData=()=>{
  searchInput.value = "";
  concept.value = null;
  concepts.value = [];
  conceptsData.value = [];
  form.value.concept = null;
  form.value.initialAmount = 0;
  form.value.isQuota = false;
  form.value.quota = 1;
  form.value.userId = SessionStore().get().user!.id;
  form.value.movementType = 1;
  selectedConceptData.value.id = null;
  selectedConceptData.value.can_be_quotas = false;
  selectedConceptData.value.gross_amount = 0;
  selectedConceptData.value.igv_amount = 0;
  selectedConceptData.value.net_amount = 0;
  selectedConceptData.value.max_quotas = 0;
  movementsToRefund.value=[];
  refundAmount.value=0;
  refundIsRelated.value=false;
}

const refundAmount=ref(0);
const refundIsRelated=ref(false);

const searchconcept = async (input: string) => {
  if(input.length<2){
    return;
  }
  treasuryService.searchConcept(input).then((value: any) => {
    conceptsData.value = value.data;
    concepts.value = value.data.map((concept: any) => concept.names);
  });
};

const closeModal = () => {
  clearAllData();
  emit("close");
};
const debouncedSearch = debounce(searchconcept, 500);

const onInput = (value: { data: string | null }) => {
  if (value.data === null) {
    searchInput.value = searchInput.value.slice(0, -1);
  } else if (value.data === " ") {
    searchInput.value += " ";
  } else {
    searchInput.value += value.data;
  }
  debouncedSearch(searchInput.value);
};

const clearSearchInput = () => {
  searchInput.value = "";
  concept.value = null;
};

const saveRegister= ()=>{
  if(isRefund.value){
    const MovementIds= movementsToRefund.value.filter((item)=>item.isSelected).map((item)=>item.id);
    var refundForm;
    if(movementsToRefund.value.length==0){
       refundForm={
      personId:props.personId,
      amount:refundAmount.value,
      userId:form.value.userId,
      movementIds:null,
      conceptId:form.value.concept,
      movementType:2
    }
    }
    else{
       refundForm={
      personId:props.personId,
      amount:refundAmount.value,
      userId:form.value.userId,
      movementIds:MovementIds,
      conceptId:form.value.concept,
      movementType:2
    }
    }
    treasuryService.saveRefund(refundForm).then((value) => {
      ToastService.success("Devolución registrada correctamente");
      clearAllData();
      emit("register");
      emit("close");
    }).catch((error)=>{
      ToastService.error("Error al registrar la devolución");
    });
  }else{
  form.value.personId=props.personId;
  treasuryService.savePayment(form.value).then((value) => {
    ToastService.success("Pago registrado correctamente")
    clearAllData();
    emit("register");
    emit("close");
  }).catch((error)=>{
    ToastService.error("Error al registrar el pago");
  });
}
}

watch(()=>tab.value,(newValue)=>{
  if(newValue==1){
    isRefund.value=true;
    form.value.movementType=2;
    clearAllData();
  }else{
    isRefund.value=false;
    form.value.movementType=1;
    clearAllData();
  }
})

watch(
  () => concept.value,
  (newValue) => {
    if (newValue) {
      const selectedConcept = conceptsData.value.find(
        (concept: any) => concept.names === newValue
      );
      form.value.concept = selectedConcept!["id"];
      selectedConceptData.value.id = selectedConcept!["id"];
      selectedConceptData.value.can_be_quotas =
        selectedConcept!["can_be_paid_in_quotas"];
      selectedConceptData.value.gross_amount = selectedConcept!["gross_amount"];
      selectedConceptData.value.igv_amount = selectedConcept!["igv_amount"];
      selectedConceptData.value.net_amount = selectedConcept!["net_amount"];
      refundAmount.value=selectedConcept!["gross_amount"];
      selectedConceptData.value.max_quotas = selectedConcept!["max_quotas"];
    }
  }
);

watch(()=>form.value.isExonerated,(newValue)=>{
  if(newValue){
    selectedConceptData.value.igv_amount=0;
    selectedConceptData.value.net_amount=selectedConceptData.value.gross_amount;
  }
  else{
    const selectedConcept = conceptsData.value.find(
        (concept: any) => concept.id === selectedConceptData.value.id
      );
    selectedConceptData.value.igv_amount=selectedConcept!["igv_amount"];
    selectedConceptData.value.net_amount=selectedConcept!["net_amount"];
  }
})

watch(()=>refundIsRelated.value,(newValue)=>{
  if(newValue){
    treasuryService.getMovementsByConcept(form.value.concept!,props.personId).then((value)=>{
      movementsToRefund.value=value.data;
      movementsToRefund.value.forEach((item)=>{
        item.isSelected=false;
      })
    })
  }
})

const props = defineProps<{
  show: boolean;
  personId:number;
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
        <VToolbarTitle class="text-center">Registro de Pago</VToolbarTitle>
      </VToolbar>
      <VTabs v-model="tab">
        <VTab>Pago</VTab>
        <VTab>Devolución</VTab>
      </VTabs>

      <VTabItem v-if="tab === 0">
        <VCardText class="form-body">
        <VForm>
          <VRow>
            <VCol cols="12" sm="12">
              <v-autocomplete
                label="Busqueda de Conceptos de Pago"
                :items="concepts"
                clearable
                v-model="concept"
                :oninput="onInput"
                @click:clear="clearSearchInput"
                :rules="[(v: any) => !!v || 'Seleccione un concepto']"
              ></v-autocomplete>
              <v-alert type="warning" variant="outlined" class="mt-4" closable>
            Debe buscar un concepto por su nombre o codigo antes de poder seleccionarlo
          </v-alert>
            </VCol>
          </VRow>
          <VRow class="text-center">
            <VCol cols="12" sm="6">
              <VRow>
              <VCol cols="12" sm="4">
              Monto Bruto: S/. {{ selectedConceptData.gross_amount }}
            </VCol>
            <VCol cols="12" sm="4">
              Monto IGV: S/. {{ selectedConceptData.igv_amount }}
            </VCol>
            <VCol cols="12" sm="4">
              Monto Neto: S/. {{ selectedConceptData.net_amount }}
            </VCol>
          </VRow>
            </VCol>
            <VCol cols="12" sm="6">
              Monto Restante: S/.
              {{ selectedConceptData.net_amount - form.initialAmount }}
            </VCol>
          </VRow>
          <VDivider class="my-4" />
          <VRow class="mt-4">
            <VCol cols="12" sm="6">
              <VTextField
                label="Monto Inicial"
                type="number"
                v-model="form.initialAmount"
                dense
                :disabled="!form.concept"
                class="form-field"
              />
            </VCol>

            <VCol cols="12" sm="6" v-if="!form.isQuota">
              <VCheckbox
                label="Pago en Cuotas"
                class="form-checkbox"
                v-model="form.isQuota"
                :disabled="!form.concept && !selectedConceptData.can_be_quotas"
                style="align-self: center; place-items: center"
              />
            </VCol>

            <VCol cols="12" sm="3" v-if="form.isQuota">
              <VCheckbox
                label="Pago en Cuotas"
                class="form-checkbox"
                v-model="form.isQuota"
                style="align-self: center; place-items: center"
              />
            </VCol>
            <VCol cols="12" sm="3" v-if="form.isQuota">
              <VTextField
                label="Cuotas"
                type="number"
                min="1"
                :max="selectedConceptData.max_quotas"
                dense
                v-model="form.quota"
                :rules="[                  
                (v: number) => selectedConceptData.can_be_quotas ? (v <= selectedConceptData.max_quotas || `El número de cuotas no puede ser mayor a ${selectedConceptData.max_quotas}`) :true,
                (v: number) => selectedConceptData.can_be_quotas ? (v >= 1 || `El número de cuotas no puede ser menor a 1`) :true
                ]"
                class="form-field"
              />
            </VCol>
          </VRow>
          <VRow>
              <VCol cols="12" sm="6" >
                <VCheckbox
                  label="Exnorar pago de IGV"
                  class="form-checkbox"
                  v-model="form.isExonerated"
                  :disabled="!form.concept && !selectedConceptData.can_be_quotas"
                  style="align-self: center; place-items: center"
                />
              </VCol>            
              <VTextField
                label="Motivo de Exoneración"
                type="text"
                v-model="form.exonerationReason"
                dense
                :disabled="!form.concept||!form.isExonerated"
                class="form-field"
              />

          </VRow>
        </VForm>
      </VCardText>
      <h2 style="place-self: center; font-weight: normal" v-if="form.isQuota&&form.quota>=1">
        Cronograma de Pagos
      </h2>
      <VTable style="padding: 0px 10% 0px 10%; height: 20rem;" v-if="form.isQuota&&form.quota>=1">
        <thead>
          <tr>
            <th class="text-center">Cuota</th>
            <th class="text-center">Fecha de Pago</th>
            <th class="text-center">Monto a Pagar</th>
          </tr>
        </thead>
        <tbody style="max-height: 200px; overflow-y: auto;">
            <tr v-for="n in Number(form.quota)" :key="n">
            <td class="text-center">Cuota {{ n }}</td>
            <td class="text-center">{{ new Date(new Date().setMonth(new Date().getMonth() + n)).toLocaleDateString() }}</td>
            <td class="text-center">{{ ((selectedConceptData.gross_amount - form.initialAmount) / form.quota).toFixed(2) }}</td>
            </tr>
        </tbody>
      </VTable>
      <VCardActions class="form-actions" style="justify-content: end;">
        <div class="action-buttons">
          <VBtn
            class="px-4"
            color="primary"
            variant="outlined"
            @click="closeModal"
          >
            Cancelar
          </VBtn>
          <VBtn
            variant="elevated"
            class="px-4"
            color="success"
            :disabled="!form.concept"
            @click="saveRegister"
          >
            Registrar pago
          </VBtn>
        </div>
      </VCardActions>
      </VTabItem>
      <VTabItem v-if="tab === 1">
        <VCardText class="form-body">
        <VForm>
          <VRow>
            <VCol cols="12" sm="12">
              <v-autocomplete
                label="Busqueda de Conceptos de Pago"
                :items="concepts"
                clearable
                v-model="concept"
                :oninput="onInput"
                @click:clear="clearSearchInput"
                :rules="[(v: any) => !!v || 'Seleccione un concepto']"
              ></v-autocomplete>
              <v-alert type="warning" variant="outlined" class="mt-4" closable>
            Debe buscar un concepto por su nombre o codigo antes de poder seleccionarlo
          </v-alert>
            </VCol>
          </VRow>
          <VDivider class="my-4" /> 
          <VRow>
            <VCol cols="12" sm="6">
              <VTextField
                label="Monto de Devolución"
                type="number"
                dense
                v-model="refundAmount"
                persistent-placeholder
                class="form-field"
              />
            </VCol>

            <VCol cols="12" sm="6">
              <VCheckbox
                label="Relacionar con Pago"
                class="form-checkbox"
                v-model="refundIsRelated"
                style="align-self: center; place-items: center"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
      <h2 style="place-self: center; font-weight: normal" v-if="refundIsRelated">
        Seleccione el Movimiento a Devolver
      </h2>
      <VTable style="padding: 0px 10% 0px 10%; height: 20rem;" v-if="refundIsRelated">
        <thead>
          <tr>
            <th></th>
            <th class="text-center">Codigo</th>
            <th class="text-center">Cuotas</th>
            <th class="text-center">Monto Pagado</th>
            <th class="text-center">Fecha de Pago</th>
          </tr>
        </thead>
        <tbody style="max-height: 200px; overflow-y: auto;">
            <tr v-if="movementsToRefund.length === 0">
              <td colspan="5" class="text-center">No hay movimientos para devolver</td>
            </tr>
            <tr v-for="item in movementsToRefund" :key="item.id">
              <td>
                <VCheckbox
                  class="form-checkbox"
                  v-model="item.isSelected"
                  style="align-self: center; place-items: center"
                />
              </td>
              <td class="text-center">{{ item.code }}</td>
              <td class="text-center">{{ item.quotas }}</td>
              <td class="text-center">S/. {{ (item.amount - item.remaining_amount) }}</td>
              <td class="text-center">{{ new Date(item.payment_date).toLocaleDateString() }}</td>
            </tr>
        </tbody>
        <VRow>
      </VRow>
      </VTable>
      <VCardActions class="form-actions" style="justify-content: end;">
        <div class="action-buttons">
          <VBtn
            class="px-4"
            color="primary"
            variant="outlined"
            @click="closeModal"
          >
            Cancelar
          </VBtn>
          <VBtn
            variant="elevated"
            class="px-4"
            color="success"
            :disabled="!form.concept"
            @click="saveRegister"
          >
            Registrar Devolución
          </VBtn>
        </div>
      </VCardActions>
      </VTabItem>
      
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

.v-tabs {
  border-bottom: 2px solid #e0e0e0;
  display: flex;
  justify-content: center;
}

.v-tab {
  font-weight: 600;
  font-size: 16px;
  padding: 12px 16px;
  flex: 1;
  text-align: center;
}

.v-tab--active {
  color: #1976d2;
  border-bottom: 2px solid #1976d2;
}

.v-tab:hover {
  background-color: #1976d2;
  color:#e0e0e0 !important;
}
</style>
