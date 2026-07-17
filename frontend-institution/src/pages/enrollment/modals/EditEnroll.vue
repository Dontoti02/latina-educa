<script setup lang="ts">
import { ref } from "vue";
import ModalBasic from "@/common/components/Modal.vue";
import { EnrollmentService } from "@/services/enrollments.service";
import { Enrollment, FormsData } from "@/models/enrollment";
import { VSelect } from "vuetify/lib/components/index.mjs";
const form = ref({
  id: 0,
  person_id: 0,
  period_id: 0,
  study_program_id: 0,
  study_plan_id: 0,
  cycle_id: 0,
  shift_id: 0,
  section_id: 0,
  registration_date: "",
  scale_id: 0,
  scale_authorization_document_type: "",
  scale_authorization_document_number: 0,
  scale_authorization_full_names: "",
  observations: "",
});
const data = ref<Enrollment | null>({
  haveScale: false,
  enrollmentDate: "",
  period: "",
  studyProgram: "",
  studyPlan: "",
  cycle: "",
  shift: "",
  section: "",
  fullPayment: false,
  documentType: "",
  documentNumber: 0,
  fullName: "",
  scale: "",
  observations: "",
});
const formsData = ref<FormsData>();
const props = defineProps<{
  show: boolean;
  enrollId: number;
}>();

const emit = defineEmits<{
  (e: "close"): void;
  (e: "edit"): void;
}>();

const saveChanges = () => {
  form.value.cycle_id= formsData.value!.cycle.find(
    (cycle) => cycle.name == data.value!.cycle
  )!.id;
    form.value.section_id = formsData.value!.section.find(
        (section) => section.name == data.value!.section
    )!.id;
    form.value.period_id = formsData.value!.period.find(
        (period) => period.name == data.value!.period
    )!.id;
    form.value.study_program_id = formsData.value!.study_program.find(
        (program) => program.name == data.value!.studyProgram
    )!.id;
    form.value.study_plan_id = formsData.value!.study_plan.find(
        (plan) => plan.name == data.value!.studyPlan
    )!.id;
    form.value.shift_id = formsData.value!.shift.find(
        (shift) => shift.name == data.value!.shift
    )!.id;
    if (data.value!.haveScale) {
        form.value.scale_id = formsData.value!.scale.find(
            (scale) => scale.name == data.value!.scale
        )!.id;
    }
    EnrollmentService.updateEnrollment(form.value.id,form.value).then(() => {
        emit("edit");
        emit("close");
    });
};
const cycles = ref<string[]>([]);
const sections = ref<string[]>([]);
const periods = ref<string[]>([]);
const studyPrograms = ref<string[]>([]);
const studyPlans = ref<string[]>([]);
const shifts = ref<string[]>([]);
const scales = ref<string[]>([]);
onBeforeMount(() => {
  EnrollmentService.getFormsData().then((value) => {
    formsData.value = value.data;
    cycles.value = formsData.value.cycle.map((cycle) => cycle.name);
    console.log(cycles.value);
    sections.value = formsData.value.section.map((section) => section.name);
    periods.value = formsData.value.period.map((period) => period.name);
    studyPrograms.value = formsData.value.study_program.map(
      (program) => program.name
    );
    studyPlans.value = formsData.value.study_plan.map((plan) => plan.name);
    shifts.value = formsData.value.shift.map((shift) => shift.name);
    scales.value = formsData.value.scale.map((scale) => scale.name);
  });
});
watch(()=>data.value!.haveScale,(newVal)=>{
    if(newVal==false){
        form.value.scale_authorization_document_number=0;
        form.value.scale_authorization_document_type='';
        form.value.scale_authorization_full_names='';
        form.value.scale_id=-1
    }
});
watch(
  () => props.enrollId,
  async (newVal) => {
    if (newVal) {
      const enrollment = await EnrollmentService.getEnrollData(newVal);
      form.value = {
        id: enrollment.data.id,
        person_id: enrollment.data.person_id,
        period_id: enrollment.data.period_id,
        study_program_id: enrollment.data.study_program_id,
        study_plan_id: enrollment.data.study_plan_id,
        cycle_id: enrollment.data.cycle_id,
        shift_id: enrollment.data.shift_id,
        section_id: enrollment.data.section_id,
        registration_date: enrollment.data.registration_date,
        scale_id: enrollment.data.scale_id,
        scale_authorization_document_type:
          enrollment.data.scale_authorization_document_type,
        scale_authorization_document_number:
          enrollment.data.scale_authorization_document_number,
        scale_authorization_full_names:
          enrollment.data.scale_authorization_full_names,
        observations: enrollment.data.observations,
      };
      data.value = {
        haveScale: enrollment.data.scale_id != null,
        enrollmentDate: enrollment.data.registration_date,
        period: formsData.value!.period.find(
          (period) => period.id == enrollment.data.period_id
        )!.name,
        studyProgram: formsData.value!.study_program.find(
          (program) => program.id == enrollment.data.study_program_id
        )!.name,
        studyPlan: formsData.value!.study_plan.find(
          (plan) => plan.id == enrollment.data.study_plan_id
        )!.name,
        cycle: formsData.value!.cycle.find(
          (cycle) => cycle.id == enrollment.data.cycle_id
        )!.name,
        shift: formsData.value!.shift.find(
          (shift) => shift.id == enrollment.data.shift_id
        )!.name,
        section: formsData.value!.section.find(
          (section) => section.id == enrollment.data.section_id
        )!.name,
        fullPayment: enrollment.data.is_full_payment,
        documentType: form.value.scale_authorization_document_type,
        documentNumber: form.value.scale_authorization_document_number,
        fullName: form.value.scale_authorization_full_names,
        scale: enrollment.data.scale_id
          ? formsData.value!.scale.find(
              (scale) => scale.id == enrollment.data.scale_id
            )!.name
          : "",
        observations: enrollment.data.observations,
      };
    }
  }
);
</script>
<template>
    <ModalBasic :visible="props.show" is-persistent width="1000" is-scrollable>
      <VCard class="form-card">
        <VToolbar class="form-toolbar">
          <VToolbarTitle>Editar Inscripción</VToolbarTitle>
          <VSpacer />
          <VBtn icon @click="emit('close')">
            <VIcon>mdi-close</VIcon>
          </VBtn>
        </VToolbar>
        <VCardText class="form-body">
          <VForm>
            <VRow>
                <VCol cols="12" sm="6">
                    <v-select
              label="Periodo"
              :items="periods"
              v-model="data!.period"
              dense
              outlined
              class="form-field"
            ></v-select>
                </VCol>
            <VCol cols="12" sm="6">
                <v-select
              label="Programa de estudios"
              :items="studyPrograms"
              v-model="data!.studyProgram"
              dense
              outlined
              class="form-field"
            ></v-select>
                </VCol>
            </VRow>
            <VRow>
                <VCol cols="12" sm="6">
                    <v-select
                      label="Plan de estudios"
                      :items="studyPlans"
                      v-model="data!.studyPlan"
                      dense
                      outlined
                      class="form-field"
                    ></v-select>
                </VCol>
                <VCol cols="12" sm="6">
            <v-select
              label="Ciclo"
              :items="cycles"
              v-model="data!.cycle"
              dense
              outlined
              class="form-field"
            ></v-select>
        </VCol>
    </VRow>
            <VRow>
                <VCol cols="12" sm="6">

            <v-select
              label="Turno"
              :items="shifts"
              v-model="data!.shift"
              dense
              outlined
              class="form-field"
            ></v-select>
        </VCol>
            <VCol cols="12" sm="6">
                <v-select
                  label="Sección"
                  :items="sections"
                  v-model="data!.section"
                  dense
                  outlined
                  class="form-field"
                ></v-select>
            </VCol>
            </VRow>
            <VRow>
                <VCol cols="12" sm="6">
            <VTextField
              v-model="form.registration_date"
              label="Fecha de Registro"
              type="date"
              dense
              class="form-field"
            />
        </VCol>
        <VCol cols="12" sm="6">
            <VCheckbox
              v-model="data!.haveScale"
              label="¿Escala Habilitada?"
              class="form-checkbox"
            />
        </VCol></VRow>
            <div v-if="data!.haveScale" class="form-scale-section">
                <VRow>
                    <VCol cols="12" sm="6">
              <v-select
                label="Escala"
                :items="scales"
                v-model="data!.scale"
                dense
                outlined
                class="form-field"
              ></v-select>
            </VCol>
            <VCol cols="12" sm="6">
                <v-select
              label="Tipo de Documento"
              :items="['DNI', 'CE']"
              v-model="form.scale_authorization_document_type"
              dense
              outlined
              class="form-field"
            ></v-select>
              
            </VCol>
                </VRow>
                <VRow>
                    <VCol cols="12" sm="6">
              <VTextField
                v-model="form.scale_authorization_document_number"
                label="Numero de Documento"
                dense
                class="form-field"
              />
            </VCol>
            <VCol cols="12" sm="6">
              <VTextField
                v-model="form.scale_authorization_full_names"
                label="Nombre Completo"
                dense
                class="form-field"
              />
            </VCol>
        </VRow>
            </div>
            <VTextarea
              v-model="form.observations"
              label="Observaciones"
              dense
              class="form-field"
            />
          </VForm>
        </VCardText>
        <VCardActions class="form-actions" style="align-self: self-end;">
          <div class="action-buttons">
            <VBtn
              class="px-4"
              color="primary"
              variant="outlined"
              @click="emit('close')"
            >
              Cancelar
            </VBtn>
            <VBtn variant="elevated" class="px-4" color="success" @click="saveChanges">
              Guardar
            </VBtn>
          </div>
        </VCardActions>
      </VCard>
    </ModalBasic>
  </template>
  
  <style scoped>
  .form-card {
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }
  
  .form-toolbar {
    padding: 12px 16px;

    border-top-left-radius: 12px;
    border-top-right-radius: 12px;
  }
  
  .form-toolbar .v-toolbar-title {
    font-weight: 600;
    font-size: 20px;
  }
  
  .form-body {
    padding: 24px;
  }
  
  .form-field {
    margin-bottom: 20px;
  }
  
  .form-checkbox {
    margin-bottom: 20px;
  }
  
  .form-scale-section {
    padding: 16px;
    border-radius: 8px;
    margin-bottom: 20px;
  }
  
  .form-actions {
    padding: 16px;
  }
  
  .action-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 16px;
  }
  </style>
  