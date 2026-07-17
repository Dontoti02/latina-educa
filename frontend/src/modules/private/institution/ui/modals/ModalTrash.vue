<script setup lang="ts">
import ModalBasic from '@/common/components/Modal.vue'
import { ref } from 'vue';
import Overlay from '@/common/components/Overlay.vue'
import Progress from '@/common/components/Progress.vue'
import { Institution } from '../../domain/Institution';
import { modalError } from '@/common/util/modal.service';
import { toastSuccess } from '@/common/util/toast.service';
import institution from '../../services/institution';
const props = defineProps<{
    show:boolean
    item?:Institution
}>()

const emit = defineEmits<{
    (e: 'close'): void
    (e: 'submit') : void
}>()

const spinForm = ref(false)

const confirmDelete = ref(false)

const deleteInstitution = async () => {

    if (!props.item) return
    try {
        spinForm.value = true
        const {success,message} =  await institution.delete(props.item.id)
        if (!success) {
            modalError(message)
            return
        }
        toastSuccess(message)
        emit('submit')
    } catch (error) {
        modalError((error as any).message)
    } finally {
        spinForm.value = false
    }
}

</script>

<template>
    <ModalBasic
      :show="show"
      :size="2"
      :persistent="true"
      :width="500"
    >
        <v-card style="position:relative">
            <v-toolbar dark color="#F44336" class="text-white">
                <v-toolbar-title>ELIMINAR</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon dark @click="$emit('close')">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-toolbar>
            <v-card-text class="my-4 mx-4" v-if="item">

                    <span class="text-caption text-red-accent-2 font-weight-bold">
                        Nota:  Esta acción es irreversible.
                    </span>

                    <h4 class="text-red-accent-4 text-center">
                        ¿Estas seguro que desea eliminar la institución
                        {{ item.name }}?
                    </h4>

                    <br>
                    <v-card
                        :color="'indigo'"
                        :variant="'tonal'"
                    >
                        <v-card-text>
                            <p class="font-weight-bold">
                            Al <strong>eliminar</strong> la institución se eliminará:
                            </p>
                            
                            <ul class="mx-2">
                                <li>
                                    Registro de la base de datos central.
                                </li>
                                <li>
                                    Contenido(archivos) alojado en las aulas virtuales.
                                </li>
                                <li>
                                    Base de datos de la institución.
                                </li>
                            </ul>
                        </v-card-text>
                    </v-card>

                    <v-checkbox
                        v-model="confirmDelete"
                        color="red"
                        label="Confirmo que deseo eliminar la institución."
                        hide-details
                    ></v-checkbox>
            </v-card-text>
            <v-card-actions>
                <div class="d-flex justify-end w-100">
                <v-btn
                    @click="emit('close')"
                    variant="tonal"
                    color="#F44336"
                >
                    Cancelar
                </v-btn>

                <v-btn
                    color="#F44336"
                    variant="elevated"
                    @click="deleteInstitution()"
                    :loading="spinForm"
                    :disabled="!confirmDelete"
                >
                    Aceptar
                </v-btn>
                </div>
            </v-card-actions>
        </v-card>
        <Overlay
            :loader="spinForm"
        >
            <Progress
            :loading="true"
            :title=" `
                <span class='text-white font-weight-medium'>
                Eliminando institución ...
                </span>
            `"
            :color="'blue'"
            />
        </Overlay>
    </ModalBasic>
</template>