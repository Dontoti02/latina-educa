<script setup lang="ts">
import { VSkeletonLoader } from "vuetify/lib/labs/components.mjs";
import BulbLightImg from "@images/illustrations/bulb-light.png";
import PencilRocketImg from "@images/illustrations/pencil-rocket.png";
import { ToastService } from "@/common/util/toast.service";
import { modalConfirmation } from "@/common/util/modal.service";
import { PeriodService } from "@/services/period.service";
import { PeriodItem } from "@/models/period";
import { VPagination } from "vuetify/lib/components/index.mjs";
import PeriodForm from "./modals/periodForm.vue";

const isLoading = ref(false);
const isSearching = ref(false);
const isModalOpen = ref(false);
const selectedPeriod = ref<PeriodItem | null>(null);
const deletingId = ref<number | null>(null);
const togglingId = ref<number | null>(null);

watch(isModalOpen, (val) => {
  if (!val) selectedPeriod.value = null;
});

const periodsList = ref<PeriodItem[]>([]);
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
  PeriodService.getList(requestParams.value)
    .then((response) => {
      periodsList.value = response.data.items;
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

const deletePeriod = async (id: number) => {
  const confirmed = await modalConfirmation({
    title: "Eliminar período",
    content:
      "¿Está seguro que desea eliminar este período? Esta acción no se puede deshacer.",
  });
  if (!confirmed) return;
  deletingId.value = id;
  PeriodService.delete(id)
    .then(() => {
      ToastService.success("Período eliminado correctamente");
      getList(true);
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      deletingId.value = null;
    });
};

const editPeriod = (item: PeriodItem) => {
  selectedPeriod.value = item;
  isModalOpen.value = true;
};

const togglePeriod = (item: PeriodItem) => {
  togglingId.value = item.id;
  PeriodService.toggle(item.id)
    .then(() => {
      const action = item.is_current ? "desactivado" : "activado";
      ToastService.success(`Período ${action} correctamente`);
      getList(true);
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      togglingId.value = null;
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
              <h1>Períodos</h1>
              <p>Aquí se listarán todos los períodos existentes.</p>
              <VBtn
                color="primary"
                prepend-icon="mdi-plus"
                @click="isModalOpen = true"
              >
                Nuevo período
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
          placeholder="Buscar período..."
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
              v-for="period in periodsList"
              :key="period.id"
              cols="12"
              sm="6"
              lg="4"
            >
              <VCard height="100%">
                <VCardTitle class="d-flex align-start">
                  <VAvatar color="primary" variant="tonal" class="mr-2 mt-7">
                    <VIcon icon="tabler-calendar" />
                  </VAvatar>

                  <div style="text-wrap: wrap">
                    <div class="d-flex gap-1 mb-2">
                      <VChip
                        :color="period.is_current ? 'info' : 'default'"
                        size="small"
                        variant="tonal"
                      >
                        {{ period.is_current ? "Actual" : "Inactivo" }}
                      </VChip>
                    </div>
                    <div class="font-weight-medium">
                      {{ period.name }}
                    </div>
                    <div class="text-body-2 text-medium-emphasis mt-1">
                      <template v-if="period.start_date || period.end_date">
                        <VIcon icon="tabler-calendar" size="14" class="mr-1" />
                        {{
                          period.start_date
                            ? period.start_date.slice(0, 10)
                            : "?"
                        }}
                        hasta
                        {{
                          period.end_date ? period.end_date.slice(0, 10) : "?"
                        }}
                      </template>
                      <template v-else> Sin fechas definidas </template>
                    </div>
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
                        @click="editPeriod(period)"
                      />
                      <VListItem
                        :prepend-icon="
                          period.is_current
                            ? 'tabler-toggle-right'
                            : 'tabler-toggle-left'
                        "
                        :title="period.is_current ? 'Desactivar' : 'Activar'"
                        :base-color="period.is_current ? 'warning' : 'success'"
                        :disabled="togglingId === period.id"
                        @click="togglePeriod(period)"
                      >
                        <template v-if="togglingId === period.id" #prepend>
                          <VProgressCircular
                            indeterminate
                            size="18"
                            width="2"
                            color="warning"
                            class="mr-2"
                          />
                        </template>
                      </VListItem>
                      <VListItem
                        prepend-icon="tabler-trash"
                        title="Eliminar"
                        base-color="error"
                        :disabled="deletingId === period.id"
                        @click="deletePeriod(period.id)"
                      >
                        <template v-if="deletingId === period.id" #prepend>
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

    <PeriodForm
      v-model="isModalOpen"
      :item="selectedPeriod"
      @saved="getList(true)"
    />
  </div>
</template>
<route lang="yaml">
meta:
  action: read
  subject: Period
</route>
