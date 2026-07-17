<script setup lang="ts">
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'
import { requiredValidator } from '@/@core/utils/validators'
import ModalBasic from '@/common/components/Modal.vue'
import { toastError, ToastService } from '@/common/util/toast.service'
import {  FormCreateScale, Scale } from '@/models/payment-concepts'
import { ScaleService } from '@/services/scale.service'


const props = withDefaults(
  defineProps<{
    show: boolean,
    item: Scale | null
  }>(),
  {
    show: false,
    item: null
  }
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success',item:Scale): void
}>()

const loadingParams = ref<boolean>(false)
const loadingSubmit = ref<boolean>(false)
const form = ref()

const formSubmit = ref<FormCreateScale>({
  name: null,
  scale_amount: 0,
})

const clearForm = () => {
  formSubmit.value = {
    name: null,
    scale_amount: 0,
  }
}

watch(() => props.show, () => {
  if (!props.show) {
    clearForm() 
  }
})

watch(() => props.item, () => {
  if (props.item) {
    const { name, scale_amount } = props.item
    formSubmit.value = {
      name: name,
      scale_amount: scale_amount,
    }
  }
})

const create = () => {
  loadingSubmit.value = true
  ScaleService.create(formSubmit.value)
  .then(({data,success, message }) => {
    if (!success) {
      ToastService.error(message)
      return
    }
    ToastService.success('Escala registrada exitosamente')
    emit('success',data)
    emit('close')
    clearForm()
  })
  .catch(error => {
    ToastService.error(error)
    clearForm()
  }).finally(() => {
    loadingSubmit.value = false
  })
}

const update = () => {
  loadingSubmit.value = true
  if (!props.item) {
    ToastService.error('No se ha seleccionado la escala')
    return
  }
  ScaleService.update(props.item.id,formSubmit.value)
  .then(({data,success, message }) => {
    if (!success) {
      ToastService.error(message)
      return
    }
    ToastService.success('Concepto de pago actualizado exitosamente')
    emit('success',data)
    emit('close')
    clearForm()
  })
  .catch(error => {
    ToastService.error(error)
  }).finally(() => {
    loadingSubmit.value = false
  })
}

const submit = async () => {
  const { valid } = await form.value.validate()
  if (!valid) {
    toastError('Por favor, complete los campos requeridos')
    return
  }
  if (props.item) {
    update()
  } else {
    create()
  }
}
</script>

<template>
  <ModalBasic
    :visible="props.show"
    is-persistent
    width="800"
    is-scrollable
  >
    <VCard>
      <VToolbar
      >
        <VToolbarTitle>
          {{ item ? 'Editar Escala' : 'Registrar Escala' }}
        </VToolbarTitle>
        <VSpacer />
        <VBtn
          icon
          @click="emit('close')"
        >
          <VIcon>mdi-close</VIcon>
        </VBtn>
      </VToolbar>
      <VForm
        ref="form"
        fast-fail
        @submit.prevent="submit"
      >
        <VCardText class="px-4 pb-4">
          <VSkeletonLoader
            v-if="loadingParams"
            type="list-item,list-item-three-line,list-item-three-line,list-item-three-line,list-item-three-line"
          />
          <VRow v-else>
            <VCol
              cols="12"
              md="12"
            >
              <AppTextField
                v-model="formSubmit.name"
                label="Nombre"
                clearable
                :disabled="loadingSubmit"
                :rules="[requiredValidator]"
                required
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="formSubmit.scale_amount"
                label="Monto de la escala"
                step="0.1"
                type="number"
                clearable
                :disabled="loadingSubmit"
                :rules="[requiredValidator]"
                required
              />
            </VCol>
            
          </VRow>
        </VCardText>
        <VCardActions v-if="!loadingParams">
          <div class="d-flex gap-4 justify-end w-100">
            <VBtn
              class="px-4"
              color="primary"
              variant="outlined"
              :disabled="loadingSubmit"
              text="Cancelar"
              @click="emit('close')"
            />
            <VBtn
              class="px-4"
              color="primary"
              :loading="loadingSubmit"
              :disabled="loadingSubmit"
              variant="flat"
              type="submit"
            >
              {{ loadingSubmit ? 'Guardando...' : 'Guardar' }}
            </VBtn>
          </div>
        </VCardActions>
      </VForm>
    </VCard>
  </ModalBasic>
</template>
