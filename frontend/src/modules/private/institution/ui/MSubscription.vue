<template>
    <ModalBasic
      :show="show"
      title="Instituto/Universidad"
      :size="2"
      :persistent="true"
      :width="1000"
    >
      <v-card style="position:relative">
        <v-toolbar dark color="var(--bg-toolbar)" class="text-white">
          <v-toolbar-title>{{ titleModal }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon dark @click="$emit('close')">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        <v-form @submit.prevent="submit" fast-fail>
          <v-card-text class="my-4 mx-4">
            <v-row>
              <v-col cols="12">
                <div class="d-flex align-center justify-center text-h5">
                  <v-icon 
                    :color="item.isActive ? 'success' : 'error'" 
                    size="xx-large"
                    class="mr-2"
                  >
                    {{ item.isActive ? 'mdi-check-circle-outline' : 'mdi-close-circle-outline' }}
                  </v-icon>
                  {{ item.isActive ? 'Activo' : 'Inactivo' }}
                </div>
              </v-col>
              <v-col cols="12">
                <div class="text-subtitle-2 text-medium-emphasis">
                  Tipo de subscripción:<Required />
                </div>
                <div>
                  <VSelect 
                    v-model="subscriptionType" 
                    :items="subscriptionTypes" 
                    item-title="name" 
                    item-value="key" 
                    variant="solo"
                    hide-details
                    class="w-100"
                  />
                </div>
              </v-col>
              <template v-if="subscriptionType === 'limited'">
                <v-col cols="6">
                  <div class="text-subtitle-2 text-medium-emphasis">
                    Fecha de inicio:<Required />
                  </div>
                  <div>
                    <input 
                      v-model="start_date" 
                      type="date" 
                      class="input-date" 
                    />
                  </div>
                </v-col>
                <v-col cols="6">
                  <div class="text-subtitle-2 text-medium-emphasis">
                    Hora de inicio:<Required />
                  </div>
                  <div>
                    <input 
                      v-model="start_time" 
                      type="time" 
                      class="input-date" 
                    />
                  </div>
                </v-col>
                <v-col cols="6">
                  <div class="text-subtitle-2 text-medium-emphasis">
                    Fecha de fin:<Required />
                  </div>
                  <div>
                    <input 
                      v-model="end_date" 
                      type="date" 
                      class="input-date" 
                    />
                  </div>
                </v-col>
                <v-col cols="6">
                  <div class="text-subtitle-2 text-medium-emphasis">
                    Hora de fin:<Required />
                  </div>
                  <div>
                    <input 
                      v-model="end_time" 
                      type="time" 
                      class="input-date" 
                    />
                  </div>
                </v-col>
              </template>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <div class="d-flex justify-end w-100">
              <v-btn
                @click="emit('close')"
                variant="tonal"
              >
                Cancelar
              </v-btn>

              <v-btn
                type="submit"
                color="var(--login-blue-color)"
                variant="tonal"
                :loading="spinForm"
              >
                Actualizar
              </v-btn>
            </div>
          </v-card-actions>
        </v-form>
      </v-card>
    </ModalBasic>
  </template>
<script setup lang="ts">
import ModalBasic from '@/common/components/Modal.vue'
import Required from '@/common/components/InputRequired.vue'
import { ref, watch } from 'vue';
import { SubscriptionForm } from '../domain/Institution';
import { onMounted } from 'vue';
import institution from '../services/institution';
import { modalError } from '@/common/util/modal.service';
import { Institution } from '../domain/Institution';
import { toastSuccess } from '@/common/util/toast.service';

const props = defineProps<{
    show:boolean
    item: Institution
}>()

const spinForm = ref(false)

const emit = defineEmits<{
    (e: 'close'): void,
    (e:'submit') : void
}>()

const titleModal = ref('')
const subscriptionTypes = [
  {key: 'unlimited', name: 'Ilimitada'},
  {key: 'limited', name: 'Limitada'},
]

const start_date = ref('')
const start_time = ref('')
const end_date = ref('')
const end_time = ref('')
const subscriptionType = ref('limited')
const formSubmit = ref<SubscriptionForm>({
    start_date: '',
    end_date: '',
})

const updateDates = () => {
  start_date.value = props.item.startDate.split(' ')[0]
  start_time.value = props.item.startDate.split(' ')[1].split(':')[0] + ':' + props.item.startDate.split(' ')[1].split(':')[1]
  
  if(props.item.endDate) {
    end_date.value = props.item.endDate.split(' ')[0]
    end_time.value = props.item.endDate.split(' ')[1].split(':')[0] + ':' + props.item.endDate.split(' ')[1].split(':')[1]
  } else {
    subscriptionType.value = 'unlimited'
    end_date.value = ''
    end_time.value = ''
  }
}


const submit = async () => {
  if (
    !start_date.value ||
    !start_time.value ||
    (subscriptionType.value === 'limited' && (!end_date.value || !end_time.value))
  ) {
    modalError('Todos los campos son requeridos.')
    return
  }

  spinForm.value = true

  if (subscriptionType.value === 'limited') {
    formSubmit.value.start_date = `${start_date.value} ${start_time.value}:00`
    formSubmit.value.end_date = `${end_date.value} ${end_time.value}:00`
  } else {
    formSubmit.value.start_date = props.item.startDate
    formSubmit.value.end_date = null
  }

  institution.updateSubscription(formSubmit.value, props.item.id).then(() => {
    toastSuccess('Institución actualizada correctamente.')
    emit('submit')
    emit('close')
  }).catch((error) => {
    modalError((error as any).message)
  }).finally(() => {
    spinForm.value = false
  })
}

onMounted(async () => {
  titleModal.value = `INSTITUCIÓN ${props.item.name.toUpperCase()}`
  updateDates()
})

watch(() => props.item, () => {
  updateDates()
})

</script>

<style scoped>
.input-date {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 0.25rem;
}
</style>