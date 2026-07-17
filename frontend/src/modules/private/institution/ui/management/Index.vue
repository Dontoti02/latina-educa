
<template>
    <AppContent class="relative">
        <VRow class="match-height" v-if="data">
            <VCol cols="12">
                <VBtn variant="text" @click="back">
                    <VIcon>mdi-arrow-left</VIcon> volver
                </VBtn>
            </VCol>
            <VCol
                cols="12"
                md="5"
                lg="4"
            >
                <WelcomeInstitution
                    :data="data.institution"
                />
            </VCol>
            <VCol
                cols="12"
                md="7"
                lg="8"
            >
                <ResumenInstitutionVue 
                    :data="data.institution"
                />
            </VCol>

            <VCol
                cols="12"
                md="5"
                lg="4"
            >
                <Storage 
                    :data="data.storage"
                    @reload="onReloadStorage($event)"
                />
            </VCol>
            <VCol
                cols="12"
                md="7"
                lg="8"
            >
                <Credentials 
                    :data="data.credentials"
                    @user="onUpdateUserCredentials($event)"
                />
            </VCol>
        </VRow>

        <VRow style="position: relative;height: 85vh;" v-else> 
            <VCol
                cols="12"
                md="12"
                lg="12"
            >
                <Overlay
                    :loader="true"
                >
                    <Progress
                        :loading="true"
                        :title=" `
                            <span class='text-white font-weight-medium'>
                                Consultado información de la institución ...
                            </span>
                        `"
                        :color="'blue'"
                    />
                </Overlay>
            </VCol>
        </VRow>
    </AppContent>
</template>

<script setup lang="ts">
import { onMounted, ref} from 'vue';
import { useRouter } from 'vue-router';
import AppContent from '@/modules/app/pages/AppContent.vue'
import WelcomeInstitution from './partials/WelcomeInstitution.vue'
import Overlay from '@/common/components/Overlay.vue'
import Progress from '@/common/components/Progress.vue'
import ResumenInstitutionVue from './partials/Resumen.vue'
import Credentials from './partials/Credentials.vue'
import Storage from './partials/Storage.vue'
import { Resumen, ResumenCredentials } from '../../domain/Institution';
import institutionService from '../../services/institution'
import useEventsBus from '@/common/util/event';

const id = ref<string|null>()

const router = useRouter()

const data = ref<Resumen>()

const { on } = useEventsBus()


const back = () => {
    router.back()
}
 
on('reload-credentials', (args: {
    domain:string
    subdomain:string
    url : string
}) => {
    if (!data.value) return
    const {domain, subdomain,url } = args
    data.value.credentials.domain =  domain
    data.value.credentials.subdomain = subdomain + '.' + domain
    data.value.credentials.tenatSubdomain = subdomain
    data.value.credentials.url = url
    data.value.institution.url = url
});


const resumen = async () => {
    if (!id.value) return
    const {...more} = await institutionService.detail(+id.value)
    data.value = more.data
}

const setId = async () => {
    await router.isReady()
    id.value = router.currentRoute.value.params.id as string
}

const onUpdateUserCredentials = (resumenCredentials:ResumenCredentials) => {
    if (!data.value) return
    data.value.credentials = resumenCredentials;
}

const onReloadStorage = (total:number) => {
    if (!data.value) return
    data.value.storage.chart.total = total;
}

onMounted(async () => {
    await setId()
    await resumen()
})
</script>