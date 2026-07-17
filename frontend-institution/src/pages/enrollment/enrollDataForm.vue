<template>
  <VCol dense>
    <v-form ref="form">
      <VRow>
        <VCol cols="12" sm="6">
          <span style="inline-size: 9.5rem">
            <AppDateTimePicker density="compact" v-model="enrollmentDate" placeholder="Fecha de Ingreso"
              :rules="[v => !!v || 'Este campo es requerido']" :config="{ position: 'auto right' }" />
          </span>
        </VCol>
        <VCol cols="12" sm="6">
          <v-select label="Periodo" :rules="[v => !!v || 'Este campo es requerido']" :items="periods" v-model="period"
            dense outlined class="white--text"></v-select>
        </VCol>
      </VRow>

      <VRow>
        <VCol cols="12" sm="4">
          <v-select label="Programa de Estudios" :items="studyPrograms" :rules="[v => !!v || 'Este campo es requerido']"
            v-model="studyProgram" dense outlined class="white--text"></v-select>
        </VCol>
        <VCol cols="12" sm="4">
          <v-select label="Plan de Estudios" :items="studyPlans" :rules="[v => !!v || 'Este campo es requerido']"
            v-model="studyPlan" dense outlined class="white--text"></v-select>
        </VCol>
        <VCol cols="12" sm="4">
          <v-select label="Ciclo" :items="cycles" :rules="[v => !!v || 'Este campo es requerido']" v-model="cycle" dense
            outlined class="white--text"></v-select>
        </VCol>
      </VRow>
      <VRow>
        <VCol cols="12" sm="4">
          <v-select label="Turno" :items="shifts" v-model="shift" :rules="[v => !!v || 'Este campo es requerido']" dense
            outlined class="white--text"></v-select>
        </VCol>
        <VCol cols="12" sm="4">
          <v-select label="Sección" :items="sections" :rules="[v => !!v || 'Este campo es requerido']" v-model="section"
            dense outlined class="white--text"></v-select>
        </VCol>
      </VRow>
      <VRow justify="center" v-if="isRegular">
        <VCol cols="12" sm="6">
          <v-checkbox v-model="fullPayment" label="¿La Matricula Se Pago Completa?"></v-checkbox>
        </VCol>
        <VCol cols="12" sm="6">
          <v-checkbox v-model="haveScale" label="¿Se autorizo una Escala?"></v-checkbox>
        </VCol>
      </VRow>
      <VRow justify="center" v-else>
        <VCol cols="12" sm="12">
          <v-checkbox v-model="fullPayment" label="¿La Matricula Se Pago Completa?"></v-checkbox>
        </VCol>
      </VRow>
      <VRow justify="center" v-if="haveScale">
        <v-divider></v-divider>
        <VCol cols="12" sm="12">

          <label class="text-left pt-4">
            <strong>Información de la persona que autorizó la escala</strong>
          </label>

        </VCol>
        <VCol cols="12" sm="12">
          <VRow justify="center">
            <VCol cols="12" sm="6">
                <v-select 
                label="Tipo de Documento" 
                :items="['DNI', 'CE']" 
                v-model="documentType"
                :rules="[v => haveScale ? !!v || 'Este campo es requerido' : true]" 
                dense 
                outlined
                class="white--text">
                </v-select>
            </VCol>
            <VCol cols="12" sm="6">
                <v-text-field label="DNI o CE" v-model="documentNumber"
                :rules="[v => haveScale ? !!v || 'Este campo es requerido' : true, v => /^\d{1,10}$/.test(v) || 'Debe ingresar un numero valido']"
                dense outlined class="white--text"></v-text-field>
            </VCol>
          </VRow>
          <VRow justify="center">
            <VCol cols="12" sm="7">
                <v-text-field label="Nombre y Apellido"
                :rules="[v => haveScale ? !!v || 'Este campo es requerido' : true, v => v.length <= 255 || 'El nombre no puede tener más de 255 caracteres']"
                v-model="fullName" dense outlined class="white--text"></v-text-field>
            </VCol>
            <VCol cols="12" sm="5">
                <v-select 
                label="Escala" 
                :items="scales"
                :rules="[v => haveScale ? !!v || 'Este campo es requerido' : true]"
                dense 
                v-model="scale" 
                outlined
                class="white--text"
                >
                <template v-slot:item="{ props, item }">
                  <v-list-item v-bind="props">
                  <span class="text-sm">
                    {{ getScaleAmount(item.value) }}
                  </span> 
                  </v-list-item>
                </template>
              </v-select>
            </VCol>
          </VRow>
        </VCol>
      </VRow>
      <VRow justify="center">
        <VCol cols="12" sm="12">
          <v-textarea label="Observaciones" dense v-model="observations" outlined class="white--text"></v-textarea>
        </VCol>
      </VRow>
      <VRow justify="center" style="gap:1%">
        <v-btn color="primary" large class="mt-4" @click="previous">
          Regresar
        </v-btn>
        <v-btn color="primary" large class="mt-4" @click="next">
          Guardar
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
      haveScale: false,
      enrollmentDate: null,
      period: null,
      studyProgram: null,
      studyPlan: null,
      cycle: null,
      shift: null,
      section: null,
      fullPayment: false,
      documentType: null,
      documentNumber: null,
      fullName: null,
      scale: null,
      observations: null,
      studyPlans: []
    };
  },
  emits: [
    'nextStep',
    'previousStep',
    'newScale',
    ('continue', {
      haveScale: Boolean,
      enrollmentDate: String,
      period: String,
      studyProgram: String,
      studyPlan: String,
      cycle: String,
      shift: String,
      section: String,
      fullPayment: Boolean,
      documentType: String,
      documentNumber: Number,
      fullName: String,
      scale: String,
      observations: String
    }
    )
  ],
  methods: {
    async next() {
      const isvalid = await this.$refs.form.validate();
      if (isvalid['valid']) {
        this.$emit('continue', {
          haveScale: this.haveScale,
          enrollmentDate: this.enrollmentDate,
          period: this.period,
          studyProgram: this.studyProgram,
          studyPlan: this.studyPlan,
          cycle: this.cycle,
          shift: this.shift,
          section: this.section,
          fullPayment: this.fullPayment,
          documentType: this.documentType,
          documentNumber: this.documentNumber,
          fullName: this.fullName,
          scale: this.scale,
          observations: this.observations
        });
        this.$emit('nextStep');
      }
    },
    previous() {
      this.$emit('previousStep');
    },

    getScaleAmount(scaleName) {
      const find = this.scalesMap.find(scale => scale.name === scaleName);
      if (find) {
        if (find.name  === 'Nueva Escala*') {
          return '';
        }
        return 'S/. '  +  find.scale_amount;
      }
      return ''
    }
  },
  props: {
    isRegular: Boolean,
    cycles: Array,
    sections: Array,
    scales: Array,
    periods: Array,
    studyPrograms: Array,
    studyProgramsDetail: Array,
    shifts: Array,
    scalesMap : Array,
  },
  watch: {
    studyProgram: function (val) {
      this.studyPlans = [];
      const program = this.studyProgramsDetail.find((program) => program.name === val);
      if (program) {
        const plans = program.study_plans;
        plans.forEach((plan) => {
          this.studyPlans.push(plan.name);
        });
      }

    },
    scale: function (val) {
      if (val == 'Nueva Escala*') {
        this.$emit('newScale');
      }
    },
  },
}
</script>
