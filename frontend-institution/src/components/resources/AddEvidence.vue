<script setup lang="ts">
import DialogScaffold from '@/common/components/confirm-modal/DialogScaffold.vue';
import { SessionStore } from '@/common/store';

// Initial
withDefaults(defineProps<{
  loading?: boolean
  disabled?: boolean
}>(), {
  loading: false,
  disabled: false,
})

const emit = defineEmits<{
  (e: 'addFiles', files: any[]): void
  (e: 'addLink', link: string): void
}>()

const session = SessionStore()

const linkModal = ref(false)
const link = ref('')
const fileInput = ref<HTMLInputElement | null>(null)

const menuItems = ref([
  { id: 1, title: 'Archivo', icon: 'tabler-file' },
  { id: 2, title: 'Enlace', icon: 'tabler-link' },
])

// Actions
const openInputFile = () => {
  if (fileInput.value)
    fileInput.value.click()
}

const addFiles = (event: any) => {
  if (event.target.files.length > 0) {
    // const user = session.get().user
    // if (user !== null && session.get().user?.maximumFileSizeToUpload !== undefined) {
    //   const maxSizeInBytes = user.maximumFileSizeToUpload * 1024 * 1024

    //   for (let i = 0; i < event.target.files.length; i++) {
    //     const file = event.target.files[i]
    //     if (file.size > maxSizeInBytes) {
    //       ToastService.error(`El archivo ${file.name} excede el tamaño máximo permitido de ${user.maximumFileSizeToUpload} MB`)

    //       return
    //     }
    //   }
    // }
    emit('addFiles', event)
  }
}

const clearFileInput = () => {
  if (fileInput.value)
    fileInput.value.value = ''
}

const handleClick = (id: number) => {
  if (id === 1)
    openInputFile()
  else
    linkModal.value = true
}

defineExpose({
  clearFileInput,
})
</script>

<template>
  <VBtn
    variant="outlined"
    style="text-transform: none;"
    width="100%"
    :loading="loading"
    :disabled="disabled"
  >
    <slot>
      <VIcon
        icon="tabler-plus"
        class="mr-2"
      />
      Añadir evidencia
    </slot>

    <VMenu activator="parent">
      <VList>
        <VListItem
          v-for="(item) in menuItems"
          :key="item.id"
          :value="item.id"
          class="px-0 py-0 my-0 mx-0 text-primary"
          @click="handleClick(item.id)"
        >
          <VListItemTitle class="d-flex align-center gap-2 py-1 px-2">
            <VIcon :icon="item.icon" />
            {{ item.title }}
          </VListItemTitle>
        </VListItem>
      </VList>
    </VMenu>
    <input
      ref="fileInput"
      type="file"
      style="display: none;"
      multiple
      @change="addFiles"
    >
    <VDialog
      v-model="linkModal"
      persistent
      width="350"
    >
      <DialogScaffold @close="linkModal = false">
        <template #title>
          Añadir enlace
        </template>
        <div style="color: var(--primary-sem-grey-color);">
          <VTextField
            v-model="link"
            label="Enlace"
            variant="underlined"
            clearable
          />
        </div>
        <template #actions>
          <VBtn
            variant="text"
            color="primary"
            @click=";linkModal = false;link = ''"
          >
            Cancelar
          </VBtn>
          <VBtn
            :disabled="!link.trim()"
            variant="flat"
            color="primary"
            @click=";emit('addLink', link);linkModal = false;link = ''"
          >
            Aceptar
          </VBtn>
        </template>
      </DialogScaffold>
    </VDialog>
  </VBtn>
</template>
