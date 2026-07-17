<script setup lang="ts">
import { ToastService } from '@/common/util/toast.service'
import type { CourseContentResource } from '@/models/courses'
import { FileService } from '@/services/file.service'
import { getIcon, getTypeResource } from '@/utils/resources'

// Initial
const props = withDefaults(defineProps<{
  contentResource: CourseContentResource
  removable?: boolean
  progress?: number
}>(), {
  removable: false,
})

const emit = defineEmits<{
  (e: 'remove', id: number): void
}>()

// Computed
const getType = () => {
  return getTypeResource(props.contentResource.metadata.extension.toLowerCase())
}

// Actions
const downloadResource = () => {
  FileService.downloadFile(props.contentResource.uuid).then(response => {
    const blob = new Blob([response.data], { type: response.headers['content-type'] })

    const anchor = document.createElement('a')

    anchor.href = URL.createObjectURL(blob)
    anchor.target = '_blank'
    anchor.download = props.contentResource.metadata.originalName
    anchor.click()
    anchor.remove()
  }).catch(error => {
    ToastService.error(error)
  })
}
</script>

<template>
  <VCard
    class="px-2 py-2 gap-2 course-content-resource"
    variant="outlined"
    :loading="props.progress !== undefined"
    @click.stop="downloadResource"
  >
    <template #loader="{ isActive }">
      <VProgressLinear
        :active="isActive"
        color="primary"
        height="3"
        :model-value="props.progress"
      />
    </template>
    <VRow
      align="center"
      class="px-3"
    >
      <VCol
        cols="3"
        class="px-0 d-flex justify-center align-center"
      >
        <VIcon
          size="x-large"
          start
          :icon="getIcon(getType())"
        />
      </VCol>
      <VCol
        :cols="removable ? 7 : 9"
        class="px-0"
      >
        <div
          style="
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;"
        >
          <a class="text-body-1 font-weight-bold">
            {{ contentResource.metadata.originalName }}
            <VTooltip
              activator="parent"
              location="top"
            >{{ contentResource.metadata.originalName }}</VTooltip>
          </a>
        </div>
        <div class="text-body-2">
          {{ getType() }}
        </div>
      </VCol>
      <VCol
        v-if="removable"
        cols="2"
        class="px-0 d-flex justify-end"
      >
        <VBtn
          icon="tabler-x"
          color=""
          variant="text"
          rounded="sm"
          density="compact"
          @click.stop="emit('remove', contentResource.id!)"
        />
      </VCol>
    </VRow>
  </VCard>
</template>

<style lang="css">
.course-content-resource:hover {
  border-color: rgb(var(--v-theme-primary)) !important;
  box-shadow: 0 0 10px 0 rgba(var(--v-theme-primary), 0.5);
  color: rgb(var(--v-theme-primary)) !important;
  cursor: pointer;
}

.course-content-resource:hover a,
.course-content-resource:hover div {
  color: rgb(var(--v-theme-primary)) !important;
}
</style>
