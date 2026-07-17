<script setup lang="ts">
import type { CourseItem } from "@/models/study-plan-form";

defineProps<{
  course: CourseItem;
  variant: "available" | "selected";
  index?: number;
}>();

const emit = defineEmits<{
  (e: "add"): void;
  (e: "remove"): void;
  (e: "edit-course"): void;
}>();
</script>

<template>
  <div
    class="course-item d-flex align-center py-2 px-3"
    :class="{ 'inactive-item': !course.is_active }"
  >
    <VIcon
      icon="mdi-drag-vertical"
      class="drag-handle mr-2"
      size="20"
      color="grey"
    />
    <span v-if="variant === 'selected'" class="order-badge mr-2">
      {{ (index ?? 0) + 1 }}
    </span>
    <div class="flex-grow-1">
      <span class="text-body-2">{{ course.name }}</span>
      <div class="text-caption text-medium-emphasis">
        {{ course.code }} · {{ course.credits }} créditos · {{ course.year }}
      </div>
    </div>
    <VChip
      :color="course.is_active ? 'success' : 'default'"
      size="x-small"
      class="mr-2"
    >
      {{ course.is_active ? "Activo" : "Inactivo" }}
    </VChip>
    <VBtn
      icon
      variant="text"
      size="small"
      color="warning"
      title="Editar curso"
      @click="emit('edit-course')"
    >
      <VIcon icon="mdi-pencil" size="20" />
    </VBtn>
    <VBtn
      icon
      variant="text"
      size="small"
      :color="variant === 'selected' ? 'error' : 'primary'"
      :title="variant === 'selected' ? 'Quitar del ciclo' : 'Agregar al ciclo'"
      @click="variant === 'selected' ? emit('remove') : emit('add')"
    >
      <VIcon
        :icon="variant === 'selected' ? 'mdi-close' : 'mdi-chevron-right'"
        size="20"
      />
    </VBtn>
  </div>
</template>

<style scoped>
.course-item {
  border-bottom: 1px solid rgba(var(--v-border-color), 0.08);
  transition: background-color 0.15s ease;
  cursor: default;
}

.course-item:last-child {
  border-bottom: none;
}

.course-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.04);
}

.drag-handle {
  cursor: grab;
  opacity: 0.5;
  transition: opacity 0.15s;
}

.course-item:hover .drag-handle {
  opacity: 1;
}

.drag-handle:active {
  cursor: grabbing;
}

.inactive-item {
  opacity: 0.7;
  cursor: not-allowed;
}

.inactive-item .drag-handle {
  cursor: not-allowed;
  pointer-events: none;
}

.order-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  border-radius: 50%;
  background-color: rgba(var(--v-theme-primary), 0.12);
  color: rgb(var(--v-theme-primary));
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}
</style>
