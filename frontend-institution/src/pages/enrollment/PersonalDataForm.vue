<template>
  <VCol dense>
    <v-form ref="form">
      <VRow>
        <VCol cols="12" sm="3">
          <v-select
            label="Tipo de Documento"
            :items="['DNI', 'CE']"
            v-model="documentType"
            dense
            outlined
            class="white--text"
            :rules="[v => !!v || 'Este campo es requerido']"
          ></v-select>
        </VCol>
        <VCol cols="12" sm="3">
          <v-text-field
            label="DNI o CE"
            dense
            outlined
            v-model="documentNumber"
            class="white--text"
            type="number"
            :rules="[v => !!v || 'Este campo es requerido', v =>  v <= 9999999999 || 'Debe ingresar un numero valido']"
          ></v-text-field>
        </VCol>
        <VCol cols="12" sm="6">
          <v-text-field
            label="Apellidos"
            v-model="lastName"
            dense
            outlined
            class="white--text"
            :rules="[v => !!v || 'Este campo es requerido' , v => v.length <= 100 || 'Este campo no puede tener más de 100 caracteres']"
          ></v-text-field>
        </VCol>
      </VRow>
      <VRow>
        <VCol cols="12" sm="6">
          <v-text-field
            label="Nombres"
            v-model="firstName"
            dense
            outlined
            class="white--text"
            :rules="[v => !!v || 'Este campo es requerido', v => v.length <= 100 || 'Este campo no puede tener más de 100 caracteres']"
          ></v-text-field>
        </VCol>
        <VCol cols="12" sm="3">
          <span style="inline-size: 9.5rem">
            <AppDateTimePicker
              v-model="birthDate"
              density="compact"
              placeholder="Fecha de Nacimiento"
              :config="{ position: 'auto right' }"
              :rules="[v => !!v || 'Este campo es requerido']"
            />
          </span>
        </VCol>
        <VCol cols="12" sm="3">
          <v-select
            label="Sexo"
            :items="['Masculino', 'Femenino', 'Otro']"
            v-model="gender"
            dense
            outlined
            class="white--text"
            :rules="[v => !!v || 'Este campo es requerido']"
          ></v-select>
        </VCol>
      </VRow>
      <VRow>
        <VCol cols="12" sm="4">
          <v-select
            label="Estado Civil"
            :items="['Soltero', 'Casado', 'Divorciado', 'Viudo']"
            v-model="maritalStatus"
            dense
            outlined
            class="white--text"
            :rules="[v => !!v || 'Este campo es requerido']"
          ></v-select>
        </VCol>
        <VCol cols="12" sm="4">
          <v-select
            label="País"
            :items="paises"
            v-model="country"
            dense
            outlined
            required
            class="white--text"
            :rules="[v => !!v || 'Este campo es requerido']"
          ></v-select>
        </VCol>
        <VCol cols="12" sm="4" v-if="!isPeru">
          <v-text-field
            label="Ciudad"
            v-model="department"
            dense
            outlined
            class="white--text"
            :rules="[v => !!v || 'Este campo es requerido', v => v.length <= 100 || 'Este campo no puede tener más de 100 caracteres']"
          ></v-text-field>
        </VCol>
        <VCol cols="12" sm="4" v-if="isPeru">
          <v-select
            label="Departamento"
            :items="departamentos"
            v-model="department"
            dense
            outlined
            class="white--text"
            :rules="isPeru ?[v => !!v || 'Este campo es requerido']:[]"
          ></v-select>
        </VCol>
      </VRow>
      <VRow v-if="isPeru">
        <VCol cols="12" sm="4">
          <v-select
            label="Provincia"
            :items="provincias"
            v-model="province"
            dense
            outlined
            class="white--text"
            :rules="isPeru ?[v => !!v || 'Este campo es requerido']:[]"
          ></v-select>
        </VCol>
        <VCol cols="12" sm="4">
          <v-select
            label="Distrito"
            :items="distritos"
            v-model="district"
            dense
            outlined
            class="white--text"
            :rules="isPeru ? [v => !!v || 'Este campo es requerido'] : []"
          ></v-select>
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
  <ExistingStudentModal
      :show="modalExistingStudent"
      @close="closeModal"
      :existingStudent="existingStudent"
      @goToEnrollment="this.$emit('validateDNI', studentId);"
    />
</template>

<script>
import { EnrollmentService } from '@/services/enrollments.service';
import { debounce } from 'lodash';
import ExistingStudentModal from './modals/ExistingStudentModal.vue';
import peru from '@/common/util/peru.json';
import countries from '@/common/util/countries.json';

export default {
  components: {
    ExistingStudentModal,
  },
  props: {
    chargeData: Object,
  },
  data() {
    return {
      documentType: null,
      documentNumber: null,
      studentId:null,
      lastName: null,
      firstName: null,
      birthDate: null,
      gender: null,
      maritalStatus: null,
      country: null,
      department: null,
      province: null,
      district: null,
      modalExistingStudent: false,
      existingStudent:{
        names: null,
        phone: null,
        email: null,
        document_number:null
      },
      departamentos:peru.departamentos.map((departamento) => departamento.nombre_ubigeo),
      provincias:[],
      distritos:[],
      paises: countries.countries.map((country) => country.es_name),
      isPeru: true,
    };
  },
  emits: [
    'nextStep',
    ('continue', {
      documentType: String,
      documentNumber: String,
      lastName: String,
      firstName: String,
      birthDate: String,
      gender: String,
      maritalStatus: String,
      country: String,
      department: String,
      province: String,
      district: String
    }),
    ('validateDNI', 'documentNumber')
  ],
  methods: {
    async next() {
      const isvalid = await this.$refs.form.validate();
      if (isvalid['valid']) {
        this.$emit('continue', {
          documentType: this.documentType,
          documentNumber: Number(this.documentNumber),
          lastName: this.lastName,
          firstName: this.firstName,
          birthDate: this.birthDate,
          gender: this.gender,
          maritalStatus: this.maritalStatus,
          country: this.country,
          department: this.department,
          province: this.province,
          district: this.district
        });
        this.$emit('nextStep');
      }
    },
    closeModal(){
      this.studentId = null;
      this.documentNumber=null;
      this.modalExistingStudent = false;
    },
    async validateDNI(){
      if(this.documentNumber.length >= 8){
        EnrollmentService.validateDNI(this.documentNumber).then((value) => {
          if(value.data!=null){
          this.existingStudent = value.data;
          this.modalExistingStudent = true;
          this.studentId=value.data.id;
        }
      });
    }
  },
},
  watch:{
    documentNumber(value){
      if(value&&value.length >= 8){
        this.debouncedSearch(this.documentNumber);
      }
    },
    country(value){
      if(this.chargeData==null){      
      if(value === 'Perú'){
        this.departamentos = peru.departamentos.map((departamento) => departamento.nombre_ubigeo);
        this.isPeru = true;
        this.department = null;
        this.province = null;
        this.district = null;
      }else{
        this.departamentos = [];
        this.provincias = [];
        this.distritos = [];
        this.department = null;
        this.province = null;
        this.district = null;
        this.isPeru=false;
      }
    }
    },
    department(value){
      if(value&&this.isPeru){
        const departamento = peru.departamentos.find((departamento) => departamento.nombre_ubigeo === value).id_ubigeo;
        this.provincias = peru.provincias[departamento].map((provincia) => provincia.nombre_ubigeo);
      }
    },
    province(value){
      if(value){
        const departamento = peru.departamentos.find((departamento) => departamento.nombre_ubigeo === this.department).id_ubigeo;
        const provincia = peru.provincias[departamento].find((provincia) => provincia.nombre_ubigeo === value).id_ubigeo;
        this.distritos = peru.distritos[provincia].map((distrito) => distrito.nombre_ubigeo);
      }
    },
  },
  created(){
    this.debouncedSearch = debounce(this.validateDNI, 1000);
    if(this.chargeData!=null){
        this.documentType = this.chargeData.documentType;
        this.documentNumber = this.chargeData.documentNumber;
        this.lastName = this.chargeData.lastName;
        this.firstName = this.chargeData.firstName;
        this.birthDate = this.chargeData.birthDate
        this.country = this.chargeData.country;
        this.department = this.chargeData.department;
        if(this.country === 'Perú'){
          this.isPeru = true;
          this.province = this.chargeData.province;
          this.district = this.chargeData.district;
        }
        else{
          this.isPeru = false;
        }
        this.gender = this.chargeData.gender;
        this.maritalStatus = this.chargeData.maritalStatus;
    }
  },

}
</script>

