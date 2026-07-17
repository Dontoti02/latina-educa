<script setup lang="ts">
defineProps<{
  page?: number
  pageSize?: number
  total?: number
  disabled?: boolean
}>()

const emit = defineEmits<{
  (e: 'updateWindow', params: { page: number }): void
}>()

const handlePageChange = (page: number) => {
  emit('updateWindow', { page })
}
</script>

<template>
  <VFadeTransition>
    <div
      v-if="page !== undefined && total !== undefined && pageSize !== undefined"
      class="d-flex justify-center"
    >
      <VPagination
        :model-value="page"
        :length="Math.ceil(total / pageSize)"
        :total-visible="5"
        rounded="circle"
        :disabled="disabled"
        @update:model-value="handlePageChange"
        @next="handlePageChange(page + 1)"
        @prev="handlePageChange(page - 1)"
      />
    </div>
  </VFadeTransition>
</template>

<style></style>
