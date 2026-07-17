<script setup lang="ts">
import type { Post } from '@/models/dashboard'
import { DateFormatting } from '@/utils/date-formatting'
import { ImageUtils } from '@/utils/images'

defineProps<{
  posts: Post[]
}>()

const colors = ['primary', 'success', 'warning', 'info', 'error']

const getColor = (index: number) => {
  return colors[index % colors.length]
}
</script>

<template>
  <VCard title="Últimas publicaciones">
    <VCardText>
      <VTimeline
        v-if="posts.length > 0"
        side="end"
        align="start"
        truncate-line="both"
        density="compact"
        class="v-timeline-density-compact"
      >
        <VTimelineItem
          v-for="(post, index) in posts"
          :key="post.id"
          :dot-color="getColor(index)"
          size="x-small"
        >
          <!-- 👉 Header -->
          <div class="d-flex align-center">
            <VAvatar
              v-if="post.photo"
              class="me-3"
              :image="ImageUtils.getUrlImage(post.photo)"
            />

            <VAvatar
              v-else
              class="mr-2"
              color="primary"
              variant="tonal"
              size="large"
            >
              <VIcon
                size="large"
                icon="tabler-user"
              />
            </VAvatar>
            <div>
              <h6 class="text-h6">
                {{ post.person }}
              </h6>

              <p class="mb-0 text-sm">
                {{ post.course }}
              </p>
            </div>
          </div>
          <div class="d-flex justify-end align-center flex-wrap">
            <!--
              <span class="app-timeline-title">
              {{ post.course }}
              </span>
            -->
            <span class="app-timeline-meta">{{ DateFormatting.timeAgo(new Date(post.date)) }}</span>
          </div>

          <!-- 👉 Content -->
          <p
            class="app-timeline-text mb-3 three-lines"
            v-html="post.value"
          />
          <div class="d-flex align-center">
            <a
              v-for="file in post.files"
              :key="file.name"
              href="javascript:void(0);"
              class="d-flex align-center me-4"
            >
              <VIcon
                start
                size="18"
                color="warning"
                icon="tabler-file-description"
              />
              <h6 class="font-weight-medium text-h6">{{ file.name }}</h6>
            </a>
          </div>
        </VTimelineItem>
      </VTimeline>
      <p
        v-else
        class="text-center"
      >
        No se han encontrado publicaciones
      </p>
    </VCardText>
  </VCard>
</template>

<style>
.three-lines {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
