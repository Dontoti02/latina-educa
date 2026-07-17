<script setup lang="ts">
import { Pagination } from '@/modules/app/domain/pagination';
import { computed } from 'vue';

interface PaginationProps {
    pagination : Pagination,
    config? : {
        totalVisible:number
        visible:boolean
        disabled:boolean
    }
}

const props = withDefaults(defineProps<PaginationProps>(),  {
    config:() => ({
      totalVisible:10,
      visible:true,
      disabled:false
    }),
    pagination:() => ({
      page: 1,
      pages: 10,
      total:100,
    })
})

const label = computed(() =>  {
  const { page, total,pages } = props.pagination
  const peerPages = Math.round(total/pages)
  if (page === 1)
    return `1  al ${(page * peerPages)}  de ${total}`

  return `${(((page - 1) * peerPages) + 1)}  al ${(page* peerPages)}  de ${total}` 
})

const emit = defineEmits<{
  (e: 'update', params: { page: number }): void
}>()

const handlePageChange = (page: number) => {
  emit('update', { page })
}

</script>
<template>
     <div v-if="props.config.visible"
      class="px-4 py-3"
      style="background-color: var(--bg-pagination);border-radius: 10px"
     >
        <v-row class="justify-space-between align-center">
          <v-col cols="4" class="d-flex justify-start py-0 my-0">
            Mostrando {{ label }}
          </v-col>
            <v-col cols="8" class="d-flex justify-end py-0 my-0">
              <v-pagination
                  rounded="circle"
                  :model-value="props.pagination.page"
                  :length="props.pagination.pages"
                  :total-visible="props.config.totalVisible"
                  :disabled="props.config.disabled"
                  @update:model-value="handlePageChange"
                  @next="handlePageChange(props.pagination.page + 1)"
                  @prev="handlePageChange(props.pagination.page - 1)"
              ></v-pagination>
            </v-col>
        </v-row>
    </div>
</template>