<script setup lang="ts">
import type { SessionDTO } from '@/models/login'
import congoImg from '@images/illustrations/congo-illustration.png'

const props = defineProps<{
  user: SessionDTO | null
}>()

const getDate = computed(() => {
  const date = new Date()
  const options: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }

  return date.toLocaleDateString('es-ES', options)
})

const getName = computed(() => {
  const arr = props.user!.names.split(' ')
  return arr[arr.length - 1].toLowerCase()
})
</script>

<template>
  <VCard>
    <VRow no-gutters>
      <VCol cols="8">
        <VCardText>
          <h4 class="text-h4 font-weight-medium text-primary mb-1 text-capitalize">
            Hola {{ getName }} 👋🏻
          </h4>
          <h6 class="text-lg text-no-wrap font-weight-medium">
            Bienvenido nuevamente<br>a la plataforma
          </h6>
          <p class="mb-2">
            {{ getDate }}
          </p>
        </VCardText>
      </VCol>

      <VCol cols="4">
        <VCardText class="pb-0 px-0 position-relative h-100">
          <VImg
            :src="congoImg"
            height="147"
            class="congo-john-img w-100"
          />
        </VCardText>
      </VCol>
    </VRow>
  </VCard>
</template>

<style lang="scss" scoped>
.congo-john-img {
  position: absolute;
  inset-block-end: 0;
  inset-inline-end: 1.25rem;
}
</style>
