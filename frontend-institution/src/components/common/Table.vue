<script setup lang="ts">
import { computed, useSlots, ref, onMounted, nextTick, watch } from 'vue'
import { useDisplay } from 'vuetify'

export interface HeaderProp {
  key: string
  title: string
  align?: 'left' | 'center' | 'right'
  nowrap?: boolean
  fixed?: boolean
  children?: { title: string; key: string }[]
}

type HeaderColor = 'primary' | 'secondary' | 'success'

export interface TableProps {
  config?: {
    loading?: boolean
    height?: number
    fixed?: boolean
    sort?: boolean
    styles?: { headerColor?: HeaderColor }
    pagination?: {
      peerPage?: number
      totalVisible?: number
      usePaginationServer?: boolean
      totalItems?: number
    }
    index?: boolean
  }
  header: HeaderProp[]
  items: Record<string, any>[]
}

type ExtendedHeader = HeaderProp & { left: number; isFixed: boolean }

const slots = useSlots()
const props = defineProps<TableProps>()

const hasHeadSlot = computed(() => !!slots.head)
const hasBodySlot = computed(() => !!slots.body)

const configTable = ref({
  height: 400,
  fixed: true,
  sort: false,
})

const currentPage = ref(1)
const itemsPerPage = ref(props.config?.pagination?.peerPage ?? 10)
const totalVisible = ref(props.config?.pagination?.totalVisible ?? 10)
const totalItems = ref(props.config?.pagination?.totalItems ?? props.items.length)

onMounted(() => {
  nextTick(() => {
    if (props.config) {
      Object.assign(configTable.value, {
        height: props.config.height ?? configTable.value.height,
        fixed: props.config.fixed ?? configTable.value.fixed,
        sort: props.config.sort ?? configTable.value.sort,
      })
      if (props.config.pagination) {
        itemsPerPage.value = props.config.pagination.peerPage ?? itemsPerPage.value
        totalVisible.value = props.config.pagination.totalVisible ?? totalVisible.value
        totalItems.value = props.config.pagination.totalItems ?? totalItems.value
      }
    }
    calculateColumnWidths()
  })
})

const hasChildren = computed(() =>
  props.header.some(column => column.children?.length)
)

const paginatedItems = computed(() => {
  if (props.config?.pagination?.usePaginationServer) return props.items
  const start = (currentPage.value - 1) * itemsPerPage.value
  return props.items.slice(start, start + itemsPerPage.value)
})

watch(
  () => props.items,
  () => {
    if (!props.config?.pagination?.usePaginationServer) {
      currentPage.value = 1
      totalItems.value = props.items.length
    }
  }
)

const emit = defineEmits<{ (e: 'update:currentPage', page: number): void }>()

function onUpdatePageServer(page: number) {
  currentPage.value = page
  if (props.config?.pagination?.usePaginationServer) emit('update:currentPage', page)
}

const columnWidths = ref<Record<string, number>>({})
const headerRefs = ref<Record<string, HTMLElement | null>>({})

function calculateColumnWidths() {
  const widths: Record<string, number> = {}
  for (const key in headerRefs.value) {
    const el = headerRefs.value[key]
    if (el) widths[key] = el.offsetWidth
  }
  columnWidths.value = widths
}

function setHeaderRef(key: string, el: HTMLElement | null) {
  headerRefs.value[key] = el
}

const display = useDisplay()
const allowFixed = computed(() => !display.xs.value)

const headerWithOffsets = computed<ExtendedHeader[]>(() => {
  let left = props.config?.index ? 48 : 0
  return props.header.map(column => {
    const isFixed = !!column.fixed && allowFixed.value
    const width = columnWidths.value[column.key] ?? 0
    const node: ExtendedHeader = { ...column, left, isFixed }
    if (isFixed) left += width
    return node
  })
})

const tableHeight = computed(() => {
  if (!props.config?.height) {
    const rowHeight = 56
    const headerHeight = 98
    return `${itemsPerPage.value * rowHeight + headerHeight}px`
  }
  return configTable.value.height
})

const loading = computed(() => !!props.config?.loading)

const HEADER_STYLES: Record<
  HeaderColor,
  { backgroundColor: string; color: string }
> = {
  primary: {
    backgroundColor: 'rgb(var(--v-theme-surface))',
    color: 'white',
  },
  secondary: {
    backgroundColor: 'var(--v-secondary-base)',
    color: 'var(--v-secondary-on-base)',
  },
  success: {
    backgroundColor: 'var(--v-success-base)',
    color: 'var(--v-success-on-base)',
  },
}

const styles = computed(() => {
  const color = props.config?.styles?.headerColor
  return color
    ? HEADER_STYLES[color]
    : {
        backgroundColor: 'rgb(var(--v-global-theme-primary))',
        color: 'rgb(var(--v-theme-on-primary))',
      }
})
</script>

<template>
  <v-container style="position: relative;">
    <v-table
      :height="tableHeight"
      :fixed-header="configTable.fixed"
      class="table-wrapper"
    >
      <thead>
        <slot v-if="hasHeadSlot" name="head" />
        <template v-else>
          <tr>
            <th
              v-if="props.config?.index"
              scope="col"
              :rowspan="2"
              :style="{
                textAlign: 'center',
                left: headerWithOffsets.some(c => c.isFixed) ? '0px' : 'auto',
                background: styles.backgroundColor,
                color: styles.color
              }"
              :class="{ 'fixed-column': headerWithOffsets.some(c => c.isFixed) }"
            >
              #
            </th>
            <th
              v-for="(column, index) in headerWithOffsets"
              :key="'parent-' + index"
              :colspan="column.children?.length || 1"
              :rowspan="column.children ? 1 : 2"
              :style="{
                textAlign: column.align ?? 'center',
                left: column.isFixed ? column.left + 'px' : 'auto',
                background: styles.backgroundColor,
                color: styles.color
              }"
              :class="{ 'nowrap': column.nowrap, 'fixed-column': column.isFixed }"
              :ref="el => setHeaderRef(column.key, el as HTMLElement | null)"
              scope="col"
            >
              {{ column.title }}
            </th>
          </tr>
          <tr v-if="hasChildren">
            <template v-for="column in headerWithOffsets" :key="column.key + '-children'">
              <template v-if="column.children">
                <th
                  v-for="child in column.children"
                  :key="column.key + '-' + child.key"
                  :style="{
                    textAlign: column.align ?? 'center',
                    left: column.isFixed ? column.left + 'px' : 'auto',
                    background: styles.backgroundColor,
                    color: styles.color
                  }"
                  :class="{ 'fixed-column': column.isFixed }"
                >
                  {{ child.title }}
                </th>
              </template>
            </template>
          </tr>
        </template>
      </thead>
      <tbody>
        <slot v-if="hasBodySlot" name="body"></slot>
        <template v-else>
          <tr v-for="(item, key) in paginatedItems" :key="'body_' + key">
            <td
              v-if="props.config?.index"
              :style="{
                textAlign: 'center',
                left: headerWithOffsets.some(c => c.isFixed) ? '0px' : 'auto'
              }"
              :class="{ 'fixed-column': headerWithOffsets.some(c => c.isFixed) }"
            >
              {{ (currentPage - 1) * itemsPerPage + key + 1 }}
            </td>
            <template
              v-for="{ key: colKey, children, align, nowrap, left, isFixed } in headerWithOffsets"
              :key="'rowcells_' + colKey"
            >
              <template v-if="children">
                <td
                  v-for="subitem in children"
                  :key="'cell_' + subitem.key"
                  :style="{ textAlign: align ?? 'center', left: isFixed ? left + 'px' : 'auto' }"
                  :class="{ 'nowrap': nowrap, 'fixed-column z-2': isFixed }"
                >
                  <template v-if="slots[subitem.key]">
                    <slot :name="subitem.key" :item="item" />
                  </template>
                  <template v-else>
                    {{ item[subitem.key] }}
                  </template>
                </td>
              </template>
              <template v-else>
                <td
                  :style="{ textAlign: align ?? 'center', left: isFixed ? left + 'px' : 'auto' }"
                  :class="{ 'nowrap': nowrap, 'fixed-column': isFixed }"
                >
                  <slot v-if="slots[colKey]" :name="colKey" :item="item" />
                  <template v-else>
                    {{ item[colKey] }}
                  </template>
                </td>
              </template>
            </template>
          </tr>
        </template>
      </tbody>
    </v-table>
    <v-pagination
      v-model="currentPage"
      :length="Math.ceil(totalItems / itemsPerPage)"
      :total-visible="totalVisible"
      @update:modelValue="onUpdatePageServer($event)"
    />
    <v-overlay v-model="loading" class="align-center justify-center" contained>
      <v-progress-circular :size="50" color="primary" indeterminate />
    </v-overlay>
  </v-container>
</template>

<style>
table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  padding: 1px;
}
th {
  border-top: thin solid rgba(var(--v-border-color), var(--v-border-opacity));
}
.nowrap {
  white-space: nowrap;
}
.fixed-column {
  position: sticky;
  background-color: rgba(var(--v-theme-surface), 0.9);
  z-index: 1;
}
.table-wrapper {
  position: relative;
  overflow: auto;
}
</style>
