<script setup lang="ts">
import BaseTable, { HeaderProp } from '@/components/common/Table.vue'
import { ToastService, toastSuccess } from '@/common/util/toast.service'
import BulbLightImg from '@images/illustrations/bulb-light.png'
import PencilRocketImg from '@images/illustrations/pencil-rocket.png'
import { VSkeletonLoader } from 'vuetify/lib/labs/components.mjs'
import { ActionsScaleTable, ConceptMovements, EventScaleTable, Scale,  type FiltersPaymetConcepts } from '@/models/payment-concepts'
import { formatCurrency } from '@/utils/currency'
import { ScaleService } from '@/services/scale.service'
import { ScaleContents } from '@/content/scale.content'
import ModalScaleForm from './modals/ModalScaleForm.vue'
import DeleteScaleModal from './modals/DeleteScaleModal.vue'

const loadingTable = ref(false)
const loadingData = ref(false)

const openModalScales = ref<boolean>(false)
const ScalesList = ref<Scale[]>([])

const headers = ref<HeaderProp[]>(ScaleContents.table.headers as HeaderProp[])
const enrollments= ref<String[]>([])

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

const form = ref<FiltersPaymetConcepts>({
  search: '',
  page: 1,
  limit: 10,
})

const selectedItem = ref<Scale | null>(null)

const editModal = (item: Scale) => {
  selectedItem.value = item
  openModalScales.value = true
}

const eventsTable : EventScaleTable = {
  edit : (item)  => editModal(item),
  delete : (item) => deleteScale(item),
}

const getScales = () => {
  loadingTable.value = true
  
  ScaleService.all(form.value)
    .then(({data}) => {
      const  { items, ...morePagination } = data
      ScalesList.value = items
      pagination.value = morePagination.pagination
    })
    .catch(error => {
      console.error(error)
    }).finally(() => {
      loadingTable.value = false
    })
}

// const exportPaymentConcepts=()=>{
//   PaymentConceptsService.export('xlsx').then(response => {
//       downloadFile(response)
//     }).catch(error => {
//       ToastService.error(error)
//     })
// }

const onSuccessCreatedOrUpdateScale = (item:Scale) => {
  const findScaleById = ScalesList.value.findIndex(i => i.id === item.id)
  if (findScaleById !== -1) {
    ScalesList.value[findScaleById] = item
  } else {
    ScalesList.value.unshift(item)
  }
}


 const deleteScale = async (item: Scale) => {
  enrollments.value=(await ScaleService.enrollments(item.id)).data;
   selectedItem.value=item;
   showModal.value=true;
 }

 const confirmDelete=()=>{
    loadingTable.value = true
    ScaleService.delete(selectedItem.value?.id as number)
      .then(({success,message,data}) => {
        if (!success) {
          ToastService.error(message)
          return
        }
        const findScaleById = ScalesList.value.findIndex(i => i.id === data.id)
        if (findScaleById !== -1) {
         ScalesList.value.splice(findScaleById, 1)
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


watch(search, () => {
  clearTimeout(searchTime.value)
  searchTime.value = setTimeout(() => {
    form.value.search = search.value
    getScales()
  }, 500)
})

onMounted(() => {
  getScales()
})


const actionSelected = (body : {
  event:ActionsScaleTable,
  item: Scale
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
                <h1>Escalas</h1>
                <p class="my-0">
                  Gestiona las Escalas.
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
              @update:modelValue="getScales"
            />

            <VTextField
              v-model="search"
              placeholder="Buscar escala, por nombre"
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
            <!-- <VBtn
              class="text-none"
              color="info"
              @click="exportPaymentConcepts"
            >
              <VIcon>tabler-download</VIcon>
              <span>Exportar</span>
            </VBtn> -->
            
            <VBtn
              class="text-none"
              text="Agregar usuario"
              @click="openModalScales = true"
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
              :items="ScalesList"
            >
              <template #actions="{item}">
                <MoreBtn
                  :menu-list="[
                    {
                      title: 'Editar',
                      value: 'edit',
                      icon: 'tabler-edit',
                    },
                    
                     {
                       title: 'Eliminar',
                       value: 'delete',
                       icon: 'tabler-trash'
                     },

                  ]"
                  @change="actionSelected({
                    event: $event[0],
                    item:item as Scale
                  })" 
                />
              </template>
            </BaseTable>
          </VCol>
        </VRow>
      </VCard>
    </div>
   <ModalScaleForm 
      :show="openModalScales"
      @close="openModalScales = false; selectedItem = null"
      :item="selectedItem"
      @success="onSuccessCreatedOrUpdateScale"
    /> 
    <DeleteScaleModal
      :show="showModal"
      :item="selectedItem"
      :enrollments="enrollments"
      @confirm="confirmDelete"
      @close="showModal = false"
    /> 
  </div>
</template>

<style lang="scss">

</style>

<route lang="yaml">
meta:
  action: read
  subject: Scales
</route>
