<script setup lang="ts">
import ModalBasic from "@/common/components/Modal.vue";
import { VDatePicker } from "vuetify/labs/VDatePicker";
import { reactive, ref, watch } from "vue";
import { Period, PeriodForm } from "@/models/period-form";
import { AcademicPeriodService } from "@/services/academic-period.service";
import { ToastService } from "@/common/util/toast.service";
import modalService from "@/common/util/modal.service";
import {
  AcademicPeriodItem,
  CreateAcademicPeriodBody,
} from "@/models/academic-periods";

const props = defineProps<{
  show: boolean;
  period?: AcademicPeriodItem | null;
}>();
const emit = defineEmits(["close", "saved"]);

const inputControls = reactive({
  period: {
    startMenu: false,
    endMenu: false,
  },
  enrollments: {
    startMenu: false,
    endMenu: false,
  },
  sections: {
    startMenu: false,
    endMenu: false,
  },
});

const form = ref<PeriodForm>({
  id: null,
  name: null,
  period: {
    start: null,
    end: null,
  },
  enrollment: {
    start: null,
    end: null,
  },
  sections: {
    start: null,
    end: null,
  },
  failedStudents: {
    maxAmount: "",
    requiresPayment: false,
    isNumbertoFail: null,
  },
});

const formRef = ref();

const required = (v: unknown) => !!v || "Este campo es obligatorio";

watch(
  () => props.period,
  (value) => {
    form.value = {
      id: value?.id?.value ?? null,
      name: value?.name?.value ?? null,
      period: {
        start: value?.start_date?.value
          ? new Date(value.start_date.value)
          : null,
        end: value?.end_date?.value ? new Date(value.end_date.value) : null,
      },
      enrollment: {
        start: value?.enrollment_start_date?.value
          ? new Date(value.enrollment_start_date.value)
          : null,
        end: value?.enrollment_end_date?.value
          ? new Date(value.enrollment_end_date.value)
          : null,
      },
      sections: {
        start: value?.section_start_date?.value
          ? new Date(value.section_start_date.value)
          : null,
        end: value?.section_end_date?.value
          ? new Date(value.section_end_date.value)
          : null,
      },
      failedStudents: {
        maxAmount: String(value?.is_number_to_fail?.value ?? ""),
        requiresPayment: value?.is_required_enrollment_payment?.value ?? false,
        isNumbertoFail:
          value?.is_number_to_fail?.value != null
            ? String(value.is_number_to_fail.value)
            : null,
      },
    };
  },
  { immediate: true },
);

const formatDate = (date: Date | null) =>
  date ? new Date(date).toLocaleDateString("es-PE") : "";

const closeModal = () => emit("close");

const savePeriod = async () => {
  const { valid } = await formRef.value?.validate();
  if (!valid) return;

  if (form.value.id) {
    const confirm = await modalService.confirmation({
      title: "¿Está seguro que desea guardar los cambios?",
      content: `¿Está seguro de cambiar los datos del periodo académico?`,
    });

    if (!confirm) return;
  }

  const response = form.value.id
    ? AcademicPeriodService.updatePeriod({
        ...formatBodyRequest(form.value),
        id: form.value.id,
      })
    : AcademicPeriodService.createPeriod(formatBodyRequest(form.value));

  response
    .then(() => {
      ToastService.success("Periodo académico guardado correctamente");
      emit("saved");
      closeModal();
    })
    .catch((error) => {
      ToastService.error(error);
    });
};

const formatBodyRequest = (
  requestForm: PeriodForm,
): CreateAcademicPeriodBody => {
  return {
    name: requestForm.name ?? "",
    start_date: requestForm.period.start?.toISOString() ?? "",
    end_date: requestForm.period.end?.toISOString() ?? "",
    enrollment_start_date: requestForm.enrollment.start?.toISOString() ?? "",
    enrollment_end_date: requestForm.enrollment.end?.toISOString() ?? "",
    section_start_date: requestForm.sections.start?.toISOString() ?? "",
    section_end_date: requestForm.sections.end?.toISOString() ?? "",
    is_number_to_fail: Number(requestForm.failedStudents.isNumbertoFail) || 0,
    section_max_to_fail: Number(requestForm.failedStudents.maxAmount),

    is_required_enrollment_payment: requestForm.failedStudents.requiresPayment,
  };
};
</script>

<template>
  <ModalBasic :visible="show" @close="closeModal" max-width="600px" width="90%">
    <VCard>
      <VToolbar flat color="primary" class="text-white">
        <VToolbarTitle>{{
          form.id
            ? "Editar periodo académico"
            : "Agregar nuevo periodo académico"
        }}</VToolbarTitle>
      </VToolbar>
      <VCardText>
        <VForm ref="formRef">
          <!-- Periodo -->
          <div class="text-subtitle-1 font-weight-bold mb-2">Periodo</div>
          <VRow class="mb-4">
            <VCol cols="12" class="mb-2">
              <VTextField
                label="Nombre del periodo académico"
                v-model="form.name"
                :rules="[required]"
                :disabled="period?.name.is_editable === false"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VMenu
                v-model="inputControls.period.startMenu"
                :close-on-content-click="false"
              >
                <template #activator="{ props: menuProps }">
                  <VTextField
                    v-bind="menuProps"
                    label="Fecha Inicio"
                    :model-value="formatDate(form.period.start)"
                    :rules="[required]"
                    readonly
                    :disabled="period?.start_date?.is_editable === false"
                  />
                </template>
                <VDatePicker
                  v-model="form.period.start"
                  hide-header
                  @update:model-value="inputControls.period.startMenu = false"
                />
              </VMenu>
            </VCol>
            <VCol cols="12" md="6">
              <VMenu
                v-model="inputControls.period.endMenu"
                :close-on-content-click="false"
              >
                <template #activator="{ props: menuProps }">
                  <VTextField
                    v-bind="menuProps"
                    label="Fecha Final"
                    :model-value="formatDate(form.period.end)"
                    :rules="[required]"
                    readonly
                    :disabled="period?.end_date?.is_editable === false"
                  />
                </template>
                <VDatePicker
                  v-model="form.period.end"
                  hide-header
                  @update:model-value="inputControls.period.endMenu = false"
                />
              </VMenu>
            </VCol>
          </VRow>

          <!-- Matricula -->
          <div class="text-subtitle-1 font-weight-bold mb-2">Matricula</div>
          <VRow class="mb-2">
            <VCol cols="12" md="6">
              <VMenu
                v-model="inputControls.enrollments.startMenu"
                :close-on-content-click="false"
              >
                <template #activator="{ props: menuProps }">
                  <VTextField
                    v-bind="menuProps"
                    label="Fecha Inicio"
                    :model-value="formatDate(form.enrollment.start)"
                    :rules="[required]"
                    readonly
                    :disabled="
                      period?.enrollment_start_date?.is_editable === false
                    "
                  />
                </template>
                <VDatePicker
                  v-model="form.enrollment.start"
                  hide-header
                  @update:model-value="
                    inputControls.enrollments.startMenu = false
                  "
                />
              </VMenu>
            </VCol>
            <VCol cols="12" md="6">
              <VMenu
                v-model="inputControls.enrollments.endMenu"
                :close-on-content-click="false"
              >
                <template #activator="{ props: menuProps }">
                  <VTextField
                    v-bind="menuProps"
                    label="Fecha Final"
                    :model-value="formatDate(form.enrollment.end)"
                    :rules="[required]"
                    readonly
                    :disabled="
                      period?.enrollment_end_date?.is_editable === false
                    "
                  />
                </template>
                <VDatePicker
                  v-model="form.enrollment.end"
                  hide-header
                  @update:model-value="
                    inputControls.enrollments.endMenu = false
                  "
                />
              </VMenu>
            </VCol>
          </VRow>

          <!-- Secciones -->
          <div class="text-subtitle-1 font-weight-bold mb-2">Secciones</div>
          <VRow class="mb-2">
            <VCol cols="12" md="6">
              <VMenu
                v-model="inputControls.sections.startMenu"
                :close-on-content-click="false"
              >
                <template #activator="{ props: menuProps }">
                  <VTextField
                    v-bind="menuProps"
                    label="Fecha Inicio"
                    :model-value="formatDate(form.sections.start)"
                    :rules="[required]"
                    readonly
                    :disabled="
                      period?.section_start_date?.is_editable === false
                    "
                  />
                </template>
                <VDatePicker
                  v-model="form.sections.start"
                  hide-header
                  @update:model-value="inputControls.sections.startMenu = false"
                />
              </VMenu>
            </VCol>
            <VCol cols="12" md="6">
              <VMenu
                v-model="inputControls.sections.endMenu"
                :close-on-content-click="false"
              >
                <template #activator="{ props: menuProps }">
                  <VTextField
                    v-bind="menuProps"
                    label="Fecha Final"
                    :model-value="formatDate(form.sections.end)"
                    :rules="[required]"
                    readonly
                    :disabled="period?.section_end_date?.is_editable === false"
                  />
                </template>
                <VDatePicker
                  v-model="form.sections.end"
                  hide-header
                  @update:model-value="inputControls.sections.endMenu = false"
                />
              </VMenu>
            </VCol>
          </VRow>

          <!-- Desaprobados -->
          <div class="text-subtitle-1 font-weight-bold mb-2">Desaprobados</div>
          <VRow>
            <VCol cols="12" md="6">
              <VSelect
                v-model="form.failedStudents.isNumbertoFail"
                label="Tipo de desaprobados"
                :items="[
                  { text: 'Cantidad de cursos', value: '0' },
                  { text: 'Porcentaje de cantidad de cursos', value: '1' },
                  { text: 'Porcentaje de créditos', value: '2' },
                ]"
                item-title="text"
                item-value="value"
                :rules="[required]"
                :disabled="period?.is_number_to_fail?.is_editable === false"
              />
            </VCol>
            <VCol cols="12" md="6">
              <VTextField
                label="Cantidad de desaprobados"
                v-model="form.failedStudents.maxAmount"
                type="number"
                :rules="[required]"
                class="mb-8"
                :disabled="period?.is_number_to_fail?.is_editable === false"
              />
            </VCol>
          </VRow>

          <VRow>
            <VCol cols="12" md="6">
              <VCheckbox
                v-model="form.failedStudents.requiresPayment"
                label="Obligatoriedad de pago"
                density="compact"
                :disabled="
                  period?.is_required_enrollment_payment?.is_editable === false
                "
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
      <VCardActions style="justify-content: end">
        <VBtn color="primary" variant="outlined" @click="closeModal">
          Cancelar
        </VBtn>
        <VBtn color="success" @click="savePeriod"> Guardar </VBtn>
      </VCardActions>
    </VCard>
  </ModalBasic>
</template>
