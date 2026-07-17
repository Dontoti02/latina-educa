<script setup lang="ts">
import type { Careers } from '@/models/landing'

defineProps<{
  careers: Careers
}>()
</script>

<template>
  <div
    class="rounded-xl"
    style="background: white;"
  >
    <VContainer class="px-md-16 py-5">
      <div class="d-flex justify-center align-center flex-column mb-8 mt-5 px-md-0 px-10">
        <VChip
          label
          color="primary"
          class="mb-4"
        >
          Carreras
        </VChip>
        <div class="text-h4 position-relative mb-1">
          <div class="section-title">
            {{ careers.title }}
          </div>
        </div>
        <div>
          {{ careers.description }}
        </div>
      </div>
      <VCard
        elevation="0"
        style="width: 100%;"
        class="d-flex justify-center"
      >
        <VCardText style="max-width: 90rem;">
          <VRow>
            <VCol
              v-for="(item, index) in careers.arrCareers"
              :key="`course-${index}`"
              cols="12"
              sm="6"
              md="4"
            >
              <VCard class="py-10">
                <div class="d-flex justify-center">
                  <VIcon
                    size="70"
                    :icon="`tabler-${item.icon}`"
                    color="primary"
                  />
                </div>
                <div
                  class="text-h4 text-center mt-8 mx-10"
                  style="height: 60px;"
                >
                  {{ item.name }}
                </div>
                <VList style="min-height: 260px;">
                  <VListItem
                    v-for="(listItem, index) in item.courses"
                    :key="`listItem-${index}`"
                    class="px-10"
                  >
                    <template #prepend>
                      <VIcon
                        color="primary"
                        icon="tabler-circle-check-filled"
                      />
                    </template>
                    <div class="text-h6">
                      {{ listItem }}
                    </div>
                  </VListItem>
                </VList>
              </VCard>
            </VCol>
          </VRow>
        </VCardText>
      </VCard>
    </VContainer>
  </div>
</template>

<style scoped>
.section-title::after{
    position: absolute;
    background: url(data:image/png;base64,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) no-repeat left bottom;
    background-size: contain;
    block-size: 100%;
    content: "";
    inline-size: 120%;
    inset-block-end: 0;
    inset-inline-start: -12%;
    height: 0.8rem;
    bottom: -0.3rem;
}

.section-title{
  font-weight: 800;
}
</style>
