<template>
  <VDialog :model-value="props.modelValue" max-width="500" @update:modelValue="onDialogUpdate"
    persistent
    transition="dialog-bottom-transition"
  >
    <VCard>
      <VCardTitle class="d-flex justify-space-between align-center">
         <VIcon start>mdi-share-variant</VIcon><span>Compartir Oferta</span>
        <VBtn icon @click="closeModal" variant="text">
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VCardTitle>

      <VCardText>
        <VTextField
          v-model="props.offerSlug"
          label="Enlace de la oferta"
          readonly
          append-inner-icon="mdi-content-copy"
          @click:append-inner="copyToClipboard"
          class="mb-4"
        />

        <VAlert
          v-if="copied"
          type="success"
          dense
          border="start"
          color="success"
          class="mt-2"
        >
          ¡Copiado al portapapeles!
        </VAlert>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{
  modelValue: boolean
  offerTitle: string
  offerSlug: string | number
}>()

const emit = defineEmits(['update:modelValue'])
const copied = ref(false)
const baseUrl = window.location.origin
const offerUrl = ref(`${baseUrl}/bolsa-laboral/${props.offerSlug}`)

watch(() => props.offerSlug, () => {
  offerUrl.value = `${baseUrl}/bolsa-laboral/${props.offerSlug}`
})

function copyToClipboard() {
  navigator.clipboard.writeText(offerUrl.value).then(() => {
    copied.value = true
    setTimeout(() => (copied.value = false), 2000)
  })
}

function closeModal() {
  emit('update:modelValue', false)
}

function onDialogUpdate(val: boolean) {
  emit('update:modelValue', val)
}
</script>
