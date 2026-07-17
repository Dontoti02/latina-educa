<script setup lang="ts">
import type { Summary } from '@/models/landing'

defineProps<{
  summary: Summary[]
}>()

const colors = ref(['primary', 'info', 'success', 'warning', 'error', 'secondary'])

const getColors = (index: number) => {
  return colors.value[index % colors.value.length]
}
</script>

<template>
  <VContainer class="px-md-16 px-0 py-5">
    <VCard
      elevation="0"
      color="#ffffff00"
      style="width: 100%;"
      class="d-flex justify-center"
    >
      <VCardText style="max-width: 90rem;">
        <VRow class="py-6">
          <VCol
            v-for="(item, index) in summary"
            :key="`summaryItem-${index}`"
            cols="12"
            sm="6"
            md="3"
          >
            <VCard
              elevation="0"
              color="#ffffff00"
              :style="[`border: 1px solid rgba(var(--v-theme-${getColors(index)}));`]"
            >
              <VCardText class="text-center py-6">
                <div class="d-flex justify-center mb-4">
                  <VIcon
                    size="70"
                    :icon="`tabler-${item.icon}`"
                    :color="getColors(index)"
                  />
                </div>
                <div class="text-h3">
                  {{ item.value }}
                </div>
                <div class="text-body">
                  {{ item.label }}
                </div>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
  </VContainer>
</template>
