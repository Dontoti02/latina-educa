<script setup lang="ts">
import { CourseFilterValues } from "@/models/study-plan-form";

const emit = defineEmits<{
  (e: "filter", filters: CourseFilterValues): void;
}>();

const filters = ref<CourseFilterValues>({
  name: null,
  year: null,
  active: false,
});

const menu = ref(false);

const activeCount = computed(() => {
  let count = 0;
  if (filters.value.name) count++;
  if (filters.value.year) count++;
  if (filters.value.active) count++;
  return count;
});

const filter = () => {
  emit("filter", { ...filters.value });
  menu.value = false;
};
</script>

<template>
  <VMenu
    v-model="menu"
    :close-on-content-click="false"
    width="300"
    location="bottom start"
  >
    <template #activator="{ props: menuProps }">
      <VBadge
        :model-value="activeCount > 0"
        :content="activeCount"
        color="primary"
      >
        <VBtn size="small" variant="text" icon v-bind="menuProps">
          <v-icon>ri-filter-3-line</v-icon>
        </VBtn>
      </VBadge>
    </template>
    <VCard>
      <VCardText class="pb-0">
        <VRow dense>
          <VCol cols="12">
            <VTextField
              v-model="filters.name"
              label="Nombre"
              density="compact"
              variant="outlined"
              clearable
              hide-details
            />
          </VCol>
          <VCol cols="12">
            <VTextField
              v-model.number="filters.year"
              label="Año"
              density="compact"
              variant="outlined"
              type="number"
              clearable
              hide-details
            />
          </VCol>
          <VCol cols="12">
            <div class="d-flex align-center justify-space-between py-1">
              <span class="text-body-2">Solo activos</span>
              <VSwitch
                v-model="filters.active"
                color="primary"
                hide-details
                density="compact"
              />
            </div>
          </VCol>
        </VRow>
      </VCardText>
      <VCardActions class="pt-1">
        <VSpacer />
        <VBtn color="primary" variant="flat" size="small" @click="filter">
          Filtrar
        </VBtn>
      </VCardActions>
    </VCard>
  </VMenu>
</template>
