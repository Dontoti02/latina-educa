<template>
  <VCol dense>
    <v-form ref="form">
      <VRow>
        <VCol cols="12" sm="12">
          <v-autocomplete label="Busqueda de estudiantes" :items="students" v-model="student" :oninput="onInput"
            :onblur="clearSearchInput" :rules="[(v) => !!v || 'Este campo es requerido']"></v-autocomplete>
        </VCol>
      </VRow>
      <VRow>
        <VCol cols="12" sm="3">
          <v-text-field label="DNI o CE" readonly dense outlined v-model="studentDni"
            class="white--text"></v-text-field>
        </VCol>
        <VCol cols="12" sm="6">
          <v-text-field label="Nombre Completo" readonly dense outlined v-model="studentName"
            class="white--text"></v-text-field>
        </VCol>
        <VCol cols="12" sm="3">
          <AppSelect class="white--text" v-model="studentSex" item-value="value" item-title="text"
            placeholder="Sexo" :items="[
              { text: 'MASCULINO', value: 'MASCULINO' },
              { text: 'FEMENINO', value: 'FEMENINO' }
            ]" outlined dense></AppSelect>
        </VCol>
      </VRow>

      <VRow justify="center">
        <v-btn color="primary" large class="mt-4" @click="next">
          Continuar
        </v-btn>
      </VRow>
      <VRow>
        <VCol cols="12"> </VCol>
      </VRow>
    </v-form>
  </VCol>
</template>

<script>
import AppSelect from "@/@core/components/app-form-elements/AppSelect.vue";
import { toastError } from "@/common/util/toast.service";
import { EnrollmentService } from "@/services/enrollments.service";
import { debounce } from "lodash";

export default {
  data: () => ({
    student: null,
    students: [],
    studentsData: [],
    searchInput: "",
    studentName: null,
    studentDni: null,
    studentSex: null,
    personId: null,
  }),
  emits: [
    "nextStep",
    ("continue",
      "personId"
    ),
  ],
  methods: {
    async next() {
      const isvalid = await this.$refs.form.validate();
      if (isvalid["valid"]) {
        const isEnrolled = await EnrollmentService.isEnrolled(this.personId);
        if (isEnrolled.data) {
          toastError("El estudiante ya se encuentra matriculado en este periodo");
        }
        else {
          this.$emit("continue",
            this.personId,
          );
          this.$emit("nextStep");
        }

      }
    },
    async searchStudent(input) {
      EnrollmentService.searchStudent(input).then((value) => {
        this.studentsData = value.data;
        this.students = value.data.map((student) => student.names);
      });
    },
    onInput(value) {
      if (value.data === null) {
        this.searchInput = this.searchInput.slice(0, -1);
      } else if (value.data === " ") {
        this.searchInput += " ";
      } else {
        this.searchInput += value.data;
      }
      this.debouncedSearch(this.searchInput);
    },
    clearSearchInput() {
      this.searchInput = "";
    },
  },
  created() {
    this.debouncedSearch = debounce(this.searchStudent, 1000);
  },
  watch: {
    student(newVal) {
      const selectedStudent = this.studentsData.find(
        (student) => student.names === newVal
      );
      this.studentName = selectedStudent.name;
      this.studentDni = selectedStudent.document_number;
      this.studentSex = selectedStudent.gender;
      this.personId = selectedStudent.person_id;
    },
  },
};
</script>
