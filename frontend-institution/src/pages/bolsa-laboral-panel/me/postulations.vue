<script setup lang="ts">
import { modalConfirmation } from '@/common/util/modal.service'
import { toastError, toastSuccess } from '@/common/util/toast.service'
import { GlobalPagination } from '@/models/global'
import { LastOffers, MyApplicant } from '@/models/job-opportunities/applicant'
import { JobOpportunitiesApplicantService } from '@/services/job-opportutines/applicants.service'
  const router = useRouter()
  const route = useRoute()
  const tab = ref(route.path.includes('postulations') ? 'postulations' : 'cvs')
  const loading = ref(false)
  const applications = ref<MyApplicant[]>([])
  const lastOffers = ref<LastOffers[]>([])
  const pagination = ref<GlobalPagination>({
    currentPage: 1,
    lastPage: 1,
    itemsPerPage: 0,
    totalItems: 0
  })
  watch(tab, newVal => {
    router.push(`/bolsa-laboral-panel/me/${newVal}`)
  })

  watch(() => pagination.value.currentPage, () => {
    fetchApplications()
  })

  const fetchApplications = async () => {
    try {
      loading.value = true
      const { data } = await JobOpportunitiesApplicantService.myApplications(
        pagination.value.currentPage,
      )
      applications.value = data.applications
      lastOffers.value = data.lastOffers
      pagination.value = data.pagination
    } catch (error) {
    } finally {
      loading.value = false
    }
  }

  const cancelApplication = async (applicationId: number) => {

    const result = await modalConfirmation({
      title: 'Anular Postulación',
      content: '¿Estás seguro de que deseas anular esta postulación?'
    })
    if (!result) return
    try {
      loading.value = true
      const {success,message} = await JobOpportunitiesApplicantService.cancelApplication(applicationId)
      if (!success) {
        toastError(message || 'Error al anular la postulación')
        return
      }
      toastSuccess(message)
      fetchApplications()
    } catch (error) {
      console.error('Error al anular la postulación:', error)
    } finally {
      loading.value = false
    }
  }

  const openOffer = (offerSlug: string) => {
    window.open(`/bolsa-laboral/${offerSlug}`, '_blank')
  }
  onMounted(() => {
    fetchApplications()
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

      <VRow>
        <VCol cols="12" md="8">
          <VRow class="mb-2">
            <VCol cols="12">
              <VCard class="pa-4">
                <VCardTitle class="text-h5">
                  <VRow>
                    <VCol cols="12" sm="6">
                      Mis Postulaciones
                    </VCol>
                    <VCol cols="12" md="6" style="display: flex; justify-content: flex-end;">
                      <v-pagination 
                        :length="pagination.lastPage"
                        rounded="circle"
                        :total-visible="3"
                        v-model="pagination.currentPage"
                        density="compact"
                        @update:modelValue="pagination.currentPage = $event"
                      ></v-pagination>
                    </VCol>
                  </VRow>
                </VCardTitle>
              </VCard>
            </VCol>
          </VRow>
          <VCard v-for="application in applications" :key="application.offerId" class="mb-4" v-if="applications.length > 0">
            <v-toolbar color="surface" class="pa-2" :elevation="5">
              <template v-slot:prepend>
                <VIcon icon="mdi-briefcase" class="mr-2" />
              </template>
              <v-toolbar-title class="text-h6" :text="application.offerTitle"></v-toolbar-title>
              <template v-slot:append>
                <VMenu :location="'bottom'">
                  <template v-slot:activator="{ props }">
                    <v-btn icon="mdi-dots-vertical" variant="text" v-bind="props"></v-btn>
                  </template>
                  <v-list>
                    <VListSubheader>Acciones</VListSubheader>
                    <VListItem @click="() => cancelApplication(application.id)">
                      <VListItemTitle>
                        <VIcon start>
                          mdi-cancel
                        </VIcon>
                        Anular Postulación
                      </VListItemTitle>
                    </VListItem>
                    <VListItem @click="openOffer(application.offerSlug)">
                      <VListItemTitle>
                        <VIcon start>mdi-eye</VIcon>
                        Ver Oferta
                      </VListItemTitle>
                    </VListItem>
                  </v-list>
                </VMenu>
              </template>
          </v-toolbar>
          </VCard>
          <VCard v-if="applications.length === 0" >
            <VCardText class="text-center">
              No tienes postulaciones registradas.
            </VCardText>
          </VCard>
        </VCol>
        <VCol cols="12" md="4">
          <VRow>
            <VCol cols="12">
              <VCard class="pa-4" elevation="0" rounded="0">
                <VCardTitle class="text-h5">
                  Te pueden interesar
                  <VIcon icon="mdi-chevron-right" class="ml-2" />
                </VCardTitle>
              </VCard>
            </VCol>
          </VRow>
          <VList nav :lines="false">
            <VListItem v-for="offer in lastOffers" :key="offer.id" 
            variant="plain"
            @click="openOffer(offer.slug)"
            >
              <VListItemTitle>{{ offer.title }}</VListItemTitle>
            </VListItem>
          </VList>
        </VCol>
      </VRow>
    </div>
</template>
<route lang="yaml">
meta:
  action: read
  subject: Candidate
</route>
