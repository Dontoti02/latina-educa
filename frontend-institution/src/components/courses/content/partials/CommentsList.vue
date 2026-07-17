<script setup lang="ts">
import type { ClassComment } from '@/models/courses';
import { DateFormatting } from '@/utils/date-formatting';
import { ImageUtils } from '@/utils/images';

defineProps<{
  comments: Array<ClassComment>
}>()
</script>

<template>
  <VCard
    v-if="comments.length !== 0"
    class="px-4 py-0"
    variant="text"
  >
    <VRow>
      <VCol cols="12">
        <div class="text-h5">
          Comentarios de clase
        </div>
      </VCol>
      <VCol
        v-for="comment in comments"
        :key="comment.id"
        cols="12"
      >
        <VCard
          class="px-4"
          variant="text"
        >
          <div class="d-flex align-center">
            <VAvatar
              size="36"
              class="mr-2"
            >
              <img
                v-if="comment.photo"
                :src="ImageUtils.getUrlImage(comment.photo)"
                alt="avatar"
                style="width: 100%; object-fit: cover;"
              >
              <VChip
                v-else
                variant="tonal"
                class="w-100 h-100 d-flex align-center justify-center"
                color="primary"
              >
                <VIcon icon="tabler-user" />
              </VChip>
            </VAvatar>
            <div>
              <div class="text-h6">
                {{ comment.person }}
              </div>
              <div class="text-body-2">
                {{ DateFormatting.formatShort(new Date(comment.date)) }}
              </div>
            </div>
          </div>
          <div
            class="pt-2 ql-editor"
            v-html="comment.value"
          />
        </VCard>
      </VCol>
    </VRow>
  </VCard>
</template>
