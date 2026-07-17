<script lang="ts" setup>
import { UbigeoService } from '@/common/services/ubigeo.service';
import CustomTable, { HeaderProp } from '@/components/common/Table.vue'
import { GlobalPagination } from '@/models/global';
import { JobOffer, JobOfferListResponse } from '@/models/job-opportunities/job-offer'
import { VChip } from 'vuetify/lib/components/index.mjs';
import SharedCopyOfferModal from '../SharedCopyOfferModal.vue';
import { modalConfirmation } from '@/common/util/modal.service';
import { JobOpportunitiesJobOfferService } from '@/services/job-opportutines/job-offer';
import { ToastService } from '@/common/util/toast.service';
import { JobOffersStateEnum } from '@/common/enum/job-offers-state.enum';
import ModalPreview from '../ModalPreview.vue';

const headers = ref<HeaderProp[]>([
  { title: '', key: 'actions',fixed:true, align: 'center' },
  { title: '', key: 'state', fixed:true, align: 'center' },
  { title: 'TÍTULO', key: 'title', fixed:true, align:'left' },
  { title: 'SALARIO', key: 'salary', nowrap:true, align: 'right'},
  { title: 'CATEGORIA', key: 'categoryName',nowrap : true,align: 'center' },
  { title: 'JORNADA DE TRABAJO', key: 'scheduleName', nowrap : true,align: 'center' },
  { title: 'MODALIDAD DE TRABAJO', key: 'locationName',nowrap : true, align: 'center' },
  { title: 'TIPO DE CONTRATO', key: 'contractTypeName', nowrap : true, align: 'center' },
  { title: 'FECHA', key: 'publicationDate',nowrap : true,align: 'center'},
])

const props = defineProps<{
  results: JobOfferListResponse
  pagination : GlobalPagination
  isAdmin : boolean
}>()

const emit = defineEmits(['reload', 'setPage'])

const loadingTable = ref(false)
const ubigeoService = UbigeoService
const router = useRouter();
const modal = ref({
  shared: false,
  preview: false,
})
const offerSelected = ref<JobOffer | null>(null)

if (props.isAdmin) {
  headers.value.push({ title: 'EMPRESA', key: 'companyName', nowrap : true, align: 'center' })
}

const getAddress = ({address,department,province} : {
  address : string,
  department: string,
  province: string
}) => {
  if (department === '' || province === '') return address
  const foundDepartment = ubigeoService.departments.find((item) => item.id === department)
  const foundProvice = ubigeoService.provincies[department].find((item) => item.id === province)
  if (foundDepartment && foundProvice) {
    return `${address},${foundDepartment.name},${foundProvice.name}`
  }
  return address
}

const stateChip: Record<JobOffersStateEnum, { color: string; text: string }> = {
  [JobOffersStateEnum.DRAFT] : { color: '', text: 'Borrador' },
  [JobOffersStateEnum.ACTIVE]: { color: 'success', text: 'Activo' },
  [JobOffersStateEnum.FINISHED]: { color: 'primary', text: 'Finalizado' },
  [JobOffersStateEnum.SUSPENDED]: { color: 'warning', text: 'Suspendido' },
  [JobOffersStateEnum.CANCELED] : { color: 'error', text: 'Cancelado' },
};

const onEdit = (item : JobOffer) => {
  if (item.state.key === JobOffersStateEnum.FINISHED) {
    modalConfirmation({
      title: 'Editar oferta laboral',
      content: 'No se puede editar una oferta laboral finalizada.',
    })
    return
  }
  router.push({
    path : '/bolsa-laboral-panel/offers/update/'+item.slug,
  })
}

const onDelete = async (item: JobOffer) => {
  if (!item.id) {
    ToastService.error('No se ha podido obtener la oferta laboral a eliminar')
    return
  }
  const confirm = await modalConfirmation({
    title: 'Eliminar oferta laboral',
    content: '¿Estás seguro de que deseas eliminar esta oferta laboral?',
  })
  if (!confirm) return
  loadingTable.value = true
  JobOpportunitiesJobOfferService.delete(item.id)
    .then(({success,message}) => {
      if (!success) {
        ToastService.error(message)
        return
      }
      ToastService.success('Oferta eliminada con éxito.')
      emit('reload')
    })
    .catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loadingTable.value = false
    })
}

const changeState = async (item: JobOffer, state: JobOffersStateEnum) => {
  const note = state === JobOffersStateEnum.FINISHED ? `<span style=" font-size: 0.7rem;color: #f99d9d;line-height: 0.1rem;">Nota: Si cambia a "Finalizado" no podrá volver a editar  o cambiar de estado la oferta laboral.</span>` : ''
  const confirm = await modalConfirmation({
    title: 'Cambiar estado de oferta laboral',
    content: `¿Estás seguro de que desea cambiar el estado de la oferta laboral?<br>
    ${note}`,
  })
  if (!confirm) return

  if (!item.id) {
    ToastService.error('No se ha podido obtener la oferta laboral')
    return
  }
  loadingTable.value = true
  JobOpportunitiesJobOfferService.changeState(item.id, state)
    .then(({success,message}) => {
      if (!success) {
        ToastService.error(message)
        return
      }
      ToastService.success('Estado de la oferta cambiado con éxito.')
      emit('reload')
    })
    .catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loadingTable.value = false
    })
}

const onPreview = (offer: JobOffer) => {
  offerSelected.value = offer
  modal.value.preview = true
}

const onShare = (item : JobOffer) =>  {
  offerSelected.value = item
  modal.value.shared = true
}

const onChangePage = (page: number) => {
  console.log('onChangePage', page)
  props.pagination.currentPage = page
  emit('setPage', page)
}
const states = [
  { key: JobOffersStateEnum.DRAFT, text: 'Cambiar a Borrador', icon: 'mdi-file-document-edit' },
  { key :JobOffersStateEnum.ACTIVE, text: 'Activar Oferta', icon: 'mdi-bell-ring' },
  { key: JobOffersStateEnum.FINISHED, text: 'Finalizar Oferta', icon: 'mdi-check-circle' },
];
</script>
<template>
  <VCard class="p-0 m-0">
      <VRow>
        <CustomTable
          style="max-width: 100%;"
          :config="{
            index:false,
            loading: loadingTable,
            styles: {
              headerColor: 'primary'
            },
            pagination: {
              peerPage:pagination.itemsPerPage,
              totalItems : pagination.totalItems,
              usePaginationServer : true,
            }
          }"
          :header="headers"
          :items="props.results"
          @update:currentPage="onChangePage($event)"
      >
        <template #state="{item}">
          <VChip
              :color="stateChip[item.state.key as JobOffersStateEnum].color"
              size="x-small"
              label
            >
              {{ stateChip[item.state.key as JobOffersStateEnum].text }}
            </VChip>
        </template>
        <template #title="{item}">
          <div style="width: 15rem;">
            <span>
              {{ item.title }}
            </span>
          </div>
        </template>
        <template #salary="{item}">
          <p style="margin:0;padding:0">
            {{ item.salary }} {{ item.salaryCurrency ? item.salaryCurrency : '' }}
          </p>
        </template>
        <template #locationName="{item}">
          <p style="margin:0;padding:0">
            {{ item.locationName }}
          </p>
          <span v-if="item.province !== '' && item.department !== ''">
            {{ getAddress({
              address: item.address,
              department: item.department,
              province: item.province
            })}}
          </span>
        </template>
        <template #actions="{item}">
          <VMenu :location="'bottom'">
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props"></v-btn>
            </template>
            <v-list>
              <VListSubheader>Acciones</VListSubheader>
              <VListItem @click="onPreview(item as JobOffer)">
                <VListItemTitle>
                  <VIcon start>mdi-eye</VIcon>
                  Previsualizar
                </VListItemTitle>
              </VListItem>
              <VListItem @click="$router.push({
                path : '/bolsa-laboral-panel/postulations',
                query: {
                  offerId: item.id,
                  companyId: item.companyId,
                }
              })">
                <VListItemTitle>
                  <VIcon start>
                    mdi-account-multiple
                  </VIcon>
                  Postulantes
                </VListItemTitle>
              </VListItem>

              <VListItem @click="onShare(item as JobOffer)">
                <VListItemTitle>
                  <VIcon start>mdi-share-variant</VIcon>
                  Compartir
                </VListItemTitle>
              </VListItem>

              <VListItem @click="onEdit(item as JobOffer)">
                <VListItemTitle>
                  <VIcon start>mdi-pencil</VIcon>
                  Editar
                </VListItemTitle>
              </VListItem>
              <VListItem @click="onDelete(item as JobOffer)">
                <VListItemTitle>
                  <VIcon start>mdi-trash-can</VIcon>
                  Eliminar
                </VListItemTitle>
              </VListItem>
              <template v-if="item.state.key !== JobOffersStateEnum.FINISHED">
                <VDivider class="my-2" />
                <VListSubheader>Estados</VListSubheader>
                <VListItem 
                  v-for="(aux) in states.filter((aux) => aux.key !== item.state.key)"
                  @click="changeState(item as JobOffer, aux.key)"
                >
                  <VListItemTitle>
                    <VIcon start>
                      {{ aux.icon }}
                    </VIcon>
                    {{ aux.text }}
                  </VListItemTitle>
                </VListItem>
                </template>
            </v-list>
          </VMenu>
        </template>
      </CustomTable>
      </VRow>
    </VCard>
     <SharedCopyOfferModal
      v-if="modal.shared && offerSelected"
      :modelValue="modal.shared"
      :offer-slug="offerSelected.slug"
      :offer-title="offerSelected.title"
      @update:modelValue="modal.shared; offerSelected = null"
    />
    <ModalPreview
      v-if="offerSelected"
      :show="modal.preview"
      :slug="offerSelected.slug"
      @close="offerSelected = null"
    />
</template>
