<script setup lang="ts">
import BulbLightImg from "@images/illustrations/bulb-light.png";
import PencilRocketImg from "@images/illustrations/pencil-rocket.png";
import { VSkeletonLoader } from "vuetify/labs/VSkeletonLoader";
import Stepper from "@/components/enrollment/Stepper.vue";
import { VCol, VRow } from "vuetify/lib/components/index.mjs";
import PersonalDataForm from "./PersonalDataForm.vue";
import ContactDataForm from "./ContactDataForm.vue";
import AcademicDataForm from "./AcademicDataForm.vue";
import FamiliarDataForm from "./FamiliarDataForm.vue";
import EnrollDataForm from "./enrollDataForm.vue";
import SearchStudentForm from "./SearchStudentForm.vue";
import { AcademicData, ContactData, FamiliarData, PersonalData, Enrollment, FormsData, FinalEnrollment } from "@/models/enrollment";
import { EnrollmentService } from "@/services/enrollments.service";
import { ToastService } from "@/common/util/toast.service";
import PayEnrollMentModal from "./modals/PayEnrollMentModal.vue";
import NewScale from "./modals/newScale.vue";
import { Scale } from "@/models/payment-concepts";

// Initial
const loading = ref(false);
const enrollType = ref("regular");
const currentStep = ref(0);
const steps = ref(["Busqueda de Estudiantes", "Datos de Matricula"]);
const showPaymentModal = ref(false);
const showNewScaleModal = ref(false);
const scaleAmount = ref(0);
const formsData = ref<FormsData>()
const enrollId = ref(0);
const stepsCompleted = ref<number[]>([]);
const progressData = ref<{
  personal_data: PersonalData | null;
  contact_data: ContactData | null;
  academic_data: AcademicData | null;
  familiar_data: FamiliarData[] | null;
  enrollment: Enrollment | null;
  personId: Number | null;
}>({
  personal_data: null,
  contact_data: null,
  academic_data: null,
  familiar_data: null,
  enrollment: null,
  personId: null,
});
const finalEnrollmentData = ref<FinalEnrollment>();

const updateScales = (scale: Scale) => {
  formsData.value?.scale.pop();
  formsData.value!.scale.push(scale);
  formsData.value!.scale.push({ id: -1, name: "Nueva Escala*", scale_amount: 0 });
}

const changeEnrollType = (type: any) => {
  if (type.target.value === "regular") {
    steps.value = ["Busqueda de Estudiantes", "Datos de Matricula"];
  } else if (type.target.value === "ingresante") {
    steps.value = [
      "Datos Personales",
      "Datos de Contacto",
      "Datos Académicos",
      "Datos Familiares",
      "Datos de Matricula",
    ];
  }
  localStorage.setItem('enrollType', type.target.value);
  clearLocalStorageData();
  clearAllDataWithoutChangeRol();
  currentStep.value = 0;
};
const getBase64 = (file: any) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file[0]);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}
const savePersonalData = (data: PersonalData) => {
  progressData.value!.personal_data = data;
  localStorage.setItem('personal_data', JSON.stringify(data));
};
const saveContactData = (data: ContactData) => {
  progressData.value!.contact_data = data;
  localStorage.setItem('contact_data', JSON.stringify(data));
};
const saveAcademicData = async (data: AcademicData) => {
  progressData.value!.academic_data = data;
  localStorage.setItem('academic_data', JSON.stringify(data));
  const base64 = await getBase64(data.studentPhoto);
  localStorage.setItem('studentPhoto', base64 as string);
  const base64Validation = await getBase64(data.academicValidation);
  localStorage.setItem('academicValidation', base64Validation as string);
};
const saveFamiliarData = (data: FamiliarData[]) => {
  progressData.value!.familiar_data = data;
  localStorage.setItem('familiar_data', JSON.stringify(data));
};
const loadProgressData = () => {
  stepsCompleted.value = JSON.parse(localStorage.getItem('stepsCompleted') || '[]');
  const personalData = localStorage.getItem('personal_data');
  if (personalData) {
    progressData.value!.personal_data = JSON.parse(personalData);
  }

  const contactData = localStorage.getItem('contact_data');
  if (contactData) {
    progressData.value!.contact_data = JSON.parse(contactData);
  }

  const academicData = localStorage.getItem('academic_data');
  if (academicData) {
    progressData.value!.academic_data = JSON.parse(academicData);
    const studentPhoto = localStorage.getItem('studentPhoto');
    if (studentPhoto) {
      const byteString = atob(studentPhoto.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: 'image/jpeg' });
      const file = new File([blob], 'studentPhoto.jpg', { type: 'image/jpeg' });
      progressData.value!.academic_data!.studentPhoto = file;
    }
    const academicValidation = localStorage.getItem('academicValidation');
    if (academicValidation) {
      const byteString = atob(academicValidation.split(',')[1]);
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: 'application/pdf' });
      const file = new File([blob], 'academicValidation.pdf', { type: 'application/pdf' });
      progressData.value!.academic_data!.academicValidation = file;
    }
  }

  const familiarData = localStorage.getItem('familiar_data');
  if (familiarData) {
    progressData.value!.familiar_data = JSON.parse(familiarData);
  }

  const enrollTypeData = localStorage.getItem('enrollType');
  if (enrollTypeData) {
    enrollType.value = enrollTypeData;
    if (enrollTypeData === "regular") {
      steps.value = ["Busqueda de Estudiantes", "Datos de Matricula"];
    } else if (enrollTypeData === "ingresante") {
      steps.value = [
        "Datos Personales",
        "Datos de Contacto",
        "Datos Académicos",
        "Datos Familiares",
        "Datos de Matricula",
      ];
    }
  }
  const currentStepData = localStorage.getItem('currentStep');
  if (currentStepData) {
    currentStep.value = parseInt(currentStepData);
  }
  const personId = localStorage.getItem('personId');
  if (personId) {
    progressData.value.personId = parseInt(personId);
  }

};
onMounted(() => {
  loadProgressData();
});
const clearLocalStorageData = () => {
  localStorage.removeItem('personal_data');
  localStorage.removeItem('contact_data');
  localStorage.removeItem('academic_data');
  localStorage.removeItem('familiar_data');
  localStorage.removeItem('enrollType');
  localStorage.removeItem('currentStep');
  localStorage.removeItem('personId');
  localStorage.removeItem('studentPhoto');
  localStorage.removeItem('academicValidation');
  localStorage.removeItem('stepsCompleted');
};
const newScale = () => {
  showNewScaleModal.value = true;
}
const saveEnrollData = (data: Enrollment) => {
  progressData.value!.enrollment = data;
  finalEnrollmentData.value = {
    haveScale: null,
    enrollmentDate: null,
    period: null,
    studyProgram: null,
    studyPlan: null,
    cycle: null,
    shift: null,
    section: null,
    fullPayment: null,
    documentType: null,
    documentNumber: null,
    fullName: null,
    scale: null,
    observations: null
  }
  finalEnrollmentData.value!.cycle = formsData.value!.cycle.find((cycle) => cycle.name === data.cycle)!.id;
  finalEnrollmentData.value!.section = formsData.value!.section.find((section) => section.name === data.section)!.id;
  finalEnrollmentData.value!.period = formsData.value!.period.find((period) => period.name === data.period)!.id;
  finalEnrollmentData.value!.studyPlan = formsData.value!.study_plan.find((plan) => plan.name === data.studyPlan)!.id;
  finalEnrollmentData.value!.studyProgram = formsData.value!.study_program.find((program) => program.name === data.studyProgram)!.id;
  finalEnrollmentData.value!.shift = formsData.value!.shift.find((shift) => shift.name === data.shift)!.id;
  finalEnrollmentData.value!.fullPayment = progressData.value.enrollment.fullPayment;
  finalEnrollmentData.value!.documentType = progressData.value.enrollment.documentType
  finalEnrollmentData.value!.documentNumber = progressData.value.enrollment!.documentNumber;
  finalEnrollmentData.value!.fullName = progressData.value.enrollment!.fullName;
  finalEnrollmentData.value!.enrollmentDate = progressData.value.enrollment!.enrollmentDate;
  finalEnrollmentData.value!.haveScale = progressData.value.enrollment!.haveScale;
  finalEnrollmentData.value!.observations = progressData.value.enrollment!.observations;
  if (finalEnrollmentData.value!.haveScale) {
    finalEnrollmentData.value!.scale = formsData.value!.scale.find((scale) => scale.name === data.scale)!.id;
  }
  const personId = progressData.value.personId as Number;
  if (enrollType.value === "regular") {
    EnrollmentService.enrollRegularStudent({
      enrollData: finalEnrollmentData.value,
      personId: personId,
    }).then((value) => {
      if (value.success) {
        const resData = value.data as { id: number };
        enrollId.value = Number(resData.id);
        clearLocalStorageData();
        ToastService.success("Estudiante matriculado correctamente");
        scaleAmount.value = formsData.value!.scale.find((scale) => scale.name === data.scale)?.scale_amount!;
        showPaymentModal.value = true;
      }
      else {
        ToastService.error(value.message)
      }
    }).catch(error => {
      ToastService.error(error)
    })
  } else {
    const formData = {
      enrollmentData: finalEnrollmentData.value,
      personalData: progressData.value.personal_data,
      contactData: progressData.value.contact_data,
      academicData: progressData.value.academic_data,
      familiarData: progressData.value.familiar_data,
      studentPhoto: progressData.value.academic_data?.studentPhoto,
      academicValidation: progressData.value.academic_data?.academicValidation
    };
    EnrollmentService.enrollNewStudent(formData).then((value) => {
      if (value.success) {
        const resData = value.data as { enroll_id: number };
        enrollId.value = Number(resData.enroll_id);
        clearLocalStorageData();
        ToastService.success("Estudiante matriculado correctamente");
        scaleAmount.value = formsData.value!.scale.find((scale) => scale.name === data.scale)?.scale_amount!;
        showPaymentModal.value = true;
      }
      else {
        ToastService.error(value.message)
      }
    }
    ).catch(error => {
      ToastService.error(error)
    })
  }
};
const searchStudent = (data: Number) => {
  progressData.value.personId = data;
  localStorage.setItem('personId', data.toString());
};
const nextStep = () => {
  if (currentStep.value < steps.value.length - 1) {
    const stepIsCompleted = stepsCompleted.value.includes(currentStep.value);
    if (!stepIsCompleted) {
      stepsCompleted.value.push(currentStep.value);
    }
    currentStep.value++;
    localStorage.setItem('stepsCompleted', JSON.stringify(stepsCompleted.value));
    localStorage.setItem('currentStep', currentStep.value.toString());
    scrollToBottom();
  }
};
const goToStep = (step: number) => {
  console.log(stepsCompleted.value)
  const stepIsCompleted = stepsCompleted.value.includes(step);
  if (step < steps.value.length && stepIsCompleted) {
    currentStep.value = step;
    localStorage.setItem('currentStep', currentStep.value.toString());
    scrollToBottom();
  }
};
const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
    localStorage.setItem('currentStep', currentStep.value.toString());
    scrollToBottom();
  }
};
const scrollToBottom = () => {
  setTimeout(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }, 100);
};
const getFormsData = () => {
  loading.value = true;
  EnrollmentService.getFormsData().then((value) => {
    formsData.value = value.data;
    formsData.value.scale.push({ id: -1, name: "Nueva Escala*", scale_amount: 0 });
  })
    .catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loading.value = false
    })
};

const validationsEnrollments = ref<{
  hasCurrentPeriod: boolean;
  hasPeriodDates: boolean;
  hasPaymentConceptEnrollment: boolean;
  hasPaymentConceptPension: boolean;
  maxMonthsPeriod: number;
  errors: {
    title: string;
    caption: string;
  }[]
}>({
  hasCurrentPeriod: false,
  hasPeriodDates: false,
  hasPaymentConceptEnrollment: false,
  hasPaymentConceptPension: false,
  maxMonthsPeriod: 0,
  errors: []
});

const getValidationsEnrollment = () => {
  EnrollmentService.getValidationsEnrollment().then(({ data }) => {
    validationsEnrollments.value = data;
  });
};

const enableFormEnrollment = computed(() => {
  return (
    validationsEnrollments.value.errors.length === 0 &&
    validationsEnrollments.value.hasCurrentPeriod &&
    validationsEnrollments.value.hasPeriodDates &&
    validationsEnrollments.value.hasPaymentConceptEnrollment &&
    validationsEnrollments.value.hasPaymentConceptPension
  )
});

const existStudent = (data: Number) => {
  progressData.value.personId = data;
  changeEnrollType({ target: { value: "regular" } });
  enrollType.value = "regular";
  nextStep();
};

const closePaymentModal = () => {
  showPaymentModal.value = false;
  clearAllData();
  currentStep.value = 0;
}

const clearAllData = () => {
  progressData.value = {
    personal_data: null,
    contact_data: null,
    academic_data: null,
    familiar_data: null,
    enrollment: null,
    personId: null,
  };
  enrollId.value = 0;
  finalEnrollmentData.value = {
    haveScale: null,
    enrollmentDate: null,
    period: null,
    studyProgram: null,
    studyPlan: null,
    cycle: null,
    shift: null,
    section: null,
    fullPayment: null,
    documentType: null,
    documentNumber: null,
    fullName: null,
    scale: null,
    observations: null
  }
  if (enrollType.value === "ingresante") {
    changeEnrollType({ target: { value: "ingresante" } });
  } else {
    changeEnrollType({ target: { value: "regular" } });
  }
  currentStep.value = 0;
  stepsCompleted.value = [];
}

const clearAllDataWithoutChangeRol = () => {
  progressData.value = {
    personal_data: null,
    contact_data: null,
    academic_data: null,
    familiar_data: null,
    enrollment: null,
    personId: null,
  };
  enrollId.value = 0;
  finalEnrollmentData.value = {
    haveScale: null,
    enrollmentDate: null,
    period: null,
    studyProgram: null,
    studyPlan: null,
    cycle: null,
    shift: null,
    section: null,
    fullPayment: null,
    documentType: null,
    documentNumber: null,
    fullName: null,
    scale: null,
    observations: null
  }
  currentStep.value = 0;
  stepsCompleted.value = [];
}

// Mounted
onBeforeMount(() => {
  getValidationsEnrollment();
  getFormsData()
});

onBeforeRouteLeave((to, from, next) => {
  if (to.name !== 'EnrollStudent') {
    clearLocalStorageData();
    clearAllData();
  }
  next();
});
</script>

<template>
  <div>
    <div v-if="loading" class="mt-4 w-100">
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
          <VRow class="">
            <VCol cols="3" class="pl-8 pt-6">
              <img :src="BulbLightImg" height="100" alt="Bulb Light" />
            </VCol>
            <VCol cols="6" class="pt-6 px-8 pb-6 d-flex text-center justify-center align-center flex-column">
              <h1>Matrícula</h1>
              <p>Seleccione el tipo de matrícula a ingresar.</p>
              <v-radio-group inline v-model="enrollType" :onchange="changeEnrollType">
                <v-radio label="Regular" value="regular"></v-radio>
                <v-radio label="Ingresante" value="ingresante"></v-radio>
              </v-radio-group>
            </VCol>
            <VCol cols="3" class="d-flex justify-end align-end">
              <img :src="PencilRocketImg" height="140" alt="Bulb Light" />
            </VCol>
          </VRow>
        </VCard>
        <VSpacer />
        <div class="mt-6 pb-6 pt-2">
          <VCard>
            <VRow class="">
              <VCol>
                <Stepper :currentStep="currentStep" :steps="steps" @clickButton="goToStep"> </Stepper>
              </VCol>
            </VRow>
            <template v-if="!enableFormEnrollment" class="mt-6">
              <VContainer>
                <VCard dark>
                  <v-alert border="start" type="error" title="NO SE PUEDE MATRICULAR" variant="tonal">
                    <VRow>
                      <VCol cols="12">
                        <h3 class="text-center">.</h3>
                      </VCol>
                      <VCol cols="12">
                        <ul style="text-decoration: solid;">
                          <li v-for="error in validationsEnrollments.errors" :key="error.title">
                            <p style="margin: 0;">{{ error.title }}</p>
                            <span class="text-xs" v-html="error.caption">
                            </span>
                          </li>
                        </ul>
                      </VCol>
                    </VRow>
                  </v-alert>
                </VCard>
              </VContainer>
            </template>
            <template v-else>
              <VRow class="" v-if="enrollType == 'ingresante'">
                <VCol>
                  <VRow class="">
                    <v-container class="pa-4">
                      <PersonalDataForm v-if="currentStep === 0" :chargeData="progressData.personal_data"
                        @continue="savePersonalData" @nextStep="nextStep" @validateDNI="existStudent" />
                      <ContactDataForm v-if="currentStep === 1" :chargeData="progressData.contact_data"
                        @nextStep="nextStep" @previousStep="previousStep" @continue="saveContactData" />
                      <AcademicDataForm v-if="currentStep === 2" :chargeData="progressData.academic_data"
                        @nextStep="nextStep" @previousStep="previousStep" @continue="saveAcademicData" />
                      <FamiliarDataForm v-if="currentStep === 3" :chargeData="progressData.familiar_data"
                        @nextStep="nextStep" @previousStep="previousStep" @continue="saveFamiliarData" />
                      <EnrollDataForm v-if="currentStep === 4" @nextStep="nextStep" @previousStep="previousStep"
                        @continue="saveEnrollData" @newScale="newScale" :isRegular="false"
                        :cycles="formsData?.cycle.map((cycle) => cycle.name)"
                        :sections="formsData?.section.map((section) => section.name)"
                        :periods="formsData?.period.map((period) => period.name)"
                        :studyPrograms="formsData?.study_program.map((program) => program.name)"
                        :studyProgramsDetail="formsData?.study_program" :studyPlans="[]"
                        :shifts="formsData?.shift.map((shift) => shift.name)"
                        :scales="formsData?.scale.map((scale) => scale.name)" 
                        :scalesMap="formsData?.scale" 
                        />
                    </v-container>
                  </VRow>
                </VCol>
              </VRow>
              <VRow class="" v-else>
                <VCol>
                  <VRow class="">
                    <v-container class="pa-4">
                      <SearchStudentForm v-if="currentStep === 0" @nextStep="nextStep" @continue="searchStudent" />
                      <EnrollDataForm v-if="currentStep === 1" @nextStep="nextStep" @continue="saveEnrollData"
                        @previousStep="previousStep"
                        @newScale="newScale" :isRegular="true" :cycles="formsData?.cycle.map((cycle) => cycle.name)"
                        :sections="formsData?.section.map((section) => section.name)"
                        :periods="formsData?.period.map((period) => period.name)"
                        :studyPrograms="formsData?.study_program.map((program) => program.name)"
                        :studyProgramsDetail="formsData?.study_program"
                        :studyPlans="formsData?.study_plan.map((plan) => plan.name)"
                        :shifts="formsData?.shift.map((shift) => shift.name)"
                        :scales="formsData?.scale.map((scale) => scale.name)" 
                        :scalesMap="formsData?.scale"
                      />
                    </v-container>
                  </VRow>
                </VCol>
              </VRow>
            </template>
          </VCard>
        </div>
      </div>
    </template>
    <PayEnrollMentModal 
      v-if="showPaymentModal"
      :is-scale="Boolean(progressData.enrollment?.haveScale)" 
      :scaleAmount="Number(scaleAmount)"
      :enrollmentId="enrollId" 
      :show="showPaymentModal" 
      @close="closePaymentModal"
      :maxMonthsPeriod="validationsEnrollments.maxMonthsPeriod"
    ></PayEnrollMentModal>
    <NewScale @close="showNewScaleModal = false" :show="showNewScaleModal" @success="updateScales"></NewScale>
  </div>
</template>

<route lang="yaml">
meta:
  action: manage
  subject: enrollStudent
</route>
