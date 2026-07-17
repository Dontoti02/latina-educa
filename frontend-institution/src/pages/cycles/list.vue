<script setup lang="ts">
import { VSkeletonLoader } from "vuetify/lib/labs/components.mjs";
import BulbLightImg from "@images/illustrations/bulb-light.png";
import PencilRocketImg from "@images/illustrations/pencil-rocket.png";
import { ToastService } from "@/common/util/toast.service";
import { modalConfirmation } from "@/common/util/modal.service";
import { CycleService } from "@/services/cycle.service";
import { CycleItem } from "@/models/cycle";
import { VPagination } from "vuetify/lib/components/index.mjs";
import CycleForm from "./modals/cycleForm.vue";

const isLoading = ref(false);
const isSearching = ref(false);
const isModalOpen = ref(false);
const selectedCycle = ref<CycleItem | null>(null);
const deletingId = ref<number | null>(null);
const sortingId = ref<number | null>(null);

watch(isModalOpen, (val) => {
  if (!val) selectedCycle.value = null;
});

const cyclesList = ref<CycleItem[]>([]);
const totalCount = ref(0);
const requestParams = ref({
  page: 1,
  size: 10,
  search: "",
});

const totalPages = computed(() =>
  Math.ceil(totalCount.value / requestParams.value.size),
);

const getList = (secondary = false) => {
  if (secondary) isSearching.value = true;
  else isLoading.value = true;
  CycleService.getList(requestParams.value)
    .then((response) => {
      cyclesList.value = response.data.items;
      totalCount.value = response.data.total;
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      if (secondary) isSearching.value = false;
      else isLoading.value = false;
    });
};

onMounted(() => {
  getList();
});

watch(
  () => requestParams.value.page,
  () => getList(true),
);

const onSearch = useDebounceFn(() => {
  requestParams.value.page = 1;
  getList(true);
}, 400);

const deleteCycle = async (id: number) => {
  const confirmed = await modalConfirmation({
    title: "Eliminar ciclo",
    content:
      "¿Está seguro que desea eliminar este ciclo? Esta acción no se puede deshacer.",
  });
  if (!confirmed) return;
  deletingId.value = id;
  CycleService.delete(id)
    .then(() => {
      ToastService.success("Ciclo eliminado correctamente");
      getList(true);
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      deletingId.value = null;
    });
};

const editCycle = (item: CycleItem) => {
  selectedCycle.value = item;
  isModalOpen.value = true;
};

const sortCycle = (id: number, position: 1 | -1) => {
  sortingId.value = id;
  CycleService.sort(id, position)
    .then(() => {
      getList(true);
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      sortingId.value = null;
    });
};
</script>
<template>
  <div>
    <div v-if="isLoading" class="mt-4 w-100">
      <VRow>
        <VCol cols="12">
          <VSkeletonLoader class="w-100" type="image" />
        </VCol>
        <VCol v-for="i in 6" :key="i" cols="12" sm="6" lg="4">
          <VSkeletonLoader class="w-100" type="card" indeterminate />
        </VCol>
      </VRow>
    </div>
    <template v-else>
      <div>
        <VCard>
          <VRow>
            <VCol cols="2" class="pl-8 pt-6">
              <img :src="BulbLightImg" height="100" />
            </VCol>
            <VCol
              cols="8"
              class="pt-6 px-8 pb-6 d-flex text-center justify-center align-center flex-column"
            >
              <h1>Ciclos</h1>
              <p>Aquí se listarán todos los ciclos existentes.</p>
              <VBtn
                color="primary"
                prepend-icon="mdi-plus"
                @click="isModalOpen = true"
              >
                Nuevo ciclo
              </VBtn>
            </VCol>
            <VCol cols="2" class="d-flex justify-end align-end">
              <img :src="PencilRocketImg" height="100" />
            </VCol>
          </VRow>
        </VCard>
        <VSpacer />
        <VTextField
          v-model="requestParams.search"
          placeholder="Buscar ciclo..."
          prepend-inner-icon="tabler-search"
          clearable
          hide-details
          class="mt-4"
          @input="onSearch"
          @click:clear="onSearch"
        />
        <div class="mt-6 pb-6 pt-2" style="position: relative">
          <div
            v-if="isSearching"
            class="d-flex justify-center align-center"
            style="
              position: absolute;
              inset: 0;
              background: rgba(var(--v-theme-surface), 0.7);
              z-index: 1;
              border-radius: 8px;
            "
          >
            <VProgressCircular indeterminate color="primary" size="48" />
          </div>
          <VRow>
            <VCol
              v-for="cycle in cyclesList"
              :key="cycle.id"
              cols="12"
              sm="6"
              lg="4"
            >
              <VCard height="100%">
                <VCardTitle class="d-flex align-start">
                  <VAvatar color="primary" variant="tonal" class="mr-2">
                    <VIcon icon="tabler-refresh" />
                  </VAvatar>

                  <div style="text-wrap: wrap" class="mt-2">
                    <div style="height: 100%">Ciclo {{ cycle.name }}</div>
                  </div>

                  <VSpacer />

                  <VMenu location="bottom end" close-on-content-click>
                    <template #activator="{ props: menuProps }">
                      <VBtn icon variant="text" size="small" v-bind="menuProps">
                        <VIcon icon="tabler-dots-vertical" />
                      </VBtn>
                    </template>
                    <VList density="compact" min-width="150">
                      <VListItem
                        prepend-icon="tabler-pencil"
                        title="Editar"
                        @click="editCycle(cycle)"
                      />
                      <VListItem
                        prepend-icon="tabler-arrow-up"
                        title="Subir"
                        :disabled="sortingId === cycle.id"
                        @click="sortCycle(cycle.id, -1)"
                      >
                        <template v-if="sortingId === cycle.id" #prepend>
                          <VProgressCircular
                            indeterminate
                            size="18"
                            width="2"
                            color="primary"
                            class="mr-2"
                          />
                        </template>
                      </VListItem>
                      <VListItem
                        prepend-icon="tabler-arrow-down"
                        title="Bajar"
                        :disabled="sortingId === cycle.id"
                        @click="sortCycle(cycle.id, 1)"
                      >
                        <template v-if="sortingId === cycle.id" #prepend>
                          <VProgressCircular
                            indeterminate
                            size="18"
                            width="2"
                            color="primary"
                            class="mr-2"
                          />
                        </template>
                      </VListItem>
                      <VListItem
                        prepend-icon="tabler-trash"
                        title="Eliminar"
                        base-color="error"
                        :disabled="deletingId === cycle.id"
                        @click="deleteCycle(cycle.id)"
                      >
                        <template v-if="deletingId === cycle.id" #prepend>
                          <VProgressCircular
                            indeterminate
                            size="18"
                            width="2"
                            color="error"
                            class="mr-2"
                          />
                        </template>
                      </VListItem>
                    </VList>
                  </VMenu>
                </VCardTitle>
              </VCard>
            </VCol>
          </VRow>
          <VRow v-if="totalPages > 1" class="mt-4">
            <VCol cols="12" class="d-flex justify-center">
              <VPagination
                v-model="requestParams.page"
                :length="totalPages"
                :total-visible="7"
              />
            </VCol>
          </VRow>
        </div>
      </div>
    </template>

    <CycleForm
      v-model="isModalOpen"
      :item="selectedCycle"
      @saved="getList(true)"
    />
  </div>
</template>
<route lang="yaml">
meta:
  action: read
  subject: Cycle
</route>
