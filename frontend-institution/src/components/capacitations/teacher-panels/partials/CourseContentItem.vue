<script setup lang="ts">
import { SessionStore } from '@/common/store';
import modalService from '@/common/util/modal.service';
import type { ContentItem } from '@/models/courses';
import { DateFormatting } from '@/utils/date-formatting';

// Initial
const props = withDefaults(defineProps<{
  contentGroupId: number
  contentItem: ContentItem
  loadingIsOpen?: boolean
  disabledIsOpen?: boolean
  loadingIsVisible?: boolean
  disabledIsVisible?: boolean
  loadingDelete?: boolean
  disabledDelete?: boolean
}>(), {
  loadingIsOpen: false,
  disabledIsOpen: false,
  loadingIsVisible: false,
  disabledIsVisible: false,
  loadingDelete: false,
  disabledDelete: false,
})

const emit = defineEmits<{
  (e: 'selected', args: { id: number; typeSubPage: 'content-detail' | 'evaluations' }): void
  (e: 'action', args: { action: string; contentGroupId: number; contentId: number }): void
}>()

const session = SessionStore()

const itemsForMenu: Array<{
  title: string
  action: string
}> = [
  ...(props.contentItem.type !== 'content' ? [{ title: 'Evaluar', action: 'evaluate' }] : []),
  { title: 'Editar', action: 'edit' },
  { title: 'Eliminar', action: 'delete' },
]

// Computed
const publicationDate = computed(() => {
  return DateFormatting.formatDayOfMonth(new Date(props.contentItem.date))
})

const finishDate = computed(() => {
  return DateFormatting.formatDayOfMonth(new Date(props.contentItem.date_limit))
})

// Content actions
const toggleOpen = async () => {
  const confirm = await modalService.confirmation({
    title: 'Cambiar estado del contenido',
    content: `¿Estás seguro de ${props.contentItem.is_open ? 'cerrar' : 'abrir'} el contenido?`,
  })

  if(confirm) {
    emit('action', { action: 'toggleOpen', contentGroupId: props.contentGroupId, contentId: props.contentItem.id })
  }
}

const toggleVisible = async () => {
  const confirm = await modalService.confirmation({
    title: 'Cambiar visibilidad del contenido',
    content: `¿Estás seguro de ${props.contentItem.is_visible ? 'ocultar' : 'mostrar'} el contenido?`,
  })

  if(confirm) {
    emit('action', { action: 'toggleVisible', contentGroupId: props.contentGroupId, contentId: props.contentItem.id })
  }
}
</script>

<template>
  <VRow
    class="px-6 py-2 mb-2 mx-2 rounded-pill border-md course-content-item"
    justify="space-between"
    align="center"
    @click="emit('selected', { id: contentItem.id, typeSubPage: 'content-detail' })"
  >
    <VCol
      cols="12"
      :md="session.isTeacher() ? 10 : 8"
      class="d-flex px-0 py-0 gap-4"
    >
      <div class="d-flex gap-2 align-center">
        <VIcon
          size="large"
          :icon="contentItem.type === 'content' ? 'tabler-book-2' : 
            contentItem.type === 'evaluation' ? 'tabler-checklist' : 'tabler-file-text'"
        />
        <p class="my-0">
          <span class="text-h6 font-weight-bold">{{ contentItem.title }}</span>
          <span
            v-if="session.isTeacher()"
            class="text-body-2 ml-3"
          >
            {{ contentItem.type === 'content' ? `Publicado: ${publicationDate}` : `Fecha de entrega: ${finishDate}` }}
          </span>
        </p>
      </div>
    </VCol>
    <VCol
      cols="12"
      :md="session.isTeacher() ? 2 : 4"
      class="text-right text-body-2 px-0 py-0"
    >
      <span v-if="session.isStudent()">
        {{ contentItem.type === 'content' ? `Publicado: ${publicationDate}` : `Fecha de entrega: ${finishDate}` }}
      </span>
      <div v-if="session.isTeacher()" class="d-flex justify-end gap-2">
        <VTooltip :text="`Contenido ${contentItem.is_open ? 'Activo' : 'Inactivo'}`">
          <template v-slot:activator="{ props }">
            <VBtn
              :icon="contentItem.is_open ? 'mdi-lock-open' : 'mdi-lock'"
              :color="contentItem.is_open ? 'success' : 'error'"
              variant="outlined"
              v-bind="props"
              density="compact"
              :loading="loadingIsOpen"
              :disabled="disabledIsOpen"
              @click.stop="toggleOpen()"
            />
          </template>
        </VTooltip>
        <VTooltip :text="`Contenido ${contentItem.is_visible ? 'Visible' : 'No visible'}`">
          <template v-slot:activator="{ props }">
            <VBtn
              :icon="contentItem.is_visible ? 'mdi-eye' : 'mdi-eye-off'"
              :color="contentItem.is_visible ? 'info' : 'warning'"
              variant="outlined"
              v-bind="props"
              density="compact"
              :loading="loadingIsVisible"
              :disabled="disabledIsVisible"
              @click.stop="toggleVisible()"
            />
          </template>
        </VTooltip>
        <VMenu>
          <template #activator="{ props }">
            <VBtn
              icon="mdi-dots-vertical"
              variant="outlined"
              v-bind="props"
              density="compact"
              :loading="loadingDelete"
              :disabled="disabledDelete"
            />
          </template>
  
          <VList>
            <VListItem
              v-for="(item, i) in itemsForMenu"
              :key="i"
              class="px-0 mx-0 my-0 py-0"
            >
              <VBtn
                variant="text"
                class="w-100 d-flex justify-start"
                @click="emit('action', { action: item.action, contentGroupId, contentId: contentItem.id })"
              >
                {{ item.title }}
              </VBtn>
            </VListItem>
          </VList>
        </VMenu>
      </div>
    </VCol>
  </VRow>
</template>

<style scoped lang="css">
.course-content-item:hover {
  border-color: rgb(var(--v-theme-primary)) !important;
  box-shadow: 0 0 10px 0 rgba(var(--v-theme-primary), 0.5);
  color: rgb(var(--v-theme-primary));
  cursor: pointer;
}

.course-content-item:hover span,
.course-content-item:hover h4 {
  color: rgb(var(--v-theme-primary));
}
</style>
