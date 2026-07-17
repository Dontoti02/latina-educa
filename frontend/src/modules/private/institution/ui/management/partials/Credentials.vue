<script setup lang="ts">
import { ref } from 'vue';
import institutionService from '../../../services/institution'
import { toastError, toastSuccess } from '@/common/util/toast.service';
import { ResumenCredentials } from '../../../domain/Institution';
import ChangeSubdomain from '../modals/ChangeSubdomain.vue'
import BtnClipboard from '@/common/components/BtnClipboard.vue'

const props = defineProps<{data:ResumenCredentials}>()

const loading = ref(false);

const emit = defineEmits<{
    (e: 'user', user: ResumenCredentials ): void
}>()

const modalSubdomain = ref(false)
const showPassword = ref(false)

const createUserDefault = async () => {
    try {
        loading.value = true
        const {success,message,data } = await institutionService.createUserDefault({
            institutionId:props.data.institutionId,
        });

        if (!success) {
            toastError(message)
            return
        }

        toastSuccess(message)
        emit('user',data)
    } catch (error) {
        toastError((error as any).message)
    } finally {
        loading.value = false
    }
}

function goInstitution() {
  window.open(props.data.url, '_blank')
}


</script> 

<template>
    <VCard title="Acceso y Crendenciales"
        :color="'indigo'"
        variant="tonal"
    >
        <v-card-text>
            <v-banner
                color="deep-purple-accent-4"
                lines="two"
            >
                <template v-slot:prepend>
                    <v-avatar
                        color="deep-purple-accent-4"
                        icon="mdi-link-variant"
                    ></v-avatar>
                </template>

                <v-banner-text style="width: 100%;">
                    <span class="text-caption">
                        subdominio
                    </span>
                    <p class="text-subtitle-1 text-indigo">
                        {{data.subdomain }}
                    </p>
                </v-banner-text>

                <v-banner-actions>
                    <v-btn color="indigo" @click="modalSubdomain = true">
                        <v-icon>mdi-pencil</v-icon>Editar
                    </v-btn>

                    <v-btn color="indigo" @click="goInstitution">
                        <v-icon>mdi-open-in-new</v-icon>Ir
                    </v-btn>
                </v-banner-actions>
            </v-banner>
        </v-card-text>

        <v-card-text>
            <div class="text-h6 mb-1">
                <template v-if="!data.user">
                    <v-banner :stacked="false">
                        <template v-slot:prepend>
                            <v-avatar
                                color="deep-purple-accent-4"
                                icon="mdi-account"
                            ></v-avatar>
                        </template>
                        <v-banner-text style="width: 100%;">
                            <p class="text-caption">
                                Usuario
                            </p>

                            <p class="text-subtitle-1 text-indigo">
                                <strong>Usuario no configurado,</strong> como administrador puede crear un <strong>administrador</strong> para poder acceder a la institución.
                            </p>
                            <br>
                            <span class="text-caption">Nota: Para poder crear este usuario asegurese de tener configurado en 
                            <strong >General > parámetros</strong>, el usuario y contraseña por defecto.
                        </span>
                        </v-banner-text>
                        <v-banner-actions>
                            <v-btn color="indigo"
                                @click="createUserDefault()"
                                :loading="loading"
                            >
                                <v-icon>mdi-content-save</v-icon> Crear usuario
                            </v-btn>
                        </v-banner-actions>
                    </v-banner>
                </template>
                <v-banner :stacked="true" v-else>
                    <template v-slot:prepend>
                        <v-avatar
                            color="deep-purple-accent-4"
                            icon="mdi-account"
                        ></v-avatar>
                    </template>
                    <v-banner-text style="width: 100%;">
                        <p class="text-caption">
                            Usuario
                        </p>
                        <div class="d-flex justify-space-between">
                            <div>
                                <p class="text-subtitle-1 text-indigo">
                                    {{ data.user.email }}
                                </p>
                            </div>
                            <div>
                                <BtnClipboard 
                                 :value="data.user.email"
                                />
                            </div>
                        </div>
                       
                        <span class="text-caption">
                           contraseña <v-icon @click="showPassword = !showPassword">
                            {{ showPassword ? 'mdi-eye' : 'mdi-eye-off' }} 
                        </v-icon>
                        </span>

                        <div class="d-flex justify-space-between">
                            <div>
                                <p class="text-subtitle-1 text-indigo" v-if="showPassword">
                                    {{ data.user.password }}
                                </p>
                                <p v-else>
                                    {{ data.user.password.split('').map(() => '*').join('') }}
                                </p>
                            </div>
                            <div>
                                <BtnClipboard 
                                 :value="data.user.password"
                                />
                            </div>
                        </div>
                    </v-banner-text>
                </v-banner>
            </div>
        </v-card-text>
    </VCard>
    <ChangeSubdomain 
        v-if="modalSubdomain"
        :show="modalSubdomain"
        :data = "{
            subdomain: data.tenatSubdomain,
            institutionId : data.institutionId,
            domain : data.domain
        }"
        @close="modalSubdomain = false"
    />
</template>

<style scoped>

    a:link { 
        text-decoration: none; 
    } 
    a:visited { 
        text-decoration: none; 
    } 
    a:hover { 
        text-decoration: none; 
    } 
    a:active { 
        text-decoration: none; 
    }
</style>