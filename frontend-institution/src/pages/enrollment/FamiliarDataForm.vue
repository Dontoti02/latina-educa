<template>
  <VCol dense>
    <v-form ref="form">
    <VRow>
      <VCol cols="12" sm="3">
        <v-select
          label="Tipo de Documento"
          :items="['DNI', 'CE']"
          v-model="documentType"
          :rules="[v => !!v || 'Este campo es requerido']"
          dense
          outlined
          class="white--text"
        ></v-select>
      </VCol>
      <VCol cols="12" sm="3">
        <v-text-field
          label="DNI o CE"
          v-model="documentNumber"
          :rules="[v => v >= 0 || 'Debe ingresar un numero valido',v => !!v || 'Este campo es requerido', v =>  v <= 9999999999 || 'Debe ingresar un numero valido']"
          dense
          outlined
          type="number"
          class="white--text"
        ></v-text-field>
      </VCol>
      <VCol cols="12" sm="6">
        <v-text-field
          label="Nombre Completo"
          v-model="fullName"
          :rules="[v => !!v || 'Este campo es requerido', v =>  v.length <=255  || 'El nombre no puede tener mas de 255 caracteres']"
          dense
          outlined
          class="white--text"
        ></v-text-field>
      </VCol>
    </VRow>
    <VRow>
      <VCol cols="12" sm="3">
        <v-text-field
          label="Celular"
          type="number"
          v-model="mobile"
          :rules="[v => v >= 0&&v<=999999999 || 'Debe ingresar un numero valido',v => !!v || 'Este campo es requerido']"
          dense
          outlined
          class="white--text"
        ></v-text-field>
      </VCol>
      <VCol cols="12" sm="3">
        <v-text-field
          label="Telefono"
          v-model="phone"
          :rules="[v => v >= 0 && v<=999999999 || 'Debe ingresar un numero valido']"
          dense
          type="number"
          outlined
          class="white--text"
        ></v-text-field>
      </VCol>
      <VCol cols="12" sm="6">
        <v-text-field
          label="Email"
          v-model="email"
          :rules="[v => !!v || 'El correo es requerido', v => /.+@.+\..+/.test(v) || 'Debe ser un correo válido']"
          dense
          outlined
          class="white--text"
        ></v-text-field>
      </VCol>
    </VRow>
    <VRow>
      <VCol cols="12" sm="4">
        <v-text-field
          label="Dirección"
          :rules="[v => !!v || 'Este campo es requerido', v =>  v.length <=255  || 'La dirección no puede tener mas de 255 caracteres']"
          v-model="address"
          dense
          outlined
          class="white--text"
        ></v-text-field>
      </VCol>
      <VCol cols="12" sm="4">
        <v-text-field
          label="Ocupación"
          v-model="occupation"
          :rules="[v => !!v || 'Este campo es requerido', v =>  v.length <=100  || 'La dirección no puede tener mas de 100 caracteres']"
          dense
          outlined
          class="white--text"
        ></v-text-field>
      </VCol>
      <VCol cols="12" sm="4">
        <v-select
              label="Tipo de Relación"
              :items="['Padre', 'Madre','Apoderado']"
              v-model="relationship"
              :rules="[v => !!v || 'Este campo es requerido']"
              dense
              outlined
              class="white--text"
            ></v-select>
      </VCol>
    </VRow>
    <VRow>
    <VCol cols="12">
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
                      {{ header.text }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in familiars" >
                    <td>{{ item.documentNumber }}</td>
                    <td>{{ item.fullName }}</td>
                    <td>{{ item.relationship }}</td>          
                    <td>
                      <VBtn @click="remove">Remover</VBtn>
                    </td>        
                  </tr>
                  <!-- <tr v-if="loadingEnrollments">
                    <td :colspan="headers.length" class="text-center">
                      Cargando matrículas...
                    </td>
                  </tr>
                  <tr v-else-if="enrolls.length === 0">
                    <td :colspan="headers.length" class="text-center">
                      No hay matrículas registradas.
                    </td>
                  </tr> -->
                </tbody>
              </VTable>
   
    </VCol>
   
    </VRow>
    <VRow justify="center" style="gap:1%">
      <v-btn color="primary" large class="mt-4" @click="previous">
          Regresar
        </v-btn>
      <v-btn color="primary" large class="mt-4" @click="addFamiliar">
        Agregar
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
import { ToastService } from '@/common/util/toast.service';
import { EnrollmentService } from '@/services/enrollments.service';
import { debounce } from 'lodash';
export default {
  data() {
    return {
      documentType:null,
      documentNumber:null,
      fullName:null,
      phone:null,
      mobile:null,
      email:null,
      address:null,
      occupation:null,
      relationship:null,
      familiars:[],
      headers: [
        {
          text: 'DNI',
          align: 'start',
          sortable: false,
          value: 'documentNumber',
        },
        { text: 'Nombre Completo', value: 'fullName' },
        { text: 'Parentesco', value: 'relationship' },
      ],
    };
  }, 
  emits:[
    'nextStep',
    'previousStep',
    ('continue', Array
    )
  ],
  methods: {
    async next() {
      if(this.familiars.length>0){
        this.$emit('continue',this.familiars);
        this.$emit('nextStep');
      }
      else{
        ToastService.error('Debe agregar al menos un familiar');
      }
  },
  async addFamiliar(){
    const isvalid = await this.$refs.form.validate();
    if (isvalid['valid']) {
    this.familiars.push({
      documentType:this.documentType,
      documentNumber:this.documentNumber,
      fullName:this.fullName,
      phone:this.phone,
      mobile:this.mobile,
      email:this.email,
      address:this.address,
      occupation:this.occupation,
      relationship:this.relationship,
    });
    this.documentType=null;
    this.documentNumber=null;
    this.fullName=null;
    this.phone=null;
    this.mobile=null;
    this.email=null;
    this.address=null;
    this.occupation=null;
    this.relationship=null;
   }
  },
  previous() {
    this.$emit('previousStep');
  },
  remove(dni) {
    this.familiars.splice(this.familiars.findIndex(familiar => familiar.documentNumber === dni), 1);
  },
  async validateDNI(){
      if(this.documentNumber&&this.documentNumber.length >= 8){
        EnrollmentService.validateFamilyDNI(this.documentNumber).then((value) => {
          if(value.data==null)return;
          this.documentType=value.data.document_type;
          this.fullName=value.data.full_names;
          this.phone=value.data.phone;
          this.mobile=value.data.cell_phone;
          this.email=value.data.email;
          this.address=value.data.address;
          this.occupation=value.data.occupation;
          this.relationship=value.data.relationship;
      });
    }
  },
  },
  props:{
    chargeData:Object
  },
  watch:{
    documentNumber(value){
      if(value&&value.length >= 8){
        this.debouncedSearch(this.documentNumber);
      }
    }
  },
  created(){
    this.debouncedSearch = debounce(this.validateDNI, 1000);
     if(this.chargeData){
      this.familiars=this.chargeData;
     }

  },
};
</script>
