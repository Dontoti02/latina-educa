<script setup lang="ts">
import type { ImportationType } from '@/models/importations';
import { ImportationsService } from '@/services/importations.service';
import ProgressView from './partials/ProgressView.vue';
import SelectFile from './partials/SelectFile.vue';

defineProps<{
  importationType?: ImportationType
}>()

// Emits
const emit = defineEmits<{
  (e: 'back'): void
}>()

// Variables
const checkoutSteps = [
  {
    title: 'Selecciona',
    icon: 'tabler-hand-click',
  },
  {
    title: 'Sube tu archivo',
    icon: 'tabler-upload',
  },
]

const currentStep = ref(0)
const loading = ref(true)

// Methods
const getCurrentImport = () => {
  loading.value = true
  ImportationsService.getCurrentImport()
    .then(response => {
      if (response.data)
        currentStep.value = 1
    }).finally(() => {
      loading.value = false
    })
}

onMounted(() => {
  getCurrentImport()
})
</script>

<template>
  <VCard>
    <VCardText>
      <VCard elevation="0">
        <VRow>
          <VCol class="d-flex align-center">
            <VBtn
              variant="tonal"
              icon="tabler-chevron-left"
              class="mr-2"
              density="compact"
              rounded="sm"
              @click="emit('back')"
            />

            <div class="text-h4">
              Importar {{ importationType?.title.toLowerCase() }}
            </div>
          </VCol>
        </VRow>
      </VCard>
    </VCardText>
    <VCardText>
      <!-- 👉 Stepper -->
      <AppStepper
        v-model:current-step="currentStep"
        class="checkout-stepper"
        :items="checkoutSteps"
        :direction="$vuetify.display.smAndUp ? 'horizontal' : 'vertical'"
        style="pointer-events: none; user-select: none;"
      />
    </VCardText>
    <VDivider />
    <VCardText>
      <!-- 👉 stepper content -->
      <VWindow
        v-model="currentStep"
        class="disable-tab-transition"
      >
        <VWindowItem>
          <SelectFile
            :importation-type="importationType"
            @file-uploaded="currentStep++"
          />
        </VWindowItem>

        <VWindowItem>
          <ProgressView
            :importation-type="importationType"
            @upload-finished="currentStep++"
          />
        </VWindowItem>
      </VWindow>
    </VCardText>
    <VOverlay
      v-model="loading"
      contained
      class="d-flex justify-center align-center"
      persistent
    >
      <VProgressCircular indeterminate />
    </VOverlay>
  </VCard>
</template>
