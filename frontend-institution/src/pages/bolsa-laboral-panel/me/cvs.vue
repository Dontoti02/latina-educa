<script setup lang="ts">
import emitter from '@/common/util/emitter.service'
import { modalConfirmation } from '@/common/util/modal.service'
import { toastError, toastSuccess } from '@/common/util/toast.service'
import { CV } from '@/models/job-opportunities/applicant'
import { JobOpportunitiesApplicantService } from '@/services/job-opportutines/applicants.service'
import { ImageUtils } from '@/utils/images'
import { VCardSubtitle } from 'vuetify/lib/components/index.mjs'
import CvUpload from '@/components/JobOpportunities/private/me/cv/upload.vue';

  const router = useRouter()
  const route = useRoute()
  const tab = ref(route.path.includes('postulations') ? 'postulations' : 'cvs')

  const cvs = ref<CV[]>([]) 
  
  const fetchCvs = async () => {
    try {
      const { data } = await JobOpportunitiesApplicantService.myCVs()
      cvs.value = data
    } catch (error) {
      console.error('Error fetching CVs:', error)
    }
  }
  watch(tab, newVal => {
    router.push(`/bolsa-laboral-panel/me/${newVal}`)
  })

const downloadFile = (cv: CV) => {
  fetch(ImageUtils.getUrlImage(cv.url))
  .then(response => response.blob())
  .then(blob => {
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = cv.url.split('/').pop() || cv.version + '.pdf'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
  })
  .catch(error => {
    toastError('Error al descargar el archivo' + error.message)
  })
}

const deleteCV = async (cv: CV) => {
  const confirm = await modalConfirmation({
    title: 'Eliminar CV',
    content: '¿Estás seguro de que deseas eliminar este Curriculum\'s Vitae?'
  })

  if (!confirm) return
  JobOpportunitiesApplicantService.deleteMyCV(cv.id)
    .then(({success,message}) => {
      if (!success) {
        toastError(message || 'Error al eliminar el Curriculum\'s Vitae')
        return
      }
      toastSuccess('Curriculum\'s Vitae eliminado correctamente.')
      fetchCvs()
    })
    .catch(error => {
      toastError('Error al eliminar el Curriculum\'s Vitae: ' + error.message)
    })
}


const onAddCV = (cvItem: {
  id: number;
  version: string;
  url: string;
}) => {
  cvs.value.unshift({
    id: cvItem.id,
    version: cvItem.version,
    url: cvItem.url,
    createdAt: new Date().toISOString(),
  });
};

onMounted(async () => {
  await fetchCvs()
  emitter.on('uploadCV', (event) => onAddCV(event as { id: number; version: string; url: string; }));
});
onUnmounted(() => {
  emitter.off('uploadCV',(event) => onAddCV(event as { id: number; version: string; url: string; }));
});


onMounted(() => {
  fetchCvs()
})
</script>

<template>
  <div>
    <VCard rounded="xl" class="mb-4">
      <VTabs v-model="tab"  grow stacked>
        <VTab value="postulations">
          <VIcon icon="mdi-briefcase" class="mr-2" />
          Postulaciones
        </VTab>
        <VTab value="cvs">
          <VIcon icon="mdi-file-document" class="mr-2" />
          Curriculum's Vitae
        </VTab>
      </VTabs>
    </VCard>

    <VCard class="mb-4">
      <VCardTitle>
        <VRow style="align-items: center;">
          <VCol cols="12" sm="6">
            <VIcon icon="mdi-file-document" class="mr-2" />
            Curriculum's Vitae
          </VCol>
          <VCol cols="12" sm="6" class="text-right">
            <!-- <VBtn color="primary" @click="() => {}">
              <VIcon icon="mdi-plus" class="mr-2" />
              Agregar CV
            </VBtn> -->
            <CvUpload 
              styleBtn="tonal"
            />
          </VCol>
        </VRow>
      </VCardTitle>
      <VCardSubtitle>
        <p class="my-0 py-0">
          Aquí puedes gestionar tus Curriculum's Vitae. 
        </p>
        Puedes subir y eliminar tus CVs.
      </VCardSubtitle>
    </VCard>
     <VCard v-for="cv in cvs" :key="cv.id" class="mb-4" v-if="cvs.length > 0">
      <v-toolbar color="surface" class="pa-2" :elevation="5">
        <template v-slot:prepend>
          <VIcon icon="mdi-briefcase" class="mr-2" />
        </template>
        <v-toolbar-title class="text-h6" :text="cv.version"></v-toolbar-title>
        <template v-slot:append>
          <VMenu :location="'bottom'">
            <template v-slot:activator="{ props }">
              <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props"></v-btn>
            </template>
            <v-list>
              <VListSubheader>Acciones</VListSubheader>
              <VListItem @click="() => downloadFile(cv)">
                <VListItemTitle>
                  <VIcon start>
                    mdi-download
                  </VIcon>
                  Descargar
                </VListItemTitle>
              </VListItem>
              <VListItem @click="() => deleteCV(cv)">
                <VListItemTitle>
                  <VIcon start>
                    mdi-trash
                  </VIcon>
                  Eliminar
                </VListItemTitle>
              </VListItem>
              
            </v-list>
          </VMenu>
        </template>
      </v-toolbar>
    </VCard>
    <VCard v-if="cvs.length === 0" class="pa-4 text-center">
      <p>No tienes Curriculum's Vitae registrados.</p>
      <p>Sube uno nuevo para comenzar.</p>
  </VCard>
  </div>
</template>
<route lang="yaml">
meta:
  action: read
  subject: Candidate
</route>
