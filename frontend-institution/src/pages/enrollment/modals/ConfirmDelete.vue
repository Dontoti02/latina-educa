<script setup lang="ts">
import { watch } from 'vue';
import ModalBasic from '@/common/components/Modal.vue';

// Initial
const props = 
  defineProps<{
    show: boolean,
  }>();

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'delete'): void
}>()

  const confirmDelete = () => {
  emit('delete')
}

</script>
<template>
  <ModalBasic
    :visible="props.show"
    is-persistent
    width="500"
    is-scrollable
  >
    <VCard>
      <VToolbar>
        <VToolbarTitle>Confirmar Eliminación</VToolbarTitle>
        <VSpacer />
        <VBtn
          icon
          @click="emit('close')"
        >
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VToolbar>
      <VCardText class="px-4 pb-4">
        <p>¿Está seguro de que desea eliminar esta consulta?</p>
      </VCardText>
      <VCardActions>
        <div class="d-flex gap-4 justify-end w-100">
          <VBtn
            class="px-4"
            color="primary"
            variant="outlined"
            @click="emit('close')"
          >
            Cancelar
          </VBtn>
          <VBtn
            class="px-4"
            color="error"
            variant="elevated"
            @click="confirmDelete"
          >
            Eliminar
          </VBtn>
        </div>
      </VCardActions>
    </VCard>
  </ModalBasic>
</template>