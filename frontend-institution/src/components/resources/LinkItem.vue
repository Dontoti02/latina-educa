<script setup lang="ts">
import type { CourseContentLink } from '@/models/content'

// Initial
const props = withDefaults(defineProps<{
  contentLink: CourseContentLink
  removable?: boolean
}>(), {
  removable: false,
})

const emit = defineEmits<{
  (e: 'remove', id: number): void
}>()

const link = ref<HTMLAnchorElement | null>(null)

// Url info
const websiteName = () => {
  try {
    const url = new URL(props.contentLink.url)

    return url.hostname
  }
  catch {
    return props.contentLink.url
  }
}
</script>

<template>
  <VCard
    class="px-2 py-2 gap-2 course-content-resource"
    variant="outlined"
    @click.stop="link?.click()"
  >
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
          icon="tabler-link"
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
            {{ websiteName() }}
            <VTooltip
              activator="parent"
              location="top"
            >{{ contentLink.url }}</VTooltip>
          </a>
        </div>
        <div class="text-body-2">
          url
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
          @click.stop="emit('remove', contentLink.id!)"
        />
      </VCol>
    </VRow>
    <a
      ref="link"
      :href="contentLink.url"
      target="_blank"
      rel="noopener noreferrer"
    />
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
