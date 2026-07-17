<script setup lang="ts">
import ModalBasic from '@/common/components/Modal.vue'
import useEventsBus from '@/common/util/event';
import institution from '../../../services/institution';
import { ref, onMounted,watch } from 'vue';
import { modalError } from '../../../../../../common/util/modal.service';
import { toastError } from '../../../../../../common/util/toast.service';

const { emit } = useEventsBus()
const spinForm = ref(false)
const formValid = ref(false)
const spinExistsSubdomain = ref(false)

let searchTimeout: NodeJS.Timeout | null = null

const input = ref('')

const props = defineProps<{
    show:boolean,
    data: {
        subdomain:string,
        institutionId:number,
        domain: string
    }
}>()

const  existsSubdomain = ref(false);

const vueEmit = defineEmits<{
    (e: 'close'): void,
}>()

const errors = ref<string[]>([])

async function saveSubdomain() {
    spinForm.value = true
    try {
        const {data,success,message} = await institution.updateSubdomain({
            institutionId:props.data.institutionId,
            subdomain:input.value
        })
        if (!success) {
            toastError(message)
            return
        }
        console.log("mit event",data)
        emit('reload-credentials',data)
    } catch (error) {
        modalError((error as any).message)
    } finally {
        spinForm.value = false
        vueEmit('close')
    }
}

onMounted(() => {
    input.value = props.data.subdomain
})


const checkSubdomain = async (subdomain:string) => {
    try {
    spinExistsSubdomain.value = true
    const {data} = await institution.existSubdomain(subdomain,props.data.subdomain)
    if (data) {
        errors.value.push("Ya se encuentra registrado el subdominio " + subdomain)
    } else {
        errors.value = []
    }
    existsSubdomain.value = data
    } catch (error) {
        modalError((error as any).message)
    } finally {
        spinExistsSubdomain.value = false
    }
}

const  generateSubdomain = (name:string) =>  {
    const subdomain = name.toLowerCase().trim().replace(/\s+/g, '-');
    const cleanSubdomain = subdomain.replace(/[^a-z0-9-]/g, '').trim();
    return cleanSubdomain
}

watch(() => input.value, async (newVal:string) => {
    if (!newVal) {
        return
    }

    if (searchTimeout) {
        clearTimeout(searchTimeout)
        searchTimeout = null
    }

    searchTimeout = setTimeout(async () => {
        const subdomain = generateSubdomain(newVal) 
        await checkSubdomain(subdomain)
    },750)
})

</script>

<template>
    <ModalBasic
      :show="show"
      title="Cambiar nombre de subdominio"
      :size="2"
      :persistent="true"
      :width="600"
    >
        <v-card style="position:relative">
            <v-toolbar dark color="var(--bg-toolbar)" class="text-white">
                <v-toolbar-title>CAMBIAR SUBDOMINIO</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon dark @click="$emit('close')">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-toolbar>
            <v-card-text class="my-4 mx-4">
                <v-form 
                    ref="form-subdomain" 
                    @submit.prevent="saveSubdomain" 
                    fast-fail 
                    v-model="formValid"
                >
                    <v-text-field
                        v-model="input"
                        :suffix="data.domain"
                        density="compact"
                        placeholder="rojodi"
                        :loading="spinExistsSubdomain"
                        :disabled="spinExistsSubdomain"
                        :min-width="400"
                        variant="underlined"
                        :error="existsSubdomain"
                        :error-messages="errors"
                    ></v-text-field>
                </v-form>
            </v-card-text>
            <v-card-actions>
                <div class="d-flex justify-end w-100">
                <v-btn
                    @click="vueEmit('close')"
                    variant="outlined"
                    color="indigo"
                >
                    Cancelar
                </v-btn>

                <v-btn
                    type="submit"
                    color="indigo"
                    variant="tonal"
                    :loading="spinForm || spinExistsSubdomain "
                    :disabled="existsSubdomain || spinForm"
                    @click="saveSubdomain"
                >
                    Guardar
                </v-btn>
                </div>
            </v-card-actions>
        </v-card>
    </ModalBasic>

</template>
