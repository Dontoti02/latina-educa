<script setup lang="ts">
import BaseTable, { HeaderProp } from '@/components/common/Table.vue'
import { ToastService, toastSuccess } from '@/common/util/toast.service'
import BulbLightImg from '@images/illustrations/bulb-light.png'
import PencilRocketImg from '@images/illustrations/pencil-rocket.png'
import { VSkeletonLoader } from 'vuetify/lib/labs/components.mjs'
import { PaymentConceptsService } from '@/services/payment-concepts.service'
import { ConceptMovements, type ActionsPaymentConceptTable, type EventPaymentConceptTable, type FiltersPaymetConcepts, type PaymentConcept } from '@/models/payment-concepts'
import { formatCurrency } from '@/utils/currency'
import ModalPaymentConceptForm from './modals/ModalPaymentConceptForm.vue'
import { PaymentConceptsContents } from '@/content/payment-concepts.content'
import ModalPaymentHistory from './modals/ModalPaymentHistory.vue'
import { downloadFile } from '@/utils/file-utils'

const loadingTable = ref(false)
const loadingData = ref(false)

const openModalPaymentConcepts = ref<boolean>(false)
const paymentConcepts = ref<PaymentConcept[]>([])

const headers = ref<HeaderProp[]>(PaymentConceptsContents.table.headers as HeaderProp[])

const search = ref('')
const showModal= ref(false)
const searchTime = ref()
const pagination = ref<{
  page: number
  pages: number
  total: number
}>({
  page: 1,
  pages: 1,
  total: 0
})
const movements= ref<ConceptMovements[]>([]);

const form = ref<FiltersPaymetConcepts>({
  search: '',
  page: 1,
  limit: 10,
})

const selectedItem = ref<PaymentConcept | null>(null)
const showHistoryModal= ref<boolean>(false)
const conceptId= ref<number>(0)
const igv= ref<number>(0)

const editModal = (item: PaymentConcept) => {
  selectedItem.value = item
  openModalPaymentConcepts.value = true
}

const eventsTable : EventPaymentConceptTable = {
  edit : (item)  => editModal(item),
  toggle : (item) => toggleActivate(item),
  detail : (item) => watchPaymentHistory(item),
}

const getPaymentConcepts = () => {
  loadingTable.value = true
  PaymentConceptsService.all(form.value)
    .then(({data}) => {
      const  { items,igv_amount, ...morePagination } = data
      paymentConcepts.value = items
      pagination.value = morePagination.pagination
      igv.value=igv_amount
    })
    .catch(error => {
      console.error(error)
    }).finally(() => {
      loadingTable.value = false
    })
}

const exportPaymentConcepts=()=>{
  loadingTable.value = true
  PaymentConceptsService.export('xlsx').then(response => {
      downloadFile(response)
    }).catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loadingTable.value = false
    })
}

const onSuccessCreatedOrUpdatePaymentConcept = (item:PaymentConcept) => {
  const findPaymentConceptById = paymentConcepts.value.findIndex(i => i.id === item.id)
  if (findPaymentConceptById !== -1) {
    paymentConcepts.value[findPaymentConceptById] = item
  } else {
    paymentConcepts.value.unshift(item)
  }
}

const toggleActivate = (item:PaymentConcept) => {
    loadingTable.value = true
    let query = null
    if (item.isActive) {
      query = PaymentConceptsService.toggleInactivate(item.id)
    } else {
      query = PaymentConceptsService.toggleActivate(item.id)
    }
    query.then(({data,success,message}) => {
      if (!success) {
        ToastService.error(message)
        return
      }
        const findPaymentConceptById = paymentConcepts.value.findIndex(i => i.id === item.id)
        if (findPaymentConceptById !== -1) {
          paymentConcepts.value[findPaymentConceptById] = data
          toastSuccess(message)
        }
      })
      .catch(error => {
        ToastService.error(error)
      }).finally(() => {
        loadingTable.value = false
      })
}

const deletePaymentConcept = async (item: PaymentConcept) => {
  movements.value=(await PaymentConceptsService.movements(item.id)).data;
  selectedItem.value=item;
  showModal.value=true;
}

const confirmDelete=()=>{
   loadingTable.value = true
   PaymentConceptsService.delete(selectedItem.value?.id as number)
     .then(({success,message,data}) => {
       if (!success) {
         ToastService.error(message)
         return
       }
       const findPaymentConceptById = paymentConcepts.value.findIndex(i => i.id === data.id)
       if (findPaymentConceptById !== -1) {
         paymentConcepts.value.splice(findPaymentConceptById, 1)
         toastSuccess(message)
       }
     })
     .catch(error => {
       ToastService.error(error)
     }).finally(() => {
       loadingTable.value = false
       showModal.value = false
     })
}

const watchPaymentHistory = (item: PaymentConcept) => {
  conceptId.value=item.id;
  showHistoryModal.value=true;
}

watch(search, () => {
  clearTimeout(searchTime.value)
  searchTime.value = setTimeout(() => {
    form.value.search = search.value
    getPaymentConcepts()
  }, 500)
})

onMounted(() => {
  getPaymentConcepts()
})


const actionSelected = (body : {
  event:ActionsPaymentConceptTable,
  item: PaymentConcept
}) => {
  const  { event, item } = body
  eventsTable[event](item)
}

</script>

<template>
  <div>
    <div
      v-if="loadingData"
      class="mt-4 w-100 d-flex justify-center"
    >
      <VRow>
        <VCol cols="12">
          <VSkeletonLoader
            class="w-100 gap-4 "
            type="image"
          />
        </VCol>
        <VCol cols="12">
          <VSkeletonLoader
            class="w-100 gap-4 "
            type="list-item,list-item,article,article,article"
          />
        </VCol>
      </VRow>
    </div>
    <div v-else>
      <VCard>
        <VRow class="">
          <VCol
            cols="2"
            class="pl-8 pt-6 pb-0"
          >
            <img
              :src="BulbLightImg"
              height="100"
            >
          </VCol>
          <VCol
            cols="8"
            class="pt-6 px-8 d-flex text-center justify-center align-center flex-column"
          >
            <VRow
              align="center"
              justify="center"
              class="mx-0 my-0 w-100"
            >
              <VCol
                cols="12"
                class="py-0"
              >
                <h1>Conceptos de pago</h1>
                <p class="my-0">
                  Gestiona los conceptos de pago.
                </p>
              </VCol>
            </VRow>
          </VCol>
          <VCol
            cols="2"
            class=" pb-0 d-flex justify-end align-end"
          >
            <img
              :src="PencilRocketImg"
              height="140"
            >
          </VCol>
        </VRow>
      </VCard>
      <VSpacer />
      <VCard
        flat
        class="mt-6 py-4"
      >
        <VRow justify="space-between" class="mx-0">
          <!-- Filters -->
          <VCol
            cols="12"
            md="5"
            class="d-flex justify-end align-center gap-2"
          >
            <VSelect
              v-model="form.limit"
              item-value="id"
              item-title="name"
              label="Show"
              style="width: 20%;"
              :items="[
                { id: 10, name: '10' },
                { id: 20, name: '20' },
                { id: 50, name: '50' },
                { id: 100, name: '100' }
              ]"
              @update:modelValue="getPaymentConcepts"
            />

            <VTextField
              v-model="search"
              placeholder="Buscar concepto, por nombre o código"
              clearable
              style="width: 80%;"
              density="compact"
            />
          </VCol>
        
          <VCol
            cols="12"
            md="4"
            class="d-flex justify-end align-end gap-2"
          >
            <VBtn
              class="text-none"
              color="info"
              @click="exportPaymentConcepts"
              :loading="loadingTable"
            >
              <VIcon>tabler-download</VIcon>
              <span>Exportar</span>
            </VBtn>
            
            <VBtn
              class="text-none"
              text="Agregar usuario"
              @click="openModalPaymentConcepts = true"
            >
              <VIcon>tabler-plus</VIcon>
              <span>Nuevo</span>
            </VBtn>
          </VCol>
        </VRow>
        <VRow class="mx-0">
          <VCol cols="12">
            <BaseTable
              :config="{
                index:true,
                loading:loadingTable,
                pagination: {
                  peerPage:10
                },
                fixed: true
              }"
              :header="headers"
              :items="paymentConcepts"
            >
              <template #name="{item}">
                <div class="d-flex align-center gap-1">
                  <v-btn icon size="x-small" variant="text" density="compact" v-if="item.isPension || item.isEnrollmment">
                    <v-icon>mdi-help-circle-outline</v-icon>
                    <v-tooltip
                      activator="parent"
                      location="right"
                      max-width="400"
                      content-class="bg-white"
                    >
                      <v-alert
                        title="Atención"
                        type="info"
                        variant="tonal"
                      >
                        <template v-if="item.isPension">
                          * Este Concepto de pago es utilizado para el cobro de las pensiones.
                        </template>
                        <template v-if="item.isEnrollmment">
                          * Este Concepto de pago es utilizado para el cobro de las matrículas.
                        </template>
                      </v-alert>
                    </v-tooltip>
                </v-btn>
                <span style="display: block; width: 20rem;">
                  {{ item.name }} 
                </span>
                </div>
              </template>
              
              <template #amount="{item}">
                <span>{{ formatCurrency(item.gross_amount) }}</span>
              </template>

              <template #canBePaidInQuotas="{item}">
                <VChip
                  variant="tonal"
                  style="z-index: 1;"
                  :color="item.canBePaidInQuotas ? 'warning' : 'primary'"
                >
                  {{  item.canBePaidInQuotas ? 'Pago en cuotas' : 'Pago completo' }}
                </VChip>
              </template>

              <template #isActive="{item}">
                <VChip
                  variant="tonal"
                  :color="item.isActive ? 'success' : 'error'"
                >
                  {{  item.isActive ? 'Activo' : 'Inactivo' }}
                </VChip>
              </template>
              <template #actions="{item}">
                <MoreBtn
                  :menu-list="item.isEnrollmment || item.isPension ? [
                    {
                      title: 'Editar',
                      value: 'edit',
                      icon: 'tabler-edit',
                    },
                    {
                      title: 'Ver historial de cambios',
                      value: 'detail',
                      icon: 'tabler-eye'
                    }
                  
                  ] : [
                    {
                      title: 'Editar',
                      value: 'edit',
                      icon: 'tabler-edit',
                    },
                    {
                      title: item.isActive ? 'Desactivar' : 'Activar',
                      value: 'toggle',
                      icon: item.isActive ? 'tabler-toggle-left' : 'tabler-toggle-right'
                    },
                    {
                      title: 'Ver historial de cambios',
                      value: 'detail',
                      icon: 'tabler-eye'
                    }
                  ]"
                  @change="actionSelected({
                    event: $event[0],
                    item:item as PaymentConcept
                  })" 
                />
              </template>
            </BaseTable>
          </VCol>
        </VRow>
      </VCard>
    </div>
    <ModalPaymentConceptForm 
      :show="openModalPaymentConcepts"
      @close="openModalPaymentConcepts = false; selectedItem = null"
      :item="selectedItem"
      :igv="igv"
      @success="onSuccessCreatedOrUpdatePaymentConcept"
    />
    <ModalPaymentHistory
    :show="showHistoryModal"
    :concept-id="conceptId"
    @close="showHistoryModal = false"
    ></ModalPaymentHistory>
  </div>
</template>

<style lang="scss">
  .bg-transparent {
    background-color: transparent !important;
  }

  .bg-white {
    background-color: white !important;
  }
</style>

<route lang="yaml">
meta:
  action: read
  subject: PaymentConcepts
</route>
