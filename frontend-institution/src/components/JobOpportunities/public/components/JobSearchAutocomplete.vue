<script setup lang="ts">
import emitter from '@/common/util/emitter.service'
import { useRouter, useRoute } from 'vue-router'
import { ref } from 'vue'

const search = ref<string|null>('')
const selected = ref<string | null>(null)
const items = ref<{
  title: string
  prependIcon: string
}[]>([])
const STORAGE_KEY = 'search-jobs-autocomplete'
const MAX_ITEMS = 10
const router = useRouter()
const route = useRoute()

const loadItems = () => {
  items.value = JSON.parse(localStorage.getItem('search-jobs-autocomplete') || '[]')
}
loadItems()

const saveSearchTerm = (title: string) => {
  if (!title) return
  let current = [...items.value]
  current = current.filter(t => t.title.toLowerCase() !== title.toLowerCase())
  if (current.length >= MAX_ITEMS) {
    current.pop()
  }
  current.unshift({
    title,
    prependIcon: 'mdi-clock-outline'
  })
  localStorage.setItem(STORAGE_KEY, JSON.stringify(current))
  items.value = current
}

const emitSearch = () => {
  const query = { ...route.query }
  const trimmed = search.value?.trim() || null
  if (!trimmed) {
    emitter.emit('searchJobOffers', null)
      router.replace({
      path: route.path,
      query : {}
    })
  } else {
    saveSearchTerm(trimmed)
    query.search = trimmed
    emitter.emit('searchJobOffers', trimmed)
    router.replace({
      path: '/bolsa-laboral/empleos',
      query
    })
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Enter') {
    emitSearch()
  }
}

const handleSelect = (val: string| null) => {
    search.value = val
    emitSearch()
}

onMounted(() => {
  const searchParam = route.query.search as string | undefined
  if (typeof searchParam === 'string' && searchParam.trim()) {
    search.value = searchParam
     selected.value = searchParam
     saveSearchTerm(searchParam)
  }
})
</script>

<template>
  <v-container class="text-center" fluid>
    <v-row justify="center" dense>
      <v-col cols="12">
        <v-autocomplete
          v-model="selected"
          v-model:search="search"
          :items="items"
          class="w-100"
          density="comfortable"
          placeholder="Buscar una oferta laboral"
          prepend-inner-icon="mdi-briefcase-search-outline"
          variant="solo"
          auto-select-first
          item-props
          clearable
          rounded
          @keydown.enter="handleKeydown"
          @update:model-value="handleSelect"
          @click:clear="handleSelect(null)"
        >
          <template v-slot:append-inner>
            <v-btn size="small" color="primary" icon @click="emitSearch">
              <v-icon size="large">mdi-magnify</v-icon>
            </v-btn>
          </template>
        </v-autocomplete>
      </v-col>
    </v-row>
  </v-container>
</template>
