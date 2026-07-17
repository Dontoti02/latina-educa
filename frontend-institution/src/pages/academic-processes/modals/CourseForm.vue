<script setup lang="ts">
import AppTextarea from "@/@core/components/app-form-elements/AppTextarea.vue";
import { ToastService } from "@/common/util/toast.service";
import type { CourseItem, FormParamsItem } from "@/models/study-plan-form";
import { StudyPlanService } from "@/services/study-plan.service";

const props = defineProps<{
  course?: CourseItem | null;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "saved", data: CourseItem): void;
  (e: "updated", data: CourseItem): void;
}>();

const formRef = ref();
const loading = ref(false);

const defaultForm = (): CourseItem => ({
  id: null,
  name: null,
  code: null,
  year: null,
  credits: null,
  study_program_id: null,
  type_id: null,
  hours: null,
  description: null,
  is_active: true,
});

const form = ref<CourseItem>(
  props.course ? { ...props.course } : defaultForm(),
);

watch(
  () => props.course,
  (value) => {
    form.value = value ? { ...value } : defaultForm();
  },
);

const studyPrograms = ref<FormParamsItem[]>([]);
const courseTypes = ref<FormParamsItem[]>([]);

const required = (v: unknown) => !!v || "Este campo es obligatorio";
const positiveNumber = (v: unknown) =>
  (v !== null && v !== "" && Number(v) > 0) || "Debe ser un número positivo";

const loadParams = () => {
  loading.value = true;
  StudyPlanService.getFormParams()
    .then((response) => {
      studyPrograms.value = formatItemIdToString(response.data.study_programs);
      courseTypes.value = formatItemIdToString(response.data.types);
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      loading.value = false;
    });
};

const formatItemIdToString = (items: FormParamsItem[]) => {
  return items.map((item) => ({
    ...item,
    id: item.id.toString(),
  }));
};

const submit = async () => {
  const { valid } = await formRef.value?.validate();
  if (!valid) return;

  saveCourse();
};

const saveCourse = async () => {
  loading.value = true;
  try {
    const request = form.value.id
      ? StudyPlanService.updateCourse(form.value)
      : StudyPlanService.createCourse(form.value);

    const response = (await request).data;
    ToastService.success("Curso actualizado exitosamente");

    form.value.id ? emit("updated", response) : emit("saved", response);
  } catch (error: any) {
    ToastService.error(error);
  } finally {
    loading.value = false;
  }
};

const toggleCourseStatus = async () => {
  if (!form.value.id) return;

  loading.value = true;
  try {
    const response = await StudyPlanService.toggleCourseActiveStatus(
      form.value.id,
    );

    ToastService.success("Estado del curso actualizado");

    emit("updated", form.value);
  } catch (error: any) {
    ToastService.error(error);
  } finally {
    loading.value = false;
  }
};

const backToList = () => {
  form.value = defaultForm();
  formRef.value.reset();
  emit("close");
};

onMounted(() => {
  loadParams();
});
</script>

<template>
  <VForm ref="formRef" :disabled="loading" class="px-3">
    <VRow>
      <VCol cols="12">
        <VBtn
          variant="text"
          icon
          prepend-icon="ri-arrow-left-line"
          @click="backToList"
        >
          <VIcon>mdi-arrow-left</VIcon>
        </VBtn>

        <span class="text-h5 font-weight-bold ml-4">{{
          props.course
            ? `Editar curso: ${props.course.name} (${props.course.code})`
            : "Agregar nuevo curso"
        }}</span>
      </VCol>
      <VCol cols="12">
        <AppTextField v-model="form.name" label="Nombre" :rules="[required]" />
      </VCol>

      <VCol cols="12" sm="4">
        <AppTextField v-model="form.code" label="Código" :rules="[required]" />
      </VCol>
      <VCol cols="12" sm="4">
        <AppTextField
          v-model="form.year"
          label="Año"
          type="number"
          :rules="[required, positiveNumber]"
        />
      </VCol>
      <VCol cols="12" sm="4">
        <AppTextField
          v-model="form.credits"
          label="Créditos"
          type="number"
          :rules="[required, positiveNumber]"
        />
      </VCol>

      <VCol cols="12" sm="4">
        <AppSelect
          v-model="form.study_program_id"
          label="Programa de estudio"
          :items="studyPrograms"
          item-value="id"
          item-title="name"
          :rules="[required]"
        />
      </VCol>
      <VCol cols="12" sm="4">
        <AppSelect
          v-model="form.type_id"
          label="Tipo"
          :items="courseTypes"
          item-value="id"
          item-title="name"
          :rules="[required]"
        />
      </VCol>
      <VCol cols="12" sm="4">
        <AppTextField
          v-model="form.hours"
          label="Horas"
          type="number"
          :rules="[required, positiveNumber]"
        />
      </VCol>

      <VCol cols="12">
        <AppTextarea
          v-model="form.description"
          label="Descripción"
          rows="4"
          :rules="[required]"
        />
      </VCol>

      <VCol v-if="course" cols="12" class="d-flex align-center gap-2">
        <VCheckbox
          v-model="form.is_active"
          label="¿El curso está activo?"
          @change.stop="toggleCourseStatus()"
        />
      </VCol>
    </VRow>

    <VCardActions class="mt-4 justify-end">
      <VBtn color="primary" variant="outlined" @click="backToList">
        Cancelar
      </VBtn>
      <VBtn
        color="success"
        variant="outlined"
        :loading="loading"
        @click="submit"
      >
        Guardar
      </VBtn>
    </VCardActions>
  </VForm>
</template>
