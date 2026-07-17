<script setup lang="ts">
import { VSkeletonLoader } from "vuetify/lib/labs/components.mjs";
import BulbLightImg from "@images/illustrations/bulb-light.png";
import PencilRocketImg from "@images/illustrations/pencil-rocket.png";
import { ToastService } from "@/common/util/toast.service";
import { modalConfirmation } from "@/common/util/modal.service";
import { ModuleService } from "@/services/modules.service";
import { ModuleItem } from "@/models/modules";
import { VPagination } from "vuetify/lib/components/index.mjs";
import ModulesForm from "./modals/modulesForm.vue";

const isLoading = ref(false);
const isSearching = ref(false);
const isModalOpen = ref(false);
const selectedModule = ref<ModuleItem | null>(null);
const deletingId = ref<number | null>(null);
const sortingId = ref<number | null>(null);

watch(isModalOpen, (val) => {
  if (!val) selectedModule.value = null;
});

const modulesList = ref<ModuleItem[]>([]);
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
  ModuleService.getList(requestParams.value)
    .then((response) => {
      modulesList.value = response.data.items;
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

const deleteModule = async (id: number) => {
  const confirmed = await modalConfirmation({
    title: "Eliminar módulo",
    content:
      "¿Está seguro que desea eliminar este módulo? Esta acción no se puede deshacer.",
  });
  if (!confirmed) return;
  deletingId.value = id;
  ModuleService.delete(id)
    .then(() => {
      ToastService.success("Módulo eliminado correctamente");
      getList(true);
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      deletingId.value = null;
    });
};

const editModule = (item: ModuleItem) => {
  selectedModule.value = item;
  isModalOpen.value = true;
};

const sortModule = (id: number, position: 1 | -1) => {
  sortingId.value = id;
  ModuleService.sort(id, position)
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
              <h1>Módulos</h1>
              <p>Aquí se listarán todos los módulos existentes.</p>
              <VBtn
                color="primary"
                prepend-icon="mdi-plus"
                @click="isModalOpen = true"
              >
                Nuevo módulo
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
          placeholder="Buscar módulo..."
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
              v-for="module in modulesList"
              :key="module.id"
              cols="12"
              sm="6"
              lg="4"
            >
              <VCard height="100%">
                <VCardTitle class="d-flex align-start">
                  <VAvatar color="primary" variant="tonal" class="mr-2">
                    <VIcon icon="tabler-layout-grid" />
                  </VAvatar>

                  <div style="text-wrap: wrap" class="mt-2">
                    <div style="height: 100%">{{ module.name }}</div>
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
                        @click="editModule(module)"
                      />
                      <VListItem
                        prepend-icon="tabler-arrow-up"
                        title="Subir"
                        :disabled="sortingId === module.id"
                        @click="sortModule(module.id, -1)"
                      >
                        <template v-if="sortingId === module.id" #prepend>
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
                        :disabled="sortingId === module.id"
                        @click="sortModule(module.id, 1)"
                      >
                        <template v-if="sortingId === module.id" #prepend>
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
                        :disabled="deletingId === module.id"
                        @click="deleteModule(module.id)"
                      >
                        <template v-if="deletingId === module.id" #prepend>
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

    <ModulesForm
      v-model="isModalOpen"
      :item="selectedModule"
      @saved="getList(true)"
    />
  </div>
</template>
<route lang="yaml">
meta:
  action: read
  subject: Module
</route>
