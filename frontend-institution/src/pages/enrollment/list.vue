<script setup lang="ts">
import { SessionStore } from "@/common/store";
import { ToastService } from "@/common/util/toast.service";
import {
  Enrolls,
  searchPerson,
} from "@/models/enrollment";
import { DateFormatting } from "@/utils/date-formatting";
import BulbLightImg from "@images/illustrations/bulb-light.png";
import PencilRocketImg from "@images/illustrations/pencil-rocket.png";
import { VSkeletonLoader } from "vuetify/labs/VSkeletonLoader";
import { EnrollmentService } from "@/services/enrollments.service";
import {
  EnrollmentFilters
} from "@/models/enrollments";
import { debounce } from "lodash";
import ConfirmDelete from "./modals/ConfirmDelete.vue";
import EditEnroll from "./modals/EditEnroll.vue";

// Initial
const session = SessionStore();
const showDeleteDialog=ref(false)
const showEditDialog=ref(false)

const detailPage = ref<{
  active: boolean;
  classroomId: number;
  initialTab: "content" | "students" | "scores";
  student: {
    person_id: number;
    names: string;
  } | null;
}>({
  active: false,
  classroomId: 0,
  initialTab: "content",
  student: null,
});
const person_id = ref<Number>();
const study_program_id=ref<Number>();
const enrolls = ref<Array<Enrolls>>([]);
const student = ref(null);
const searchInput = ref("");
const loadingFilters = ref(false);
const loadingEnrollments = ref(false);
const period_id = ref<number>(session.get().academicPeriod!.id);
const enroll_id=ref<number>();

const filtersForSecretary = ref<EnrollmentFilters>({
  periods: [],
  study_programs: [],
});
const onInput = (value: { data: string | null }) => {
  if (value.data === null) {
    searchInput.value = searchInput.value.slice(0, -1);
  } else if (value.data === " ") {
    searchInput.value += " ";
  } else {
    searchInput.value += value.data;
  }
  debouncedSearch(searchInput.value);
};

const debouncedSearch = debounce((input: string) => {
  searchStudent(input);
}, 500);

const students = ref<String[]>();
const studentsData = ref<searchPerson[]>();
const searchStudent = async (input: any) => {
  EnrollmentService.searchStudent(input).then((value) => {
    studentsData.value = [];
    students.value = [];
    studentsData.value = value.data;
    students.value = value.data.map((student) => student.names);
  });
};
const clearSearchInput = () => {
  searchInput.value = "";
};
const selectDeleteEnroll=(enrollId:number)=>{
  enroll_id.value=enrollId
  showDeleteDialog.value=true
}
const selectEditEnroll=(enrollId:number)=>{
  enroll_id.value=enrollId
  EnrollmentService.getEnrollData(enrollId).then((response)=>{
    console.log(response.data)
  }).catch((error)=>{
    ToastService.error(error)
  })
  showEditDialog.value=true
}
const successEdit=()=>{
  ToastService.success("Matrícula editada correctamente")
  getEnrollments()
}

const headers = [
  { title: "Documento de Identidad", key: "document_number", align: "left" },
  { title: "Estudiante", key: "names" },
  { title: "Fecha de Registro", key: "registration_date" },
  { title: "Periodo", key: "period", align: "center" },
  { title: "Plan de Estudios", key: "study_plan", align: "center" },
  { title: "Programa de Estudios", key: "study_program", align: "left" },
  { title: "Ciclo", key: "cycle", align: "center" },
  { title: "Turno", key: "shift", align: "center" },
  { title: "Sección", key: "section", align: "center" },
  { title: "", key: "" },
];
// Mounted
const getFilters = () => {
  loadingFilters.value = true;
  EnrollmentService.getFilters()
    .then((response) => {
      filtersForSecretary.value = response.data;
      if (filtersForSecretary.value.periods.length > 0) {
        period_id.value = filtersForSecretary.value.periods[0].id;

        if (session.isStudent()) getEnrollments();
      }
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      loadingFilters.value = false;
    });
};
const getEnrollments = () => {
  EnrollmentService.getEnrollments({
    personId: person_id.value,
    periodId: period_id.value,
    programId: study_program_id.value
  })
    .then((response) => {
      enrolls.value = response.data;
    })
    .catch((error) => {
      ToastService.error(error);
    })
    .finally(() => {
      loadingEnrollments.value = false;
    });
};
const confirmDelete=()=>{
  showDeleteDialog.value=false
  EnrollmentService.deleteEnrollment(enroll_id.value!).then(()=>{
    ToastService.success("Matrícula eliminada correctamente")
    enrolls.value=enrolls.value.filter(enroll=>enroll.id!=enroll_id.value)
  }).catch((error)=>{
    ToastService.error(error)
  })
}

onBeforeMount(() => {
  getFilters();
  getEnrollments();
});

// Watchers
watch(period_id, () => {
   getEnrollments();
});

watch(
  () => study_program_id.value,
  () => {
    getEnrollments();
  }
);
watch(
  () => student.value,
  (newVal) => {
    const selectedStudent = studentsData.value!.find(
      (student) => student.names === newVal
    );
    person_id.value = selectedStudent?.person_id;
    getEnrollments();
  }
);

// Utils
const formatDate = (date: string) => {
  return DateFormatting.formatShort(new Date(date));
};
</script>

<template>
  <div>
    <div v-if="loadingFilters" class="mt-4 w-100 d-flex justify-center">
      <VRow>
        <VCol cols="12">
          <VSkeletonLoader class="w-100" type="image" />
        </VCol>
        <VCol cols="12">
          <VSkeletonLoader
            class="w-100 gap-2"
            type="list-item-three-line,list-item-three-line,list-item-three-line,list-item-three-line,list-item-three-line"
          />
        </VCol>
      </VRow>
    </div>
    <template v-else>
      <div v-show="!detailPage.active">
        <VCard>
          <VRow class="">
            <VCol cols="3" class="pl-8 pt-6">
              <img :src="BulbLightImg" height="100" />
            </VCol>
            <VCol
            cols="6"
            class="pt-6 px-8 pb-6 d-flex text-center justify-center align-center flex-column"
            >
            <h1>Matrículas</h1>
            <p>
              Busca aquí tus matrículas realizadas de todos los periodos
              académicos hasta el periodo {{ session.academicPeriod?.name }}.
            </p>
          </VCol>
          <VCol cols="3" class="d-flex justify-end align-end">
            <img :src="PencilRocketImg" height="140" />
          </VCol>
        </VRow>
      </VCard>
      <VSpacer />
      <VCard class="mt-6 px-4 pb-6 pt-2">
        <VRow>
            <VCol cols="12" sm="6" md="4">
              <div class="app-select flex-grow-1">
                <VLabel
                  class="mb-1 text-body-2 text-high-emphasis"
                  :text="'Buscar Estudiante'"
                />
                <v-autocomplete
                clearable
                  :items="students"
                  v-model="student"
                  :oninput="onInput"
                  :onblur="clearSearchInput"
                ></v-autocomplete>
              </div>
            </VCol>
            <VCol cols="12" sm="6" md="4">
              <AppSelect
                v-model="period_id"
                :items="filtersForSecretary.periods"
                item-value="id"
                item-title="name"
                label="Periodo académico"
              />
            </VCol>
            <template v-if="session.isSecretary()">
              <VCol cols="12" sm="6" md="4">
                <AppSelect
                  v-model="study_program_id"
                  :items="filtersForSecretary.study_programs"
                  item-value="id"
                  item-title="name"
                  label="Programa de estudios"
                  clearable
                />
              </VCol>
            </template>
          </VRow>

          <VRow>
            <VCol cols="12">
              <VProgressLinear
                v-if="loadingEnrollments"
                color="primary"
                height="3"
                indeterminate
              />
              <VTable id="enrollment-table">
                <thead>
                  <tr>
                    <th
                      v-for="header in headers"
                      :key="header.key"
                      :class="{
                        'text-left': !header.align || header.align === 'left',
                        'text-center': header.align === 'center',
                        'text-right': header.align === 'right',
                      }"
                    >
                      {{ header.title }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in enrolls" :key="item.id">
                    <td class="text-left">{{ item.document_number }}</td>
                    <td class="text-capitalize">
                      {{ item.names?.toLowerCase() ?? "-" }}
                    </td>
                    <td class="text-capitalize">
                      {{ item.registration_date ?? "-" }}
                    </td>
                    <td class="text-capitalize text-center">
                      {{ item.period.toLowerCase() }}
                    </td>
                    <td class="text-center">
                      {{ item.study_plan ?? "-" }}
                    </td>
                    <td class="text-left">
                      {{ item.study_program.toLowerCase() ?? "-" }}
                    </td>
                    <td class="text-center">
                      {{ item.cycle ?? "-" }}
                    </td>
                    <td class="text-center">
                      {{ item.shift ?? "-" }}
                    </td>
                    <td class="text-center">
                      {{ item.section ?? "-" }}
                    </td>
                    <td class="text-center">
                      <div
                        class="button-container"
                        style="display: flex; gap: 5px"
                      >
                      <v-tooltip text="Editar Matricula">
                        <template v-slot:activator="{ props }">
                        <VButton v-bind="props" v-on:click="selectEditEnroll(item.id)" style="cursor: pointer;">
                          <VIcon style="color: goldenrod">tabler-edit</VIcon>
                        </VButton>
                        </template>
                      </v-tooltip>
                      <v-tooltip text="Eliminar Matricula">
                      <template v-slot:activator="{ props }">
                        <VButton v-bind="props" v-on:click="selectDeleteEnroll(item.id)" style="cursor: pointer;padding-left: 5px">
                          <VIcon style="color: red">tabler-trash</VIcon>
                        </VButton>
                      </template>
                    </v-tooltip>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="loadingEnrollments">
                    <td :colspan="headers.length" class="text-center">
                      Cargando matrículas...
                    </td>
                  </tr>
                  <tr v-else-if="enrolls.length === 0">
                    <td :colspan="headers.length" class="text-center">
                      No hay matrículas registradas.
                    </td>
                  </tr>
                </tbody>
              </VTable>
            </VCol>
          </VRow>
        </VCard>
      </div>
      <ConfirmDelete
      :show="showDeleteDialog"
      v-on:close="showDeleteDialog=false"
      v-on:delete="confirmDelete"
      ></ConfirmDelete>
      <EditEnroll
      :show="showEditDialog"
      :enrollId="enroll_id!"
      v-on:edit="successEdit"
      v-on:close="showEditDialog=false"
      >
      </EditEnroll>
    </template>
  </div>
</template>
<route lang="yaml">
meta:
  action: manage
  subject: enrollList
</route>
