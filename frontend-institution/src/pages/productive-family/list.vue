<script setup lang="ts">
import { VSkeletonLoader } from "vuetify/lib/labs/components.mjs";
import BulbLightImg from "@images/illustrations/bulb-light.png";
import PencilRocketImg from "@images/illustrations/pencil-rocket.png";
import { ToastService } from "@/common/util/toast.service";
import { modalConfirmation } from "@/common/util/modal.service";
import { ProductiveFamilyService } from "@/services/productive-family.service";
import { ProductiveFamilyItem } from "@/models/productive-family";
import { VPagination } from "vuetify/lib/components/index.mjs";
import ProductiveFamilyForm from "./modals/productiveFamilyForm.vue";

const isLoading = ref(false);
const isSearching = ref(false);
const isModalOpen = ref(false);
const selectedFamily = ref<ProductiveFamilyItem | null>(null);
const deletingId = ref<number | null>(null);

watch(isModalOpen, (val) => {
  if (!val) selectedFamily.value = null;
});
const productiveFamilysList = ref<ProductiveFamilyItem[]>([]);
const totalCountOfProductiveFamilys = ref(0);
const requestParams = ref({
  page: 1,
  size: 10,
  search: "",
});

const totalPages = computed(() =>
  Math.ceil(totalCountOfProductiveFamilys.value / requestParams.value.size),
);

const getPeriods = (secondary = false) => {
  if (secondary) isSearching.value = true;
  else isLoading.value = true;
  ProductiveFamilyService.getList(requestParams.value)
    .then((response) => {
      productiveFamilysList.value = response.data.items;
      totalCountOfProductiveFamilys.value = response.data.total;
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
  getPeriods();
});

watch(
  () => requestParams.value.page,
  () => getPeriods(true),
);

const onSearch = useDebounceFn(() => {
  requestParams.value.page = 1;
  getPeriods(true);
}, 400);

const deleteProductiveFamily = async (id: number) => {
  const confirmed = await modalConfirmation({
    title: "Eliminar familia productiva",
    content:
      "¿Está seguro que desea eliminar esta familia productiva? Esta acción no se puede deshacer.",
  });
  if (!confirmed) return;
  deletingId.value = id;
  ProductiveFamilyService.delete(id)
    .then(() => {
      ToastService.success("Familia productiva eliminada correctamente");
      getPeriods(true);
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      deletingId.value = null;
    });
};

const updateProductiveFamilyItem = (item: ProductiveFamilyItem) => {
  selectedFamily.value = item;
  isModalOpen.value = true;
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
              <h1>Familias Productivas</h1>
              <p>
                Aquí se listarán todas las familias productivas existentes hasta
                la actualidad.
              </p>
              <VBtn
                color="primary"
                prepend-icon="mdi-plus"
                @click="isModalOpen = true"
              >
                Nueva familia
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
          placeholder="Buscar familia productiva..."
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
              v-for="productiveFamily in productiveFamilysList"
              :key="productiveFamily.id"
              cols="12"
              sm="6"
              lg="4"
            >
              <VCard height="100%">
                <VCardTitle class="d-flex align-start">
                  <VAvatar color="primary" variant="tonal" class="mr-2">
                    <VIcon icon="tabler-brand-databricks" />
                  </VAvatar>

                  <div style="text-wrap: wrap">
                    {{ productiveFamily.name }}
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
                        @click.stop="
                          updateProductiveFamilyItem(productiveFamily)
                        "
                      />
                      <VListItem
                        prepend-icon="tabler-trash"
                        title="Eliminar"
                        base-color="error"
                        :disabled="deletingId === productiveFamily.id"
                        @click.stop="
                          deleteProductiveFamily(productiveFamily.id)
                        "
                      >
                        <template
                          v-if="deletingId === productiveFamily.id"
                          #prepend
                        >
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

    <ProductiveFamilyForm
      v-model="isModalOpen"
      :item="selectedFamily"
      @saved="getPeriods(true)"
    />
  </div>
</template>
<route lang="yaml">
meta:
  action: read
  subject: ProductiveFamily
</route>
