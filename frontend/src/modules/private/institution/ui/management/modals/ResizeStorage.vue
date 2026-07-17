<script setup lang="ts">
import ModalBasic from '@/common/components/Modal.vue'
import Overlay from '@/common/components/Overlay.vue'
import Progress from '@/common/components/Progress.vue'
import { ref, onMounted, computed } from 'vue';
import { toastError, toastSuccess } from '../../../../../../common/util/toast.service';
import institutionService from '../../../services/institution'

const props = defineProps<{
    show:boolean,
    storage: {
        institutionId:number,
        currentSpaceLimit:number
    }
}>()

const equivalent = 1024;

const spinForm = ref(false)
const newLimitGB = ref<number>()

onMounted(() => {
  newLimitGB.value = props.storage.currentSpaceLimit / equivalent
})

const currentLimitGB = computed(() => props.storage.currentSpaceLimit / equivalent)

const emit = defineEmits<{
    (e: 'close'): void,
    (e:'reload',total:number) : void
}>()

const updateLimit = async () => {
  try {
    spinForm.value = true
        const {success,message,data } = await institutionService.resizeLimitStorage({
            institutionId:props.storage.institutionId,
            size:newLimitGB.value!
        });

        if (!success) {
            toastError(message)
            return
        }

        toastSuccess(message)
        emit('reload',data)
  } catch (error) {
    toastError((error as any).message)
  } finally {
    spinForm.value = false
  }
}

</script>

<template>
    <ModalBasic
      :show="show"
      title="Cambiar limite de almacenamiento"
      :size="2"
      :persistent="true"
      :width="500"
    >
        <v-card style="position:relative">
            <v-toolbar dark color="var(--bg-toolbar)" class="text-white">
                <v-toolbar-title>CAMBIAR LIMITE</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-btn icon dark @click="$emit('close')">
                    <v-icon>mdi-close</v-icon>
                </v-btn>
            </v-toolbar>
            <v-card-text class="my-4 mx-4">
              <v-alert :stacked="false"
                :color="'deep-purple-accent-4'"
              >
                    <template v-slot:prepend>
                        <v-avatar
                            color="deep-purple-accent-4"
                            icon="mdi-chart-donut"
                        ></v-avatar>
                    </template>
                    <v-banner-text style="width: 100%;">
                        <p class="text-caption">
                            Limite actual: <strong>{{ currentLimitGB }} GB ({{ storage.currentSpaceLimit }} MB) </strong>
                        </p>
                    </v-banner-text>
                </v-alert>
                <br><br>
                <div class="text-subtitle-2 text-medium-emphasis pb-2">
                  Ingrese nuevo limite en GB
                </div>
                <v-number-input control-variant="split"
                  v-model="newLimitGB"
                  :min="currentLimitGB"
                  :suffix="'GB'"
                ></v-number-input>
            </v-card-text>
            <v-card-actions>
            <div class="d-flex justify-end w-100">
              <v-btn
                @click="emit('close')"
                variant="outlined"
                color="indigo"
              >
                Cancelar
              </v-btn>

              <v-btn
                type="submit"
                color="indigo"
                variant="tonal"
                :loading="spinForm"
                @click="updateLimit()"
              >
                Guardar
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
                        cambiando limite de espacio ...
                    </span>
                `"
                :color="'blue'"
            />
        </Overlay>
    </ModalBasic>
</template>