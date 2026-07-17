<template>
  <VCol dense>
    <v-form ref="form">
    <VRow>
      <VCol cols="12" sm="6">
        <span style="inline-size: 9.5rem">
          <AppDateTimePicker
            v-model="admissionDate"
            density="compact"
            :rules="[v => !!v || 'Este campo es requerido']"
            placeholder="Fecha de Ingreso"
            :config="{ position: 'auto right' }"
          />
        </span>
      </VCol>
      <VCol cols="12" sm="6">
        <v-text-field
          v-model="previousSchool"
          label="Colegio de Procedencia"
          :rules="[v => !!v || 'Este campo es requerido', v => v.length <= 255 || 'Este campo no puede tener más de 255 caracteres']"
          dense
          outlined
          class="white--text"
        ></v-text-field>
      </VCol>
    </VRow>

    <VRow>
      <VCol cols="12" sm="4">
        <v-text-field
          v-model="modularCode"
          label="Codigo Modular"
          dense
          :rules="[v => !!v || 'Este campo es requerido', v => v.length <= 50 || 'Este campo no puede tener más de 50 caracteres']"
          outlined
          class="white--text"
        ></v-text-field>
      </VCol>
      <VCol cols="12" sm="4">
        <v-text-field
          v-model="graduationYear"
          label="Año de Finalización de Secundaria"          
          dense
          outlined
          class="white--text"
          type="number"
          :rules="[
            (v) => /^\d{4}$/.test(v) || 'Debe ingresar un año válido',
            v => !!v || 'Este campo es requerido'
          ]"
        ></v-text-field>
      </VCol>
      <VCol cols="12" sm="4">
        <v-select
          label="Tipo de Colegio"
          :items="['Particular', 'Estatal']"
          :rules="[v => !!v || 'Este campo es requerido']"
          v-model="schoolType"
          dense
          outlined
          class="white--text"
        ></v-select>
      </VCol>
    </VRow>
    <VRow justify="center">
      <VCol cols="12" sm="4" v-if="schoolCategory=='CEVA'" >
        <v-select
          label="Categoria de Colegio"
          :rules="[v => !!v || 'Este campo es requerido']"
          :items="['Normal', 'CEVA']"
          v-model="schoolCategory"
          dense
          outlined
          class="white--text"
        ></v-select>
      </VCol>
      <VCol cols="12" sm="6" v-else >
        <v-select
          label="Categoria de Colegio"
          :rules="[v => !!v || 'Este campo es requerido']"
          :items="['Normal', 'CEVA']"
          v-model="schoolCategory"
          dense
          outlined
          class="white--text"
        ></v-select>
      </VCol>

      <VCol cols="12" sm="4" v-if="schoolCategory=='CEVA'">
        <v-select
          label="Condición del Estudiante"
          :items="['Becado', 'Pago Completo']"
          :rules="[v => !!v || 'Este campo es requerido']"
          v-model="studentCondition"
          dense
          outlined
          class="white--text"
        ></v-select>
      </VCol>
      <VCol cols="12" sm="6" v-else>
        <v-select
          label="Condición del Estudiante"
          :items="['Becado', 'Pago Completo']"
          :rules="[v => !!v || 'Este campo es requerido']"
          v-model="studentCondition"
          dense
          outlined
          class="white--text"
        ></v-select>
      </VCol>
      <VCol cols="12" sm="4" v-if="schoolCategory=='CEVA'">
        <v-text-field
          v-model="CEVA_certificate"
          label="Certificado CEVA"
          dense
          :rules="[v => !!v || 'Este campo es requerido']"
          outlined
          class="white--text"
        ></v-text-field>
      </VCol>
    </VRow>
    <VRow justify="center">
      <VCol cols="12" sm="12">
        <v-textarea
          label="Observaciones"
          v-model="observations"
          dense
          outlined
          class="white--text"
        ></v-textarea>
      </VCol>
    </VRow>
    <VRow justify="center">
      <VCol cols="12" sm="6">
        <v-file-input
          label="Foto del Estudiante"
          v-model="studentPhoto"
          dense
          clearable
          :rules="[v => !!v || 'Este campo es requerido']"
          outlined
          prepend-icon="mdi-camera"
          accept="image/png, image/jpeg, image/bmp"
          type="file"
          class="white--text"
        ></v-file-input>
      </VCol>
      <VCol cols="12" sm="6">
        <v-file-input
          label="Convalidación Academica"
          v-model="academicValidation"
          dense
          clearable
          accept="application/pdf"
          outlined
          class="white--text"
        ></v-file-input>
      </VCol>
    </VRow>
    <VRow justify="center" style="gap:1%">
      <v-btn color="primary" large class="mt-4" @click="previous">
          Regresar
        </v-btn>
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
export default {
  data() {
    return {
      admissionDate: null,
      previousSchool: null,
      modularCode: null,
      graduationYear: null,
      schoolType: null,
      schoolCategory: null,
      studentCondition: null,
      observations: null,
      studentPhoto: null,
      academicValidation: null,
      CEVA_certificate:null
    };
  },
  emits: [
  'nextStep',
  'previousStep',
    ('continue', {
      admissionDate: String,
      previousSchool: String,
      modularCode: String,
      graduationYear: Number,
      schoolType: String,
      schoolCategory: String,
      studentCondition: String,
      observations: String,
      studentPhoto: File,
      academicValidation: File,
      CEVA_certificate:String
    }
    )
  ],
  methods: {
    async next() {
      const isvalid = await this.$refs.form.validate();
      if (isvalid['valid']) {
      this.$emit('continue',{
      admissionDate:this.admissionDate,
      previousSchool:this.previousSchool,
      modularCode:this.modularCode,
      graduationYear: Number(this.graduationYear),
      schoolType:this.schoolType,
      schoolCategory:this.schoolCategory,
      studentCondition:this.studentCondition,
      observations:this.observations,
      studentPhoto:this.studentPhoto,
      academicValidation:this.academicValidation,
      CEVA_certificate:this.CEVA_certificate
      });
        this.$emit('nextStep');
    }
  },
  previous() {
    this.$emit('previousStep');
  }
  },
  props: {
    chargeData: Object,
  },
  created(){
    if(this.chargeData){
      this.admissionDate= this.chargeData.admissionDate;
      this.previousSchool=this.chargeData.previousSchool;
      this.modularCode= this.chargeData.modularCode;
      this.graduationYear= this.chargeData.graduationYear;
      this.schoolType= this.chargeData.schoolType;
      this.schoolCategory= this.chargeData.schoolCategory;
      this.studentCondition= this.chargeData.studentCondition;
      this.observations=  this.chargeData.observations;
      this.studentPhoto= this.chargeData.studentPhoto;
      this.academicValidation= this.chargeData.academicValidation;
      this.CEVA_certificate= this.chargeData.CEVA_certificate;
    }
  }
};
</script>