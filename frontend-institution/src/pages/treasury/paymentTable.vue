<script setup lang="ts">
import { MovementDetails, Movements } from '@/models/treasury';
import { defineProps } from 'vue';
import { Movement, ActionsPaymentTable, EventPaymentTable } from '../../models/treasury';
import { treasuryService } from '@/services/treasury.service';
import { text } from 'stream/consumers';
import { VDataTable } from 'vuetify/lib/labs/components.mjs';
import { VDivider } from 'vuetify/lib/components/index.mjs';


const loadingEnrollments = ref(true);

const props = defineProps<{
  movements: Movements
  personId: number
  period: number
  lastPeriod: number
  is_paid: boolean
}>();
const emit = defineEmits([ 'update:page','changeItems','changeType','newPayment','registerPayment','nextPage','previousPage']);
const headers = [
  { 
     title: 'Fecha de Ultimo Pago',
          align: 'center',
          filterable: false,
     key: 'payment_date'},
  {
    title: 'Concepto',
    align: 'center',
    filterable: false,
    key: 'concept'
  },
  {
    title: 'Monto Restante',
    align: 'center',
    filterable: false,
    key: 'amount'
  },
  { 
    title: 'Cuotas Restantes',
    align: 'center',
    filterable: false,
    key: 'remaining_payments'
  },
  (props.is_paid)? { 
    title: 'Codigo de Pago',
    align: 'center',
    filterable: false,
    key: 'code'
  }:{ 
    title: 'Fecha de Proximo Pago',
    align: 'center',
    filterable: false,
    key: 'due_date'
  },
  { 
    title: 'Monto Total',
    align: 'center',
    filterable: false,
    key: 'total_amount'
  },
  { 
    title: 'Estado de Pago',
    align: 'center',
    filterable: false,
    key: 'status'
  },
  { 
    title: 'Tipo de Movimiento',
    align: 'center',
    filterable: false,
    key: 'type'
  },
  { 
    title: 'Acciones',
    align: 'center',
    filterable: false,
    key: 'actions'
  }
];

const formatDate = (dateString: string): string => {
  const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
  return new Date(dateString).toLocaleDateString('es-ES', options);
};
const expandedItem=ref<boolean[]>([]);

const itemsPerPage = ref(10);
const page=ref(1);
const type=ref(null);

const paginationMeta = computed(() => {
  return <T extends { page: number; itemsPerPage: number }>(options: T, total: number) => {
    const start = (options.page - 1) * options.itemsPerPage + 1
    const end = Math.min(options.page * options.itemsPerPage, total)

    return `Showing ${start} to ${end} of ${total} entries`
  }
})

const registerPayment=(id:number)=>{
emit('registerPayment',id);
}

const showMovements=(index: number)=>{
  expandedItem.value[index-1]=!expandedItem.value[index-1];
}

const nextPage=()=>{
  console.log("emitiendo")
  emit('nextPage');
}

const previousPage=()=>{
  emit('previousPage');
}


const newPayment=()=>{
  emit('newPayment');
}

watch(() => props.movements, (newValue) => {
  if (newValue) {
    loadingEnrollments.value = false;
    expandedItem.value=new Array(newValue.data.length).fill(false);
  }
});

watch(()=>type.value,(newValue)=>{
  loadingEnrollments.value=true;
  var tp;
  if(newValue=='Ingreso'){
    tp=1;
  }else if(newValue=='Egreso'){
    tp=2;
  }
  emit('changeType',tp);
});

watch(() => page.value, (newValue) => {
  loadingEnrollments.value=true;
  emit('update:page', newValue);
});

watch(() => itemsPerPage.value, (newValue) => {
  loadingEnrollments.value=true;
  emit('changeItems', newValue);
});
watch(()=>props.personId,(newValue)=>{
  console.log("hola",props.personId)
}); 




const generateInvoice = async (item: Movement) => {
 // 
  const result = await treasuryService.getMovementTicket(item.movement_id)
  if (result) {
    const url = window.URL.createObjectURL(new Blob([result.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `boleta_pago_${item.movement_id}.pdf`);
    document.body.appendChild(link);
    link.click();
  }
};

const generateDetailInvoice=async(item:MovementDetails)=>{
  const result = await treasuryService.getTicket(item.id)
  if (result) {
    const url = window.URL.createObjectURL(new Blob([result.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `boleta_pago_${item.id}.pdf`);
    document.body.appendChild(link);
    link.click();
  }
}


</script>

<template>
  <VCard id="invoice-list">
    <VCardText class="d-flex align-center flex-wrap gap-4">
      <div class="me-3 d-flex gap-3">
        <AppSelect
          v-model="itemsPerPage"
          :items="[
            { value: 10, title: '10' },
            { value: 25, title: '25' },
            { value: 50, title: '50' },
            { value: 100, title: '100' },
          ]"
          style="width: 6.25rem;"
        />
      </div>

      <VSpacer />

      <div class="d-flex align-center flex-wrap gap-4">
        <VBtn prepend-icon="tabler-plus" @click="newPayment" :disabled="!props.personId">
          Registrar Nuevo Pago
        </VBtn>
        <div class="invoice-list-filter">
          <AppSelect
            placeholder="Tipo de Movimiento"
            clearable
            clear-icon="tabler-x"
            single-line
            :items="['Ingreso','Egreso']"
            v-model="type"
          />
        </div>
        <VBtn prepend-icon="tabler-chevron-left" @click="nextPage" :disabled="!props.personId||period==lastPeriod">
          Periodo Anterior
        </VBtn>
        <VBtn append-icon="tabler-chevron-right" @click="previousPage" :disabled="!props.personId||period==0">
          Siguiente Periodo
        </VBtn>
      </div>
    </VCardText>

    <VDivider />

   <!--!aqui la tabla  -->
   

  <v-data-table
  :loading="loadingEnrollments && movements.data !== undefined"
  loading-text="Cargando pagos..."
  no-data-text="No se encontraron pagos"
  show-expand
        single-expand
        v-model:expanded="expandedItem"
    :headers="headers"
    :items="movements.data"   
    :items-per-page="itemsPerPage"
    :page.sync="page"
    item-value="movement_id"
    class="elevation-1"
  
  >
    <template v-slot:item.payment_date="{ item }">
      <span>{{ item.payment_date == null ? 'Pendiente' : formatDate(item.payment_date) }}</span>
    </template>
    <template v-slot:item.concept="{ item }">
      <span class="text-capitalize">{{ item.concept?.toLowerCase() ?? "-" }}</span>
    </template>
    <template v-slot:item.amount="{ item }">
      <span class="text-capitalize">S/. {{ item.amount ?? "-" }}</span>
    </template>
    <template v-slot:item.remaining_payments="{ item }">
      <span>{{ item.remaining_payments ?? "-" }}</span>
    </template>
    <template v-slot:item.due_date="{ item }" v-if="props.is_paid==false">
      <span class="text-capitalize">{{ item.due_date == null ? '' : formatDate(item.due_date) }}</span>
    </template>
    <template v-slot:item.code="{ item }" v-else>
      <span class="text-capitalize">{{ item.code ?? "-" }}</span>
    </template>
    <template v-slot:item.total_amount="{ item }">
      <span>S/. {{ item.total_amount ?? "-" }}</span>
    </template>
    <template v-slot:item.status="{ item }">
      <v-chip
        :color="item.status === 'Pago Completado' ? 'success' : 'error'"
        variant="flat"
        @click="item.status === 'Deuda' && registerPayment(item.movement_id)"
      >
        {{ item.status ?? "-" }}
      </v-chip>
    </template>
    <template v-slot:item.type="{ item }">
      <v-chip
        :color="item.type === 'Ingreso' ? 'success' : item.type === 'Egreso' ? 'error' : 'secondary'"
        variant="flat"
      >
        {{ item.type ?? "-" }}
      </v-chip>
    </template>
    
    <template v-slot:item.actions="{ item }">
      <MoreBtn
        v-if="item.status == 'Pago Completado'"
        :menu-list="[
          {
            title: 'Generar boleta de pago',
            value: 'generate_invoice',
            icon: 'tabler-file-text',
          }
        ]"
        @change="generateInvoice(item)"
      />
    </template>
    <template v-slot:bottom>
      <VDivider />
      <div class="d-flex align-center justify-sm-space-between justify-center flex-wrap gap-3 pa-5 pt-3">
        <p class="text-sm text-disabled mb-0">
          {{ paginationMeta({
            page: page,
            itemsPerPage: Number(movements.per_page),
          }, movements.total) }}
        </p>
        <VPagination
          v-model="page"
          :length="Math.ceil(movements.total / Number(movements.per_page))"
          :total-visible="5"
        >
        <template #prev="slotProps">
            <VBtn
              variant="tonal"
              color="default"
              v-bind="slotProps"
              :icon="false"
            >
              Anterior
            </VBtn>
          </template>
          <template #next="slotProps">
            <VBtn
              variant="tonal"
              color="default"
              v-bind="slotProps"
              :icon="false"
            >
              Siguiente
            </VBtn>
          </template>
        </VPagination>
      </div>
    </template>
    <template v-slot:expanded-row="{ columns, item }">

      <tr v-for="detail in item.details" :key="detail.id" :class="{'contenedor': detail.index === Math.max(...item.details.map((d: MovementDetails) => d.index))}" style="text-align: center;">
        <td>
      <span>{{ detail.payment_date == null ? 'Pendiente' : formatDate(detail.payment_date) }}</span>
    </td>
    <td>
    </td>
    <td>
      <span class="text-capitalize">S/. {{ detail.amount ?? "-" }}</span>
    </td>
    <td>
      <span>{{ detail.index ?? "-" }}</span>
    </td>
    <td>
      <span class="text-capitalize">{{ detail.due_date == null ? '' : formatDate(detail.due_date) }}</span>
    </td>
    <td>
    </td>
    <td>
      <v-chip
        :color="detail.is_paid === true ? 'success' : 'error'"
        variant="flat"
        @click="detail.is_paid === false && registerPayment(item.movement_id)"
      >
        {{ detail.is_paid==true ? "Pago Completado":"Deuda" }}
      </v-chip>
    </td>
    <td>
      
    </td>
    
    <td>
      <MoreBtn
        v-if="detail.is_paid == true"
        :menu-list="[
          {
            title: 'Generar boleta de pago',
            value: 'generate_invoice',
            icon: 'tabler-file-text',
          }
        ]"
        @change="generateDetailInvoice(detail)"
      />
    </td>
      </tr>
    </template>
  </v-data-table>


  </VCard>
</template>

<style lang="scss">
#invoice-list {
  .invoice-list-actions {
    inline-size: 8rem;
  }
  .invoice-list-filter {
    inline-size: 12rem;
  }
}
.contenedor {
  position: relative;
}

.contenedor::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 0.1px; 
  outline: 2px solid gray;
  outline-offset: -2px; 
}
</style>
