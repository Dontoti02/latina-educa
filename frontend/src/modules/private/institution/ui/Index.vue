<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import institution from '../services/institution';
import { Institution } from '../domain/Institution';
import AppContent from '@/modules/app/pages/AppContent.vue'
import CustomTable from '@/common/components/Table.vue'
import Search from '@/common/components/Search.vue'
import {Pagination,PaginationFilters, Sort} from '@/modules/app/domain/pagination'
import { modalConfirmation, modalError } from '@/common/util/modal.service';
import MForm from './MForm.vue';
import MTrash from './modals/ModalTrash.vue';
import MSubscription from './MSubscription.vue';
import { useRouter } from 'vue-router';
import ModalModules from './modals/ModalModules.vue';
const institutionList = ref<Institution[]>()
const institutionSelected = ref<Institution|undefined>()

const loading = ref(false)
const paginationConfig = ref<Pagination>()
const filters = ref<PaginationFilters>({
  items:20
})
const heightTableRef = ref<number>(0)

const modalcreate = ref(false)
const modalSubscription = ref(false)
const modalTrash = ref(false)
const modalModules = ref(false)

const list = async () => {
  try {
    loading.value = true
    const {data} = await institution.all(filters.value)
    const {items , pagination } = data
    paginationConfig.value = pagination
    institutionList.value = items
  } catch (error) {
    modalError((error as any).message)
  } finally {
    loading.value = false
  }

}

const header = ref([
  {
    key:'name',
    value : 'Nombre'
  },
  {
    key: 'ruc',
    value : 'Ruc'
  },
  {
    key : 'isActive',
    value : 'Estado'
  }, {
    key:'createdAt',
    value:'Fecha de creación'
  }, {
    key : 'endDate',
    value : 'Fin Suscripción'
  }
])

const router = useRouter()

const edit = (item:Institution) => {
  institutionSelected.value = item
  modalcreate.value = true
}

const management = (item:Institution) => {
  router.push({
    name:'managementInstitution',
    params : {
      id:item.id
    }
  })
}

const expiration = (item:Institution) => {
  institutionSelected.value = item
  modalSubscription.value = true
}

const handleInput = async (search:string|null) => {
  filters.value.search = search
  await list()
}

const fetch  = async ({page}:{page:number}) => {
  filters.value.page = page
  await list()
}

const fetchWithSort = async (sort?:Sort[]) => {
  filters.value.sort = sort
  await list()
}


const onSubmitInstitution = ({body,createdAt}:{
  body:Institution,
  createdAt:boolean
}) => {
  if (!institutionList.value) institutionList.value = []

  if (createdAt) {
    institutionList.value.unshift(body)
  } else  {
    const index = institutionList.value.findIndex(item => item.id === body.id);
    if (index !== -1) {
      institutionList.value[index] = body;
    }
  }
  modalcreate.value = false
}

const toggleActivation = async (item: Institution) => {
  const confirm = await modalConfirmation({
    title: item.isActive ? 'Desactivar' : 'Activar',
    content: `¿Seguro que desea ${item.isActive ? 'desactivar' : 'activar'} la institución ${item.name}?`
  });

  if(confirm) {
    loading.value = true
    institution.toogleStatus(item.id).then(() => {
      list()
    }).catch((error) => {
      modalError(error)
      loading.value = false
    })
  }
}

const confirmDelete = async (institution : Institution) => {
  institutionSelected.value = institution
  modalTrash.value = true
}

const getHeightInPixels = () => {
  const pixelHeader = 80;
  const pixelstitle = 96 + 56;
  const pixelsPagination = 60;
  const heightTable =  (window.innerHeight - (pixelHeader + pixelstitle + pixelsPagination))
  heightTableRef.value = heightTable
}

const seeModules = (item: Institution) => {
  modalModules.value = true
  institutionSelected.value = item
}

const eventResize = () => {
  getHeightInPixels()
}

onMounted(async () => {
  await list()
  eventResize()
  window.addEventListener('resize', eventResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', eventResize);
});

</script>

<template>
  <AppContent> 
    <template #title>
     <div class="py-2">
       <v-icon>mdi-cube-unfolded</v-icon>&nbsp;Instituciones
     </div>
    </template>
    <v-row  class="flex-grow-0 flex-shrink-1 align-content-center py-4">
      <v-col cols="12" sm="2">

      </v-col>
      <v-col cols="12" sm="10">
        <v-row>
          <v-col cols="12" sm="11">
              <Search
                :label="'Buscar institución'"
                :loading="loading"
                :value="filters.search"
                @input="handleInput($event)"
              />
          </v-col>
          <v-col cols="12" sm="1">
            <v-btn 
              color="indigo" 
              :variant="'tonal'"
              block
              @click="modalcreate = true"
            >
              <v-icon>mdi mdi-plus</v-icon>
            </v-btn>
          </v-col>
        </v-row>
      </v-col>
    </v-row>
    <CustomTable
      v-if="institutionList"
      :table="{
        config : {
          sort:true,
          height : heightTableRef,
        },
        header:header,
        body:institutionList,
        actions : [
          {
            title: 'Editar',
            callback: edit,
            icon:'mdi-pencil-outline'
          },
          {
            title: 'Gestionar',
            callback: management,
            icon:'mdi-hexagon-multiple-outline'
          },
          {
            title: 'Activar/Desactivar',
            callback: toggleActivation,
            icon:'mdi-power'
          },
          {
            title: 'Configurar suscripción',
            callback: expiration,
            icon:'mdi-calendar-check'
          },
          {
            title: 'Eliminar',
            callback:confirmDelete,
            icon : 'mdi-trash-can-outline'
          },
          {
            title: 'Ver Módulos',
            callback : seeModules,
            icon: 'mdi-view-list'
          }
        ]
      }"
      :pagination="paginationConfig"
      :overlay="loading"
      @fetch="fetch"
      @sort="fetchWithSort"
    >
      <template #isActive="{item}">
        <v-chip
          size="small"
          :color="item.isActive ? 'success' : 'error'"
          variant="tonal"
          density="comfortable"
        >
          {{ item.isActive ? 'Activo' : 'Deshabilitado' }}
        </v-chip>
      </template>
    </CustomTable>
    
    <MForm
      v-if="modalcreate"
      :show="modalcreate"
      @close="modalcreate = false;institutionSelected = undefined"
      @submit="onSubmitInstitution($event)"
      :item="institutionSelected"
    />
    <MSubscription
      v-if="institutionSelected && modalSubscription"
      :show="modalSubscription"
      @close="modalSubscription = false;institutionSelected = undefined"
      :item="institutionSelected"
      @submit="list()"
    />
    <MTrash 
      v-if="modalTrash"
      :show="modalTrash"
      @close="modalTrash = false;institutionSelected = undefined"
      :item="institutionSelected"
      @submit="list();modalTrash = false"
    />
    <ModalModules
      v-if="institutionSelected"
      :show="modalModules"
      @close="institutionSelected = undefined;modalModules = false"
      :item="institutionSelected"
    />
  </AppContent>
</template>