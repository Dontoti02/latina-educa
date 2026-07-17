<script setup lang="ts">
import modalService from "@/common/util/modal.service";
import { ToastService } from "@/common/util/toast.service";
import { FormParamsItem, StudyPlan } from "@/models/study-plan-form";
import { StudyPlansTypes } from "../enums/StudyPlans.enum";
import { StudyPlanService } from "@/services/study-plan.service";

const props = defineProps<{
  studyPlan?: StudyPlan | null;
}>();

const emit = defineEmits(["close", "saved"]);

const form = ref<StudyPlan>({
  id: null,
  studyProgramId: null,
  typeId: null,
  name: "",
  year: new Date().getFullYear(),
  numberOfCycles: null,
  isActive: true,
  scoreMinToPassNumber: null,
  scoreMinToPassLetter: null,
});

const required = (v: unknown) => !!v || "Este campo es obligatorio";

const positiveOrZero = (v: unknown) =>
  (v !== null && v !== "" && Number(v) >= 0) ||
  "Solo se permiten números positivos";

const singleLetter = (v: unknown) =>
  (typeof v === "string" && /^[a-zA-Z]$/.test(v)) ||
  "Solo se permite una letra";

const studyPlanTypes = ref<FormParamsItem[]>([]);

const studyPrograms = ref<FormParamsItem[]>([]);

watch(
  () => props.studyPlan,
  (value) => {
    if (value) Object.assign(form, value);
  },
  { immediate: true },
);

const formRef = ref();
const loading = ref(false);

const saveStudyPlan = async () => {
  const { valid } = await formRef.value?.validate();
  if (!valid) return;

  if (form.value.id) {
    const confirm = await modalService.confirmation({
      title: "¿Está seguro que desea guardar los cambios?",
      content: `¿Está seguro de cambiar los datos del plan de estudio?`,
    });

    if (!confirm) return;
  }

  loading.value = true;

  const response = StudyPlanService.createStudyPlan(form.value);

  await response
    .then((res) => {
      ToastService.success("Plan de estudio guardado correctamente");
      form.value.id = res.data.id;
      emit("saved", form.value);
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      loading.value = false;
    });
};

const getFormParams = () => {
  loading.value = true;
  StudyPlanService.getFormParams()
    .then((response) => {
      studyPlanTypes.value = response.data.types.map((i) => ({
        ...i,
        id: i.id.toString(),
      }));
      studyPrograms.value = response.data.study_programs.map((i) => ({
        ...i,
        id: i.id.toString(),
      }));
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
      loading.value = false;
    });
};

onMounted(() => {
  getFormParams();
});

const closeModal = () => emit("close");
</script>
<template>
  <VForm ref="formRef" :disabled="loading">
    <VRow>
      <VCol cols="12">
        <AppTextField
          label="Nombre"
          v-model="form.name"
          type="text"
          :rules="[required]"
        />
      </VCol>
      <VCol lg="6" cols="12">
        <AppTextField
          label="Año"
          v-model="form.year"
          type="number"
          :rules="[required, positiveOrZero]"
        />
      </VCol>
      <VCol lg="6" cols="12">
        <AppSelect
          label="Tipo"
          v-model="form.typeId"
          item-value="id"
          item-title="name"
          :items="studyPlanTypes"
          :rules="[required]"
        />
      </VCol>
      <VCol lg="6" cols="12">
        <AppSelect
          label="Programa de estudio"
          v-model="form.studyProgramId"
          item-value="id"
          item-title="name"
          :items="studyPrograms"
          :rules="[required]"
        />
      </VCol>
      <VCol lg="6" cols="12">
        <AppTextField
          label="Ciclos"
          v-model="form.numberOfCycles"
          type="number"
          :rules="[required, positiveOrZero]"
        />
      </VCol>
      <VCol lg="6" cols="12">
        <AppTextField
          label="Nota numérica mínima de aprobación"
          v-model="form.scoreMinToPassNumber"
          type="number"
          :rules="[required, positiveOrZero]"
        />
      </VCol>
      <VCol lg="6" cols="12">
        <AppTextField
          label="Nota literal mínima de aprobación"
          v-model="form.scoreMinToPassLetter"
          type="text"
          :rules="[required, singleLetter]"
        />
      </VCol>
    </VRow>
  </VForm>
  <VCardActions class="mt-4" style="justify-content: end">
    <VBtn color="primary" variant="outlined" @click="closeModal">
      Cancelar
    </VBtn>
    <VBtn
      v-if="!form.id"
      color="success"
      @click="saveStudyPlan"
      :loading="loading"
      :disabled="loading"
      variant="outlined"
    >
      Guardar
    </VBtn>
  </VCardActions>
</template>
