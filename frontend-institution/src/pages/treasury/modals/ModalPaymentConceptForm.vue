<script setup lang="ts">
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'
import { requiredValidator } from '@/@core/utils/validators'
import ModalBasic from '@/common/components/Modal.vue'
import { toastError, ToastService } from '@/common/util/toast.service'
import { FormCreatePaymentConcept, PaymentConcept } from '@/models/payment-concepts'
import { DenominationService } from '@/services/denomination.service'
import { Denomination } from '@/models/denomination'
import { PaymentConceptsService } from '@/services/payment-concepts.service'
import { PaymentConceptEnum } from '@/common/enum/payment-concept.enum'

const props = withDefaults(
  defineProps<{
    show: boolean,
    item: PaymentConcept | null,
    igv: number
  }>(),
  {
    show: false,
    item: null
  }
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success',item:PaymentConcept): void
}>()

const loadingParams = ref<boolean>(false)
const loadingSubmit = ref<boolean>(false)
const form = ref()
const denominationList = ref<Denomination[]>([])

const formSubmit = ref<FormCreatePaymentConcept>({
  name: null,
  denominationId: 1,
  gross_amount: 0,
  igv_amount: 0,
  net_amount: 0,
  maxQuotas: 1,
  canBePaidInQuotas: false,
  includeInEnrollment: false,
})

const setup = () => {
  loadingParams.value = true
  DenominationService.all()
    .then(({data}) => {
      denominationList.value = data
    })
    .catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loadingParams.value = false
    })
}

const clearForm = () => {
  formSubmit.value = {
    name: null,
    denominationId: 1,
    gross_amount: 0,
    igv_amount: 0,
    net_amount: 0,
    maxQuotas: 1,
    canBePaidInQuotas: false,
    includeInEnrollment: false,
  }
}

watch(() => props.show, () => {
  if (props.show) {
    setup()
  } else  { 
    clearForm()
  }
})

watch(() => props.item, () => {
  if (props.item) {
    const { name, denominationId, gross_amount,igv_amount,net_amount, maxQuotas, canBePaidInQuotas, includeInEnrollment } = props.item
    formSubmit.value = {
      name: name,
      denominationId: denominationId,
      gross_amount: gross_amount,
      igv_amount: igv_amount,
      net_amount: net_amount,
      maxQuotas: maxQuotas,
      canBePaidInQuotas: canBePaidInQuotas,
      includeInEnrollment: includeInEnrollment,
    }
  }
})

watch(() => formSubmit.value.gross_amount, (value) => {
  const grossAmount = Number(value)
  const igv = Number(props.igv)
  formSubmit.value.igv_amount = parseFloat((grossAmount * igv).toFixed(4))
  formSubmit.value.net_amount = parseFloat((grossAmount + formSubmit.value.igv_amount).toFixed(4))
})

const create = () => {
  loadingSubmit.value = true
  PaymentConceptsService.create({
    ...formSubmit.value
  })
  .then(({data,success, message }) => {
    if (!success) {
      ToastService.error(message)
      return
    }
    ToastService.success('Concepto de pago registrado exitosamente')
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
    ToastService.error('No se ha seleccionado el concepto de pago')
    return
  }
  PaymentConceptsService.update(props.item.id,{
    ...formSubmit.value,
    code : props.item.code 
  })
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
          {{ item ? 'Editar concepto de pago' : 'Registrar concepto de pago' }}
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
                v-model="formSubmit.gross_amount"
                label="Monto Bruto"
                step="0.1"
                type="number"
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
                v-model="formSubmit.igv_amount"
                :label="'Monto IGV (' + props.igv * 100 + '%)'"
                step="0.1"
                type="number"
                :disabled="loadingSubmit"
                :rules="[requiredValidator]"
                readonly
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="formSubmit.net_amount"
                label="Monto Neto"
                step="0.1"
                type="number"
                :disabled="loadingSubmit"
                :rules="[requiredValidator]"
                required
                readonly
              />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
              <VLabel class="mb-1 text-body-2 text-high-emphasis">
                  Denominación
                </VLabel>
                <VSelect
                  v-model="formSubmit.denominationId"
                  item-value="id"
                  item-title="name"
                  :items="denominationList"
                  :disabled="loadingSubmit"
                  :rules="[requiredValidator]"
                  required
                />
            </VCol>
            <VCol
              cols="12"
              md="6"
            >
            <v-container fluid>
              <v-checkbox
                v-model="formSubmit.canBePaidInQuotas"
                :label="`Permitir pago en cuotas`"
                :disabled="loadingSubmit"
                @change="formSubmit.maxQuotas = 1"
              ></v-checkbox>
            </v-container>
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <AppTextField
                v-model="formSubmit.maxQuotas"
                label="Número máximo de cuotas permitidas"
                type="number"
                clearable
                min="1"
                :disabled="loadingSubmit || !formSubmit.canBePaidInQuotas"
                :rules="[requiredValidator]"
              />
            </VCol>

            <VCol
              cols="12"
              md="6"
            >
              <v-container fluid>
                <v-checkbox
                  v-model="formSubmit.includeInEnrollment"
                  :label="`Incluir en matrícula`"
                  :disabled="loadingSubmit || item?.code === PaymentConceptEnum.enrollment || item?.code === PaymentConceptEnum.monthly"
                  :readonly="item?.code === PaymentConceptEnum.enrollment || item?.code === PaymentConceptEnum.monthly"
                ></v-checkbox>
                <v-tooltip activator="parent" location="bottom">
                    <span>
                      Deshabilitado para conceptos de matrícula ({{  PaymentConceptEnum.enrollment }}) y pensiones ({{  PaymentConceptEnum.monthly }})
                    </span>
                  </v-tooltip>
              </v-container>
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
