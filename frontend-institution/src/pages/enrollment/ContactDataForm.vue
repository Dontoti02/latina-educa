<template>
  <VCol dense>
    <v-form ref="form">
    <VRow>
      <VCol cols="12" sm="6">
        <v-text-field
          label="Domicilio Actual"
          dense
          v-model="actualAddress"
          outlined
          :rules="[v => !!v || 'Este campo es requerido', v => v.length <= 255 || 'Este campo no puede tener más de 255 caracteres']"
          class="white--text"
        ></v-text-field>
      </VCol>
      <VCol cols="12" sm="6">
        <v-text-field
          label="Domicilio Permanente"
          dense
          outlined
          v-model="permanentAddress"
          class="white--text"
            :rules="[v => !v || v.length <= 255 || 'Este campo no puede tener más de 255 caracteres']"
        ></v-text-field>
      </VCol>
    </VRow>
    <VRow>
      <VCol cols="12" sm="4">
        <v-text-field
          label="Celular"
          dense
          outlined
          v-model="cellphone"
          :rules="[v => v >= 0 && v <= 999999999|| 'Debe ingresar un numero valido',v => !!v || 'Este campo es requerido']"
          type="number"
          class="white--text"
        ></v-text-field>
      </VCol>
      <VCol cols="12" sm="4">
        <v-text-field
          label="Teléfono"
          dense
          outlined
          type="number"
          :rules="[v => v >= 0 && v <= 999999999 || 'Debe ingresar un numero valido']"
          v-model="telephone"
          class="white--text"
        ></v-text-field>
      </VCol>
      <VCol cols="12" sm="4">
        <v-text-field
          label="Correo Electrónico"
          :rules="[v => !!v || 'El correo es requerido', v => /.+@.+\..+/.test(v) || 'Debe ser un correo válido',v => !!v || 'Este campo es requerido', v => v.length <= 255 || 'Este campo no puede tener más de 255 caracteres']"
          dense
          outlined
          v-model="email"
          class="white--text"
        ></v-text-field>
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
      actualAddress: null,
      permanentAddress: null,
      cellphone: null,
      telephone: null,
      email: null,
    };
  },
  props:{
    chargeData:Object
  },
  emits:[
    'nextStep',
    'previousStep',
    ('continue', {
      actualAddress: String,
    permanentAddress: String,
    cellphone: Number,
    telephone: Number,
    email: String,  
    }
    )
  ],
  methods: {
    async next() {
      const isvalid = await this.$refs.form.validate();
      if (isvalid['valid']) {
      console.log(this.permanentAddress)
      this.$emit('continue',{
        actualAddress:this.actualAddress ,
    permanentAddress:this.permanentAddress ,
    cellphone: Number(this.cellphone) ,
    telephone:Number(this.telephone) ,
    email:this.email});
        this.$emit('nextStep');
    }
  },
  previous() {
    this.$emit('previousStep');
  }
  },
  created(){
    if(this.chargeData){
      this.actualAddress = this.chargeData.actualAddress;
      this.permanentAddress = this.chargeData.permanentAddress;
      this.cellphone = this.chargeData.cellphone;
      this.telephone = this.chargeData.telephone;
      this.email = this.chargeData.email;
    }
  }
};
</script>