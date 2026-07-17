<script setup lang="ts">
import { emailValidator, requiredValidator } from '@/@core/utils/validators';
import { toastError, toastSuccess } from '@/common/util/toast.service';
import { FormRegisterCompany } from '@/models/job-opportunities/company';
import { JobOpportunitiesCompanyService } from '@/services/job-opportutines/company';
import { ref } from 'vue'
const formRef = ref()
const loading = ref(false);
const formValid = ref(false);
let debounceTimeout: ReturnType<typeof setTimeout> | null = null

  const initialForm = {
    name: '',
    email: '',
    ruc: '',
    phone: '',
    address: '',
    mailbox: null,
    website: null,
    description: null
  }

const form = ref<FormRegisterCompany>(initialForm);

const clearForm = () => {
  formRef.value?.reset()
  formValid.value = false
  if (debounceTimeout) clearTimeout(debounceTimeout)
  debounceTimeout = null
}

const onSubmit = async () => {
   const { valid } = await formRef.value.validate()
   if (!valid) {
      toastError('Por favor, completa todos los campos requeridos.')
      return
   }
  try {
    const {success,message} = await JobOpportunitiesCompanyService.register(form.value)
    if (!success) {
      toastError(message)
      return
    }
    toastSuccess(message)
    clearForm()
  } catch (error) {
    toastError((error as Error).message)
  } finally {
    loading.value = false  
  }
};

</script>
<template>

    <v-card class="pa-5" max-width="1000" outlined>
      <v-card-title class="text-h5 font-weight-bold">Registro de Empresa</v-card-title>
      <v-card-text>
        <v-container>
          <VForm
            ref="formRef"
            @submit.prevent="onSubmit"
            :disabled="loading"
          >
          <v-row>
            <v-col cols="12" md="12">
              <AppTextField 
                label="Nombre de la Empresa *" 
                required
                v-model="form.name" 
                :rules="[requiredValidator]"
              ></AppTextField>
            </v-col>
            <v-col cols="12" md="6">
              <AppTextField label="Email *" 
                required
                v-model="form.email" 
                :rules="[requiredValidator, emailValidator]"
              ></AppTextField>
            </v-col>
            <v-col cols="12" md="6">
              <AppTextField 
                label="RUC *" 
                required
                v-model="form.ruc" 
                :rules="[requiredValidator]"
                :mask="['##-###-#######']"
                :placeholder="form.ruc ? 'RUC' : 'Ej: 1234567890'"
              ></AppTextField>
            </v-col>
            <v-col cols="12" md="6">
              <AppTextField label="Teléfono *" 
                required
                v-model="form.phone" 
                :rules="[requiredValidator]"
                :mask="['(##) ####-####']"
                :placeholder="form.phone ? 'Teléfono' : 'Ej: (01) 1234-5678'"
              ></AppTextField>
            </v-col>
            <v-col cols="12" md="6">
              <AppTextField label="Dirección *" 
                required
                v-model="form.address" 
                :rules="[requiredValidator]"
                :placeholder="form.address ? 'Dirección' : 'Ej: Av. Siempre Viva 123'"
              ></AppTextField>
            </v-col>
            <v-col cols="12" md="6">
              <AppTextField 
                label="Buzón de Correo"
                v-model="form.mailbox" 
                :rules="[emailValidator]"
                :placeholder="'Correo donde se recibirán las postulaciones'"
              ></AppTextField>
            </v-col>
            <v-col cols="12" md="6">
              <AppTextField 
                label="Página Web"
                v-model="form.website"
                :placeholder="'Página web de la empresa'"
              ></AppTextField>
            </v-col>
            <v-col cols="12" md="12">
              <AppTextarea 
                label="Acerca de la empresa"
                v-model="form.description"
                :placeholder="'Descripción de la empresa'"
                rows="5"
              ></AppTextarea>
            </v-col>
          </v-row>
          </VForm>
          <div class="text-center mt-4 d-flex flex-column">
            <v-row>
              <v-col cols="12" md="12">
                <VBtn
                  class="px-4 w-100"
                  color="primary"
                  text="Registrarse"
                  :loading="loading"
                  :disabled="loading"
                  variant="flat"
                  type="submit"
                  @click="onSubmit"
                />
              </v-col>
            </v-row>
            
            <v-row class="d-flex justify-between">
              <v-col cols="12" md="6" class="text-center">
                <p class="text-h6" style="margin: 0;">¿Ya tienes una cuenta?</p>
                <a color="text" href="/login">Iniciar Sesión</a>
              </v-col>
              <v-col cols="12" md="6" class="text-center">
                <p class="text-h6" style="margin: 0;">¿Olvidaste tu contraseña?</p>
                <a color="text" href="/forgot-password">Recuperar Contraseña</a>
              </v-col>
            </v-row>

          </div>
        </v-container>
      </v-card-text>
    </v-card>
</template>
