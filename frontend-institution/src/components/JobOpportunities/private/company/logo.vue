<script setup lang="ts">
import { ToastService } from '@/common/util/toast.service'
import { JobOpportunitiesCompanyService } from '@/services/job-opportutines/company'
import { ImageUtils } from '@/utils/images'

const fileInput = ref<HTMLInputElement | null>(null)
const loading = ref<boolean>(false)

const props = defineProps<{
  logo?: string | null
}>()

const emmit = defineEmits<{
  (e: 'update:logo', logo: string | null): void
}>()

const openInputFile = () => {
  if (fileInput.value)
  fileInput.value.click()
}

const clearFileInput = () => {
  if (fileInput.value)
    fileInput.value.value = ''
}

const validationFile = (event:any) => {
  if (!event.target || !event.target.files) {
    ToastService.error('No se ha seleccionado ningún archivo')
    return
  }
  if (!fileInput.value || !fileInput.value.files || fileInput.value.files.length === 0) {
    ToastService.error('No se ha seleccionado ningún archivo')
    return
  }
  const file = event.target.files[0]
  if (!file.type.startsWith('image/')) {
    ToastService.error(`El archivo ${file.name} no es una imagen válida`)
    return
  }
  const maxSizeInBytes = 2 * 1024 * 1024
  if (file.size > maxSizeInBytes) {
    ToastService.error(`El archivo ${file.name} excede el tamaño máximo permitido de 2 MB`)
    return
  }
}

const deleteLogo = async () => {
  loading.value = true
  try {
    await JobOpportunitiesCompanyService.deleteLogo()
    emmit('update:logo', null)
    ToastService.success('Logo eliminado correctamente.')
  } catch (error) {
    ToastService.error((error as Error).message || 'Error al eliminar el logo')
  } finally {
    loading.value = false
  }
}

const changeLogo = (action: 'change-photo' | 'delete-photo') => {
  if (action === 'change-photo') {
    openInputFile()
    return
  }
  deleteLogo()
}

const addPhoto = async (event: any) => {
  validationFile(event)
  const file = event.target.files[0]
  loading.value = true
  try {
    const response = await JobOpportunitiesCompanyService.uploadLogo(file)
    emmit('update:logo', response.data)
    ToastService.success('Logo actualizado correctamente')
  } catch (error) {
    ToastService.error((error as Error).message || 'Error al actualizar el logo')
  } finally {
    loading.value = false
    clearFileInput()
  }
}

</script>
<template>
  <div class="flex-shrink-0 mt-n2 mx-sm-0 mx-auto">
    <div
      class="d-flex justify-end"
      style="position: relative;width: 120px"
    >
      <VAvatar
        size="90"
        class="mr-2 user-profile-img justify-end"
      >
        <template v-if="loading">
          <VChip
            variant="tonal"
            class="w-100 h-100 d-flex align-center justify-center"
            color="primary"
          >
            <VProgressCircular
              indeterminate
              color="primary"
              width="3"
            />
          </VChip>
        </template>
        <template v-else>
          <img
            v-if="props.logo"
            :src="ImageUtils.getUrlImage(props.logo)"
            alt="avatar"
            style="width: 100%; object-fit: cover;"
          >
          <VChip
            v-else
            variant="tonal"
            class="w-100 h-100 d-flex align-center justify-center"
            color="primary"
          >
            <VIcon
              icon="tabler-user"
              size="xx-large"
            />
          </VChip>
        </template>
      </VAvatar>
      <VMenu>
        <template #activator="{ props }">
          <VBtn
            style="position: absolute;right: 5px;bottom: 5px;"
            v-bind="props"
            icon="tabler-camera"
            density="compact"
            color="white"
          />
        </template>

        <VList density="compact">
          <VListItem
            v-for="(item, i) in [
              { title: 'Cambiar', action: 'change-photo' },
              { title: 'Eliminar', action: 'delete-photo' },
            ]"
            :key="i"
            class="px-0 mx-0 my-0 py-0"
             @click="changeLogo(item.action as 'change-photo' | 'delete-photo')"
          >
             {{ item.title }}
          </VListItem>
        </VList>
      </VMenu>
      <input
        ref="fileInput"
        type="file"
        style="display: none;"
        @change="addPhoto"
      >
    </div>
  </div>
</template>
<style lang="scss">
  .user-profile-header-banner {
    img {
      block-size: 200px;
      inline-size: 100%;
      object-fit: cover;
    }
  }

  .user-profile-header {
    margin-block-start: -1rem;

    .user-profile-img {
      border: 5px solid;
    }
  }

  .v-theme--light .user-profile-header .user-profile-img {
    border-color: #fff;
  }

  .v-theme--dark .user-profile-header .user-profile-img {
    border-color: #2f3349;
  }
</style>
