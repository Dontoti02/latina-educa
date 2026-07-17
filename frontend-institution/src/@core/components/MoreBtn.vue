<script lang="ts" setup>
interface Props {
  menuList?: unknown[]
  itemProps?: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'change', data: any): void
}>()
</script>

<template>
  <IconBtn
    density="compact"
    color="disabled"
  >
    <VIcon icon="tabler-dots-vertical" />

    <VMenu
      v-if="props.menuList"
      activator="parent"
    >
      <VList
        :items="props.menuList"
        :item-props="props.itemProps"
        @update:selected="emit('change', $event)"
      >
      <template v-slot:prepend="{item}">
          <v-icon :icon="item.icon" v-if="item.icon"></v-icon>
        </template>
      </VList>
    </VMenu>
  </IconBtn>
</template>
