<script setup lang="ts">
import { TrainingStateEnum } from "@/common/enum/participant-state.enum";
import { ToastService } from "@/common/util/toast.service";
import { Capacitation } from "@/models/capacitations";
import { CapacitationService } from "@/services/capacitations.service";
import { ImageUtils } from "@/utils/images";
import { VCol } from "vuetify/lib/components/index.mjs";

const props = defineProps<{
  isAdmin: boolean;
  dataCard: Capacitation;
}>();

//Reference to enrouter
const router = useRouter();

const emits = defineEmits<{
  (e: "certification", capacitationId: number): void;
}>();

const percentage = ref(0);

//function to process the minutes remaining
const processMinutes = (minutes: number, total_minutes: number) => {
  percentage.value = processMinutesToPercentage(minutes, total_minutes);
  if (props.dataCard.status === "Finalizado") return "Completado";
  if (minutes >= 1440) {
    const days = Math.round(minutes / 1440);
    return `${days} dias restantes`;
  } else if (minutes >= 60) {
    const hours = Math.round(minutes / 60);
    return `${hours} horas restantes`;
  } else {
    return `${Math.round(minutes)} minutos restantes`;
  }
};

//function to mark a capacitation as favorite
const markAsFavorite = (dataCard: Capacitation) => {
  CapacitationService.setFavorite(dataCard.id).then((response) => {
    if (response.success) {
      dataCard.is_favorite = dataCard.is_favorite === 1 ? 0 : 1;
      ToastService.success(response.message);
    }
  });
};

//function to process the minutes remaining to get a percentage
const processMinutesToPercentage = (
  remaining_minutes: number,
  totalMinutes: number
) => {
  if (props.dataCard.status === "Finalizado") return 100;
  else if (props.dataCard.status === "No iniciado") return 0;
  else if (props.dataCard.total_minutes === null) return 100;
  return (remaining_minutes / totalMinutes) * 100;
};
</script>
<template>
  <VCard elevation="0" border class="pa-2" style="height: 100%">
    <VCard
      v-if="!dataCard.image"
      elevation="0"
      color="#E9E7FD"
      class="py-8 d-flex justify-center align-center"
      height="255"
    >
      <VIcon icon="tabler-school" color="primary" size="80px" />
    </VCard>
    <VImg
      v-else
      class="rounded-sm"
      :src="ImageUtils.getUrlImage(dataCard.image)"
      height="255"
      cover
    />
    <VRow class="pt-3 pb-1 px-1 ma-0">
      <VCol class="d-flex gap-3 align-center">
        <v-chip
          class="text-sm"
          label
          size="x-small"
          :color="'primary'
          "
        >
          {{ dataCard.category }}
        </v-chip>
        <v-chip
          class="text-sm"
          label
          size="x-small"
          :color="
            dataCard.status === 'No iniciado'
              ? 'warning'
              : dataCard.status === 'Finalizado'
              ? 'danger'
              : 'success'
          "
        >
          {{ dataCard.status }}
        </v-chip>
      </VCol>
      <VCol class="d-flex justify-end align-center">
        <VBtn
          v-if="dataCard.is_student"
          variant="text"
          icon
          class="me-1"
          size="30px"
          @click="markAsFavorite(dataCard)"
          ><VIcon
            v-if="dataCard.is_favorite === 1"
            color="red"
            icon="tabler-star-filled"
            size="25px"
          />
          <VIcon v-else color="primary" icon="tabler-star" size="25px" />
        </VBtn>

        <p class="ma-0 me-2">
          ({{ `${dataCard.students}/${dataCard.max_participants}` }})
        </p>
        <VBtn
          v-if="isAdmin"
          variant="text"
          icon
          size="30px"
          @click="
            router.push({ path: `/capacitation/students/${dataCard.id}` })
          "
          ><VIcon color="primary" icon="tabler-user-edit" size="25px"
        /></VBtn>
        <VIcon v-else color="primary" icon="tabler-users" size="25px" />
      </VCol>
    </VRow>
    <VRow class="px-1 pb-3 ma-0">
      <VCol class="py-0 px-sm-3 px-1">
        <h3 class="ma-0 text-ellipsis" :title="dataCard.name">
          {{ dataCard.name }}
        </h3>
        <p
          class="ma-0 text-multiline-ellipsis"
          style="height: 68.5px"
          :title="dataCard.short_description"
        >
          {{ dataCard.short_description }}
        </p>
      </VCol>
    </VRow>
    <VRow class="px-1 ma-0 mb-4">
      <VCol cols="12" class="py-0 d-flex mb-1 px-sm-3 px-1 justify-space-between w-full items-end">
        <div >
          <VIcon class="mr-1" icon="tabler-clock" />
          <span class="ma-0 text-sm" v-if="dataCard.minutes_remaining">
            {{ processMinutes(dataCard.minutes_remaining, dataCard.total_minutes) }}
          </span>
          <span v-else>
            {{  '----' }}
          </span>
        </div>
        <span class="ma-0 text-sm" v-if="dataCard.status_id !== TrainingStateEnum.NOT_STARTED">
           {{ dataCard.status_id === TrainingStateEnum.IN_PROGRESS ? 'Finaliza el' : 'Finalizado el' }}  {{ dataCard.end_date }}
        </span>
      </VCol>
      <VCol cols="12" class="py-0 px-sm-3 px-1">
        <VProgressLinear v-model="percentage" color="primary" height="10px" />
      </VCol>
    </VRow>
    <VRow class="px-1 ma-0 mb-3">
      <VCol
        v-if="isAdmin"
        cols="12"
        class="py-0 mb-1 px-sm-3 px-1 d-flex gap-4 flex-xl-row flex-column"
        style="max-width: 100%"
      >
        <VBtn
          class="flex-grow-1"
          color="secondary"
          prepend-icon="tabler-pencil"
          @click="router.push({ path: `/capacitation/manage/${dataCard.id}` })"
          >Configurar</VBtn
        >
      </VCol>
      <VCol
        v-else
        cols="12"
        class="py-0 mb-1 px-sm-3 px-1 d-flex gap-4 flex-xl-row flex-column"
        style="max-width: 100%"
      >
        <VBtn
          v-if="dataCard.status === 'Finalizado' && dataCard.is_student"
          class="flex-grow-1"
          color="secondary"
          prepend-icon="tabler-certificate"
          @click="emits('certification', 1)"
          >Certificado
        </VBtn>
        <span
          class="d-xl-none d-block"
          style="height: 38.04px; width: 100%"
          v-else
        />
        <VBtn
          class="flex-grow-1"
          color="primary"
          append-icon="tabler-chevron-right"
          @click="
            () => {
              if (dataCard.is_student) {
                router.push({
                  path: `/capacitation/student-course/${dataCard.id}`,
                });
                return;
              }
              router.push({
                path: `/capacitation/teacher-course/${dataCard.id}`,
              });
            }
          "
          >Acceder</VBtn
        >
      </VCol>
    </VRow>
  </VCard>
</template>
<style scoped>
.text-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.text-multiline-ellipsis {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 67.5px;
}
</style>
