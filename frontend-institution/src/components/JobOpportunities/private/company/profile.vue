<script setup lang="ts">
import { ProfileCompanyForm } from '@/models/job-opportunities/company';
import { JobOpportunitiesCompanyService } from '@/services/job-opportutines/company';
import { VCol } from 'vuetify/lib/components/index.mjs';
import CompanyLogo from './logo.vue';
import { ToastService } from '@/common/util/toast.service';
import { QuillEditor } from '@vueup/vue-quill'

const form = ref<ProfileCompanyForm>();
const loadingForm = ref<boolean>(false);
const quillToolbar = [[{ size: ['small', false, 'large', 'huge'] }], ['bold', 'italic'], [{ list: 'bullet' }, { list: 'ordered' }], ['link', 'image']];

const fetchCompanyProfile = async () => {
  try {
    const { data } = await JobOpportunitiesCompanyService.profile();
    form.value = {
      name: data.name,
      email : data.email,
      phone: data.phone,
      ruc: data.ruc,
      description: data.description,
      mailbox: data.mailbox,
      website: data.website,
      address: data.address,
      logo: data.logo
    };
  } catch (error) {
    console.error('Error fetching company profile:', error);
  }
};

const fetchUpdateProfile = async () => {
  if (!form.value) return;

  try {
    await JobOpportunitiesCompanyService.updateProfile(form.value);
    await fetchCompanyProfile();
    ToastService.success('Perfil actualizado correctamente');
  } catch (error) {
    ToastService.error((error as Error).message || 'Error al actualizar el perfil');
  }
};

onMounted(() => {
  fetchCompanyProfile();
});

</script>
<template>
  <VForm @submit.prevent="fetchUpdateProfile">
    <VCard class="mt-6"
      title="Perfil de la Empresa"
      :subtitle=" form?.name || 'Perfil de la Empresa'"
    >
      <template  v-slot:prepend>
        <CompanyLogo
          :logo="form?.logo || null"
          @update:logo="(logo: string | null) => { if (form) form.logo = logo; }"
          @change-photo="fetchCompanyProfile"
        />
      </template>
      <VCardText v-if="form">
          <VCol cols="12" md="12">
            <VTextField
              label="Nombre de la Empresa"
              v-model="form.name"
              required
              :disabled="loadingForm"
            />
          </VCol>
          <VCol cols="12" md="12">
            <VTextField
              label="Teléfono"
              v-model="form.phone"
              type="tel"
              :disabled="loadingForm"
            />
          </VCol>
          <VCol cols="12" md="12">
            <VTextField
              label="RUC"
              v-model="form.ruc"
              type="text"
              :disabled="loadingForm"
            />
          </VCol>
          
          <VCol cols="12" md="12">
            <!-- <VTextarea
              label="Acerca de la Empresa"
              v-model="form.description"
              rows="3"
              :disabled="loadingForm"
            /> -->
            <label>
              Acerca de la Empresa...
            </label>
             <QuillEditor
              v-model:content="form.description"
              theme="snow"
              id="editor-about-company"
              :toolbar="quillToolbar"
              content-type="html"
              placeholder="Acerca de la Empresa..."
              :read-only="loadingForm"
              :required="true"
              style="height: 10rem !important;"
            />
          </VCol>

          <VCol cols="12" md="12">
            <VTextField
              label="Buzón de Correo"
              v-model="form.mailbox"
              type="email"
              :disabled="loadingForm"
            />
          </VCol>

          <VCol cols="12" md="12">
            <VTextField
              label="Sitio Web"
              v-model="form.website"
              type="url"
              :disabled="loadingForm"
            />
          </VCol>

          <VCol cols="12" md="12">
            <VTextField
              label="Dirección"
              v-model="form.address"
              :disabled="loadingForm"
            />
          </VCol>
      </VCardText>
      <VCardActions class="justify-end">
        <VCol cols="12" md="12" class="text-right">
          <VBtn
            class="text-none"
            variant="tonal"
            color="primary"
            text="Actualizar"
            type="submit"
            :disabled="loadingForm"
            :loading="loadingForm"
          />
        </VCol>
      </VCardActions>
    </VCard>
  </VForm>
</template>
