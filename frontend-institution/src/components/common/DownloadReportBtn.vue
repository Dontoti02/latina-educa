<script setup lang="ts">
const props = withDefaults(defineProps<{
  disabled?: boolean
  loading?: boolean
  text?: string
  variant?: string
  density?: string
}>(), {
  disabled: false,
  loading: false,
  text: 'Descargar',
  variant: 'flat',
  density: 'default',
})

const emit = defineEmits<{
  (e: 'download', type: 'xlsx' | 'pdf'): void
}>()

const typeDownload = [
  { title: 'Excel', value: 'xlsx' },
  { title: 'PDF', value: 'pdf' },
]
</script>

<template>
  <VMenu>
    <template #activator="{ props }">
      <VBtn
        class="text-none w-100"
        v-bind="props"
        prepend-icon="mdi-download"
        :text="text"
        :loading="loading"
        :disabled="disabled"
        :variant="variant"
        :density="density"
      />
    </template>
    <VList>
      <VListItem
        v-for="(item, index) in typeDownload"
        :key="index"
        :value="index"
      >
        <VListItemTitle @click="emit('download', item.value)">
          {{ item.title }}
        </VListItemTitle>
      </VListItem>
    </VList>
  </VMenu>
</template>
