<script setup lang="ts">
import { VSkeletonLoader } from "vuetify/lib/labs/components.mjs";
import BulbLightImg from "@images/illustrations/bulb-light.png";
import PencilRocketImg from "@images/illustrations/pencil-rocket.png";
import { ToastService } from "@/common/util/toast.service";
import { modalConfirmation } from "@/common/util/modal.service";
import { TeacherService } from "@/services/teacher.service";
import { TeacherItem } from "@/models/teacher";
import { VPagination } from "vuetify/lib/components/index.mjs";
import TeacherForm from "./modals/teacherForm.vue";

const isLoading = ref(false);
const isSearching = ref(false);
const isModalOpen = ref(false);
const selectedTeacher = ref<TeacherItem | null>(null);
const deletingId = ref<number | null>(null);

watch(isModalOpen, (val) => {
  if (!val) selectedTeacher.value = null;
});

const teachersList = ref<TeacherItem[]>([]);
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
  TeacherService.getList(requestParams.value)
    .then((response) => {
      teachersList.value = response.data.items;
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

const deleteTeacher = async (id: number) => {
  const confirmed = await modalConfirmation({
    title: "Eliminar docente",
    content:
      "¿Está seguro que desea eliminar este docente? Esta acción no se puede deshacer.",
  });
  if (!confirmed) return;
  deletingId.value = id;
  TeacherService.delete(id)
    .then(() => {
      ToastService.success("Docente eliminado correctamente");
      getList(true);
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      deletingId.value = null;
    });
};

const editTeacher = (item: TeacherItem) => {
  selectedTeacher.value = item;
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
              <h1>Docentes</h1>
              <p>Aquí se listarán todos los docentes existentes.</p>
              <VBtn
                color="primary"
                prepend-icon="mdi-plus"
                @click="isModalOpen = true"
              >
                Nuevo docente
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
          placeholder="Buscar docente..."
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
          <VTable>
            <thead>
              <tr>
                <th>Nombres</th>
                <th>Documento</th>
                <th>Teléfono</th>
                <th>Condición laboral</th>
                <th>Fecha registro</th>
                <th class="text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="teachersList.length === 0">
                <td colspan="6" class="text-center py-6 text-medium-emphasis">
                  No se encontraron docentes.
                </td>
              </tr>
              <tr v-for="teacher in teachersList" :key="teacher.id">
                <td>
                  <div class="d-flex align-center gap-2 py-2">
                    <VAvatar color="primary" variant="tonal" size="36">
                      <VIcon icon="tabler-school" size="18" />
                    </VAvatar>
                    <span class="font-weight-medium">{{ teacher.names }}</span>
                  </div>
                </td>
                <td>{{ teacher.document_number }}</td>
                <td>{{ teacher.phone ?? "—" }}</td>
                <td>{{ teacher.working_condition_name ?? "—" }}</td>
                <td>{{ teacher.registration_date ?? "—" }}</td>
                <td class="text-center">
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
                        @click="editTeacher(teacher)"
                      />
                      <VListItem
                        prepend-icon="tabler-trash"
                        title="Eliminar"
                        base-color="error"
                        :disabled="deletingId === teacher.id"
                        @click="deleteTeacher(teacher.id)"
                      >
                        <template v-if="deletingId === teacher.id" #prepend>
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
                </td>
              </tr>
            </tbody>
          </VTable>
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

    <TeacherForm
      v-model="isModalOpen"
      :item="selectedTeacher"
      @saved="getList(true)"
    />
  </div>
</template>
<route lang="yaml">
meta:
  action: read
  subject: Teacher
</route>
