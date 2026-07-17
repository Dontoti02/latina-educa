<script setup lang="ts">
import { VSkeletonLoader } from "vuetify/lib/labs/components.mjs";
import BulbLightImg from "@images/illustrations/bulb-light.png";
import PencilRocketImg from "@images/illustrations/pencil-rocket.png";
import AppTextField from "@/@core/components/app-form-elements/AppTextField.vue";
import { VBtn, VIcon } from "vuetify/lib/components/index.mjs";
import AppSelect from "@/@core/components/app-form-elements/AppSelect.vue";
import CapacitationCard from "@/components/capacitations/capacitation-card.vue";
import { CapacitationsList, FilterModel } from "@/models/capacitations";
import router from "@/router";
import { SessionStore } from "@/common/store";
import { useAppAbility } from "@/plugins/casl/useAppAbility";
import { changeRole } from '@/utils/system-configuration'
import { computed, defineProps, defineEmits, onMounted, ref } from "vue";
const ability = useAppAbility()

const props = defineProps<{
  text: {
    title: string;
    description: string;
  };
  isAdmin?: boolean;
  loading: boolean;
  capacitationsList?: CapacitationsList;
  filters: Array<FilterModel>;
}>();

const emits = defineEmits<{
  (e: "certification", capacitationId: number): void;
  (e: "search", search: string): void;
  (e: "hideCompleted", hide: boolean): void;
  (e: "category", category: number): void;
  (e: "add"): void;
  (e: "changePage", page: number): void;
}>();

const searchQuery = ref("");
const hideCompleted = ref(false);
const category = ref(null);
const currentPage = ref(1);

const session = SessionStore();

const currentRole = ref(session.user?.role.id);

const rolesCapacitationDictionary : Record<string,string> = {
  5: "Coordinador de capacitaciones",
  6: "Docente de capacitaciones",
  7: "Estudiante de capacitaciones",
}
const rolesCapacitation = computed(() =>  {
  return session.roles.filter((r) => r.level === 2).map((r) => {
    return {
      id: r.id,
      name: rolesCapacitationDictionary[r.id],
    };
  })
});

const changeRoleAction = async(roleId: number) => {
  await changeRole(roleId, ability)
}

onMounted(() => {
  // console.log({ roles: roles.value });
});
</script>
<template>
  <div>
    <div>
      <VCard class="mb-6">
        <VRow>
          <VCol cols="3" class="pl-8 pt-6 d-sm-flex d-none">
            <img :src="BulbLightImg" height="130" class="mt-10 ml-6" />
          </VCol>
          <VCol
            sm="6"
            cols="12"
            class="pt-6 px-8 d-flex text-center justify-center align-center flex-column"
          >
            <h1
              class="mt-10 mb-5 card-title"
              style="font-size: 1.5rem; font-weight: 500"
              v-html="text.title"
            ></h1>
            <p class="d-sm-flex d-none">
              {{ text.description }}
            </p>
            <VRow class="w-100 mb-5">
              <VCol cols="8" sm="10">
                <AppTextField
                  :disabled="loading"
                  v-model="searchQuery"
                  placeholder="Buscar capacitación ..."
                  density="compact"
                  clearable
                />
              </VCol>
              <VCol cols="4" sm="2">
                <VBtn :disabled="loading" @click="emits('search', searchQuery)">
                  <VIcon icon="tabler-search" />
                </VBtn>
              </VCol>
            </VRow>
          </VCol>
          <VCol cols="3" class="justify-end align-end d-sm-flex d-none">
            <img :src="PencilRocketImg" height="188" />
          </VCol>
        </VRow>
      </VCard>
      <div v-if="loading" class="mt-4 w-100 d-flex justify-center rounded-lg">
        <VRow>
          <VCol v-for="index in 6" :key="index" cols="12" sm="6" md="4">
            <VSkeletonLoader class="w-100 gap-4" type="card" />
          </VCol>
        </VRow>
      </div>
      <VCard v-else>
        <VRow class="px-5 pt-6 pb-sm-1 pb-0 mx-0">
          <VCol :lg="isAdmin ? 4 : 6" :md="isAdmin ? 3 : 6" sm="6" cols="12">
            <h2 class="font-weight-medium" style="font-size: 18px">
              {{ isAdmin ? "Listado de capacitaciones" : "Mis capacitaciones" }}
            </h2>
            <p class="mb-0">
              {{ capacitationsList?.total }} capacitaciones encontradas
            </p>
          </VCol>
          <VCol md="3" sm="6" cols="12" class="d-flex justify-end">
            <VSwitch
              v-model="hideCompleted"
              label="Solo completados"
              hide-details
              hide-spin-buttons
              @update:modelValue="emits('hideCompleted', $event)"
            />
          </VCol>
          <VCol md="3" :sm="isAdmin ? 6 : 12" cols="12">
            <AppSelect
              v-model="currentRole"
              :items="rolesCapacitation"
              item-title="name"
              item-value="id"
              hide-details
              placeholder="Modo de visualización"
              clearable
              @update:modelValue="changeRoleAction($event)"
            />
          </VCol>
          <VCol v-if="isAdmin" lg="2" md="3" sm="6" cols="12">
            <VBtn
              @click="router.push({ path: '/capacitation/manage/create' })"
              append-icon="tabler-plus"
              color="primary"
              block
            >
              Agregar nuevo
            </VBtn>
          </VCol>
        </VRow>
        <VRow
          v-if="capacitationsList && capacitationsList!.total > 0"
          class="px-sm-5 px-1 mx-0"
        >
          <VCol
            md="4"
            sm="6"
            cols="12"
            v-for="capacitation in capacitationsList?.data"
            :key="'capacitation' + capacitation.id"
            ><CapacitationCard
              :isAdmin="isAdmin!"
              :data-card="capacitation"
              @certification="emits('certification', 1)"
          /></VCol>
        </VRow>
        <VRow class="mb-10" v-else>
          <VCol>
            <p class="text-center">No se encontró ninguna capacitación</p>
          </VCol>
        </VRow>
        <VRow
          v-if="capacitationsList && capacitationsList!.total > 0"
          class="pb-5"
        >
          <VCol>
            <VPagination
              v-model="currentPage"
              :length="
                Math.ceil(
                  (capacitationsList?.total ?? 1) /
                    (capacitationsList?.size ?? 1)
                )
              "
              :total-visible="
                $vuetify.display.xs
                  ? 1
                  : Math.ceil(
                      (capacitationsList?.total ?? 1) /
                        (capacitationsList?.size ?? 1)
                    )
              "
              show-first-last-page
              last-icon="tabler-chevrons-right"
              first-icon="tabler-chevrons-left"
              @update:modelValue="emits('changePage', $event)"
            >
            </VPagination>
          </VCol>
        </VRow>
      </VCard>
    </div>
  </div>
</template>
<style scoped lang="css"></style>
