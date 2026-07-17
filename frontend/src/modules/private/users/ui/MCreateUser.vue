<template>
    <ModalBasic
      :show="props.show"
      is-persistent
      :width="1000"
      is-scrollable
    >
      <VCard>
        <VToolbar dark color="var(--bg-toolbar)" class="text-white">
          <VToolbarTitle>{{ user ? 'Actualización' : 'Creación' }} de usuario</VToolbarTitle>
          <VSpacer />
          <VBtn
            icon
            @click="emit('close')"
          >
            <VIcon>mdi-close</VIcon>
          </VBtn>
        </VToolbar>
        <VCardText class="px-4 pb-4">
          <VSkeletonLoader
            v-if="loadingParams"
            type="list-item,list-item-three-line,list-item-three-line,list-item-three-line,list-item-three-line"
          />
          <VForm
            v-else
            ref="form"
          >
            <VRow>
              <VCol
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="formSubmit.names"
                  hide-details="auto"
                  label="Nombres"
                  variant="solo"
                  :disabled="loadingSubmit"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol
                cols="12"
                md="6"
              >
                <v-text-field
                  v-model="formSubmit.email"
                  label="Email"
                  hide-details="auto"
                  variant="solo"
                  :disabled="loadingSubmit"
                  :rules="[requiredValidator, emailValidator]"
                />
              </VCol>
              <VCol
                v-if="user === null"
                cols="12"
                md="6"
              >
              <v-text-field
                  v-model="formSubmit.password"
                  label="Contraseña"
                  :type="showPass ? 'text' : 'password'"
                  :disabled="loadingSubmit"
                  variant="solo"
                  hide-details="auto"
                  :rules="[requiredValidator, minLengthValidator(formSubmit.password, 8)]"
                  :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                  @click:append="showPass = !showPass"
                ></v-text-field>
              </VCol>
              <VCol
                cols="12"
                md="6"
                class="d-flex flex-column justify-end"
              >
                <VSelect
                  v-model="formSubmit.rol_ids"
                  item-value="id"
                  item-title="name"
                  label="Rol"
                  hide-details="auto"
                  multiple
                  :items="roles"
                  :disabled="loadingSubmit"
                  variant="solo"
                  :rules="[requiredValidator]"
                />
              </VCol>
            </VRow>
          </VForm>
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
              :text="user ? 'Actualizar' : 'Agregar'"
              :loading="loadingSubmit"
              variant="flat"
              @click="submit"
            />
          </div>
        </VCardActions>
      </VCard>
    </ModalBasic>
  </template>
<script setup lang="ts">
import { emailValidator, requiredValidator, minLengthValidator } from '@/common/util/validators'
import ModalBasic from '@/common/components/Modal.vue'
import { ref, watch } from 'vue'
import { RoleDTO } from '@/modules/auth/dto';
import UserService from '@/modules/private/users/services/user.service'
import { CreateUserFormDto, UserModel } from '../dto/user.dto';

// Initial
const props = withDefaults(
  defineProps<{
    user: UserModel | null
    roles: RoleDTO[]
    show: boolean
  }>(),
  {
    show: false,
  },
)

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'userCreated'): void
}>()

const loadingParams = ref<boolean>(false)
const loadingSubmit = ref<boolean>(false)
const form = ref()
const showPass = ref<boolean>(false)

const formSubmit = ref<CreateUserFormDto>({
  email: '',
  names: '',
  password: '',
  rol_ids: [],
})

// Methods
const setup = () => {
  if(props.user) {
    formSubmit.value = {
      email: props.user.email,
      names: props.user.names,
      password: '',
      rol_ids: props.user.rol_ids,
    }
  } else {
    formSubmit.value = {
      email: '',
      names: '',
      password: '',
      rol_ids: props.roles.length > 0 ? [props.roles[0].id] : [],
    }
  }
}

const clearForm = () => {
  formSubmit.value = {
    email: '',
    names: '',
    password: '',
    rol_ids: props.roles.length > 0 ? [props.roles[0].id] : [],
  }
}

watch(() => props.show, () => {
  if (props.show)
    setup()
  else clearForm()
})

// Actions
const submit = async () => {
  const { valid } = await form.value.validate()

  if (!valid)
    return

  loadingSubmit.value = true
  if(props.user) {
    update()
  } else {
    create()
  }
}

const create = () => {
  UserService.createUser(formSubmit.value)
    .then(() => {
      emit('userCreated')
      emit('close')
    }).finally(() => {
      loadingSubmit.value = false
    })
}

const update = () => {
  UserService.updateUser(props.user!.id, {
    email: formSubmit.value.email,
    names: formSubmit.value.names,
    rol_ids: formSubmit.value.rol_ids,
  })
    .then(() => {
      emit('userCreated')
      emit('close')
    }).finally(() => {
      loadingSubmit.value = false
    })
}
</script>


