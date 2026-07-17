<script setup lang="ts">
import { requiredValidator } from '@/@core/utils/validators'
import { SessionStore } from '@/common/store'
import modalService from '@/common/util/modal.service'
import { ToastService } from '@/common/util/toast.service'
import ChangePasswordModal from '@/components/users/modals/ChangePasswordModal.vue'
import CreateUserModal from '@/components/users/modals/CreateUserModal.vue'
import EditUserModal from '@/components/users/modals/EditUserModal.vue'
import type { UserRole } from '@/models/role'
import type { FormGetUsers, UserList, UserModel } from '@/models/users'
import { RoleService } from '@/services/rol.service'
import { UsersService } from '@/services/users.service'
import { ImageUtils } from '@/utils/images'
import BulbLightImg from '@images/illustrations/bulb-light.png'
import PencilRocketImg from '@images/illustrations/pencil-rocket.png'
import { VDataTableServer } from 'vuetify/labs/VDataTable'
import { VSkeletonLoader } from 'vuetify/lib/labs/components.mjs'

// Initial
const session = SessionStore()

const loadingFilters = ref(false)
const loadingData = ref(false)
const loadingActive = ref<number[]>([])
const loadingDelete = ref<number[]>([])

const modalCreateUser = ref<boolean>(false)
const modalEditUser = ref<boolean>(false)
const modalChangePassword = ref<boolean>(false)

const roles = ref<Array<UserRole>>([])
const users = ref<UserList['users']>([])
const currentUser = ref<UserModel>()
const totalUsers = ref(0)

const headers = [
  { title: 'Información personal', key: 'personal-information', align: 'start', sortable: false, width: '90%' },
  { title: 'Acciones', key: 'actions', align: 'center', sortable: false, width: '10%' },
]

const colors = [
  'primary',
  'info',
  'success',
  'warning',
  'error',
  'secondary',
]

const search = ref('')
const searchTime = ref()

const rolesTimer = ref()

const form = ref<FormGetUsers>({
  search: '',
  page: 1,
  rol_ids: [],
  size: 10,
})

// Get data
const getFilters = () => {
  loadingFilters.value = true
  RoleService.getList()
    .then((response) => {
      roles.value = response.data

      form.value.rol_ids = response.data.map(role => role.id)
    })
    .catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loadingFilters.value = false
    })
}

onBeforeMount(() => {
  getFilters()
})

const getUsers = () => {
  loadingData.value = true
  UsersService.getUsers(form.value)
    .then(response => {
      form.value.page = response.data.page
      form.value.size = response.data.size
      totalUsers.value = response.data.total
      users.value = response.data.users.map(user => {
        return {
          ...user,
          is_active: Boolean(user.is_active),
        }
      })
    })
    .catch(error => {
      console.error(error)
    }).finally(() => {
      loadingData.value = false
    })
}

// Actions
const updateUser = (data: { id: number; phone: string; email: string, names: string, document_type: string, document_number: string }) => {
  const user = users.value.find(u => u.id === data.id)
  if (user) {
    user.names = data.names
    user.phone = data.phone
    user.email = data.email
    user.document_type = data.document_type
    user.document_number = data.document_number
  }
}

const toggleActivate = (value: boolean, id: number) => {
  loadingActive.value = [...loadingActive.value, id]
  UsersService.toggleActivate(id)
    .then(() => {
      const user = users.value.find(u => u.id === id)
      if (user)
        user.is_active = value
    })
    .catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loadingActive.value = loadingActive.value.filter(i => i !== id)
    })
}

const deleteUser = async (user: UserModel) => {
  const confirm = await modalService.confirmation({
    title: 'Eliminar usuario',
    content: `¿Está seguro que desea eliminar el usuario ${user.names}?`,
  })

  if (!confirm) return
  
  loadingDelete.value = [...loadingDelete.value, user.id]
  UsersService.delete(user.id)
    .then(() => {
      users.value = users.value.filter(u => u.id !== user.id)
    })
    .catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loadingDelete.value = loadingDelete.value.filter(i => i !== user.id)
    })
}

// Computed
const formValid = computed(() => {
  return form.value.rol_ids.length > 0
})

// Watchers
watch(() => form.value.rol_ids, () => {
  if (formValid.value && loadingFilters.value === false){
    clearTimeout(rolesTimer.value)
    rolesTimer.value = setTimeout(() => {
      getUsers()
    }, 500)
  }
})

watch(search, () => {
  clearTimeout(searchTime.value)
  searchTime.value = setTimeout(() => {
    form.value.search = search.value
  }, 500)
})

// Utils
const getRolName = (rolId: number) => {
  return roles.value.find(role => role.id === rolId)?.name.toLowerCase()
}

const isActivateLoading = (id: number) => {
  return loadingActive.value.includes(id)
}

const getColorAvatar = (rolId: number) => {
  const roleIndex = roles.value.findIndex(role => role.id === rolId)

  return colors[roleIndex % colors.length]
}
</script>

<template>
  <div>
    <div
      v-if="loadingFilters"
      class="mt-4 w-100 d-flex justify-center"
    >
      <VRow>
        <VCol cols="12">
          <VSkeletonLoader
            class="w-100 gap-4 "
            type="image"
          />
        </VCol>
        <VCol cols="12">
          <VSkeletonLoader
            class="w-100 gap-4 "
            type="list-item,list-item,article,article,article"
          />
        </VCol>
      </VRow>
    </div>
    <div v-else>
      <VCard>
        <VRow class="">
          <VCol
            cols="2"
            class="pl-8 pt-6 pb-0"
          >
            <img
              :src="BulbLightImg"
              height="100"
            >
          </VCol>
          <VCol
            cols="8"
            class="pt-6 px-8 d-flex text-center justify-center align-center flex-column"
          >
            <VRow
              align="center"
              justify="center"
              class="mx-0 my-0 w-100"
            >
              <VCol
                cols="12"
                class="py-0"
              >
                <h1>Usuarios</h1>
                <p class="my-0">
                  En este espacio se listan todos los usuarios de la plataforma según su rol y periodo académco.
                </p>
              </VCol>
              <VCol
                cols="12"
                md="6"
                class="d-flex gap-2 align-center"
              >
                <VTextField
                  v-model="search"
                  placeholder="Buscar usuario"
                  clearable
                  density="compact"
                />
                <VBtn
                  color="primary"
                  icon="tabler-search"
                  rounded="sm"
                  density="comfortable"
                  @click="getUsers"
                />
              </VCol>
            </VRow>
          </VCol>
          <VCol
            cols="2"
            class=" pb-0 d-flex justify-end align-end"
          >
            <img
              :src="PencilRocketImg"
              height="140"
            >
          </VCol>
        </VRow>
      </VCard>
      <VSpacer />
      <VCard
        flat
        class="mt-6 py-4"
      >
        <VRow justify="space-between" class="mx-0">
          <!-- Filters -->
          <VCol
            cols="12"
            md="6"
          >
            <VSelect
              v-model="form.rol_ids"
              item-value="id"
              item-title="name"
              label="Rol"
              name="select"
              multiple
              single-line
              density="compact"
              :items="roles"
              :rules="[requiredValidator]"
            />
          </VCol>
        
          <VCol
            cols="12"
            md="4"
            class="d-flex justify-end align-end"
          >
            <VBtn
              class="text-none"
              text="Agregar usuario"
              @click="modalCreateUser = true"
            />
          </VCol>
        </VRow>
        <VRow class="mx-0">
          <template v-if="formValid">
            <VCol cols="12">
              <VDataTableServer
                v-model:items-per-page="form.size"
                v-model:page="form.page"
                class="table-data-users"
                :headers="headers"
                :items="users"
                :items-length="totalUsers"
                :loading="loadingData"
                :search="form.search"
                hide-default-header
                @update:options="getUsers"
              >
                <template #item="{ item }">
                  <tr>
                    <td class="py-2">
                      <div class="d-flex align-center gap-2">
                        <VAvatar
                          size="50"
                          class="mr-2"
                        >
                          <img
                            v-if="item.photo && item.photo !== ''"
                            :src="ImageUtils.getUrlImage(item.photo)"
                            alt="avatar"
                            style="width: 100%; object-fit: cover;"
                          >
                          <VChip
                            v-else
                            variant="tonal"
                            class="w-100 h-100 d-flex align-center justify-center"
                            :color="getColorAvatar(item.rol_id)"
                          >
                            <VIcon
                              icon="tabler-user"
                              size="x-large"
                            />
                          </VChip>
                        </VAvatar>
                        <div>
                          <div class="text-h6">
                            {{ item.names }}
                          </div>
                          <div class="text-body-2 mt-1">
                            {{ item.email }}
                          </div>
                          <div class="text-body-2 text-caption">
                            {{ item.document_type }}: {{ item.document_number }}
                          </div>
                          <div class="text-body-2 text-capitalize">
                            {{ getRolName(item.rol_id) }}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div v-if="item.id !== session.user?.id" class="d-flex justify-end align-center gap-8">
                        <v-tooltip :text="'Modificar usuario'">
                          <template v-slot:activator="{ props }">
                            <VBtn
                              v-bind="props"
                              variant="tonal"
                              density="compact"
                              size="large"
                              icon="tabler-pencil"
                              @click="currentUser = item; modalEditUser = true"
                            />
                          </template>
                        </v-tooltip>

                        <v-tooltip :text="'Cambiar contraseña'">
                          <template v-slot:activator="{ props }">
                            <VBtn
                              v-bind="props"
                              variant="tonal"
                              density="compact"
                              size="large"
                              icon="tabler-key"
                              @click="currentUser = item; modalChangePassword = true"
                            />
                          </template>
                        </v-tooltip>
                        
                        <v-tooltip :text=" item.is_active ? 'Deshabilitar' : 'Habilitar'">
                          <template v-slot:activator="{ props }">
                            <VSwitch
                              v-model="item.is_active"
                              :loading="isActivateLoading(item.id)"
                              @update:model-value="toggleActivate($event, item.id)"
                              v-bind="props"
                            >
                              <template #loader>
                                <VProgressCircular
                                  indeterminate
                                  size="16"
                                  width="5"
                                  color="success"
                                />
                              </template>
                            </VSwitch>
                          </template>
                        </v-tooltip>

                        <v-tooltip :text="'Eliminar usuario'">
                          <template v-slot:activator="{ props }">
                            <VBtn
                              v-bind="props"
                              variant="tonal"
                              density="compact"
                              size="large"
                              icon="tabler-trash"
                              color="error"
                              :loading="loadingDelete.includes(item.id)"
                              @click="deleteUser(item)"
                            />
                          </template>
                        </v-tooltip>
                      </div>
                    </td>
                  </tr>
                </template>
              </VDataTableServer>
            </VCol>
          </template>
          <template v-else>
            <VCol
              cols="12"
              class="text-center py-6"
            >
              Seleccione al menos un rol y un periodo académico
            </VCol>
          </template>
        </VRow>
      </VCard>
    </div>
    <CreateUserModal
      :show="modalCreateUser"
      @close="modalCreateUser = false"
      @user-created="getUsers"
    />
    <EditUserModal
      v-if="currentUser"
      :user="currentUser"
      :roles="roles"
      :show="modalEditUser"
      @close="modalEditUser = false"
      @update-user="updateUser"
    />
    <ChangePasswordModal
      v-if="currentUser"
      :user="currentUser"
      :show="modalChangePassword"
      @close="modalChangePassword = false"
    />
  </div>
</template>

<style lang="scss">
.table-data-users {
  .v-data-table__thead {
    display: none !important;
  }
}
</style>

<route lang="yaml">
meta:
  action: read
  subject: UsersList
          </route>
