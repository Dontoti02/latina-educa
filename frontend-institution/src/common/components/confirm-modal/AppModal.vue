<script setup lang="ts">
import DialogScaffold from '@/common/components/confirm-modal/DialogScaffold.vue'
import { onMounted, reactive } from 'vue'

import emitter from '@/common/util/emitter.service'
import { ModalActions, type ModalArgs } from '@/common/util/modal.service'
import { requiredValidator } from '@/@core/utils/validators'
import { VForm } from 'vuetify/lib/components/index.mjs'

const initialState: {
  open: boolean
  modal: ModalArgs | null
} = {
  open: false,
  modal: null,
}

const state = reactive({
  ...initialState,
})

const eventBtn = (confirm: boolean) => {
  state.open = false
  const id = state.modal!.id
  if (id) {
    console.log('Modal ID:', id)
    if (confirm) {
      onSubmit()
    }
    emitter.emit('modalClose', {confirm,id})
    
  }
}


const show = (args: ModalArgs) => {
  if (state.open)
    eventBtn(false)
  state.modal = args
  state.open = true
}

const onSubmit = () => {
  if (!state.modal?.input) return
  if (formRef.value && formRef.value.validate()) {
    const input = form.value.input
    if (input !== null) {
      emitter.emit('modalInput', {value : input})
      resetForm()
    }
  }
}
const resetForm = () => {
  if (!state.modal?.input)
    return
  form.value.input = null
  if (formRef.value)
    formRef.value.reset()
}


onMounted(() => {
  emitter.on('modalOpen', event => {
    show(event)
    resetForm()
  })
})

const containHtml = (str: string) => {
  const regex = /<\/?[a-z][\s\S]*>/i
  return regex.test(str)
}

const formRef = ref<InstanceType<typeof VForm> | null>(null)
const form = ref<{
  input : string | null 
}>({
  input: null,
})


const formValid = ref(false);
let debounceTimeout: ReturnType<typeof setTimeout> | null = null
watch(
  form,
  () => {
    if (debounceTimeout) clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(async () => {
      if (formRef.value) {
        const { valid } = await formRef.value.validate()
        formValid.value = valid
      }
    }, 100)
  },
  { deep: true }
)


const disabledBtn = computed(() => {
  if (!state.modal?.input)
    return false
  if (!state.modal.input.required)
    return false
  return !formValid.value
})

</script>

<template>
  <VDialog
    v-model="state.open"
    persistent
    :width="state.modal?.config?.width || 350"
  >
    <DialogScaffold @close="eventBtn(false)">
      <template #title>
        {{ state.modal!.title }}
      </template>
      <div style="color: var(--primary-sem-grey-color);">
        <template v-if="containHtml(state.modal!.content)">
          <div v-html="state.modal!.content" />
        </template>
        <template v-else>
          {{ state.modal!.content }}
        </template>
      </div>
      <VCard v-if="state.modal?.input" elevation-0>
        <VCardText>
          <VForm ref="formRef">
            <VTextField
              v-model="form.input"
              :label="state.modal.input.label"
              :type="state.modal.input.type"
              :rules="[state.modal.input.required ? requiredValidator: () => true]"
              :placeholder="state.modal.input.placeholder"
              variant="outlined"
              :autofocus="true"
            />
          </VForm>
        </VCardText>
      </VCard>
      <template #actions>
        <template v-if="state.modal!.actions === ModalActions.CONFIRMATION">
          <VBtn
            variant="text"
            color="primary"
            @click="eventBtn(false)"
          >
            Cancelar
          </VBtn>
          <VBtn
            variant="flat"
            color="primary"
            @click="eventBtn(true)"
            :disabled="disabledBtn"
          >
            Aceptar
          </VBtn>
        </template>
        <template v-else>
          <VBtn
            variant="text"
            color="primary"
            @click="eventBtn(false)"
          >
            Cerrar
          </VBtn>
        </template>
      </template>
    </DialogScaffold>
  </VDialog>
</template>

<style></style>
