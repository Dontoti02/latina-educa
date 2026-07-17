<template>
    <AppContent>
        <template #title>
            <div class="py-2">
                <v-icon>mdi-account-multiple-outline</v-icon>&nbsp;Usuarios
            </div>
        </template>
        <div>
          <div
            v-if="loadingFilters"
            class="mt-4 w-100 d-flex justify-center"
          >
            <v-row>
              <v-col cols="12">
                <v-skeleton-loader
                  class="w-100 gap-4 "
                  type="list-item,list-item,article,article,article"
                />
              </v-col>
            </v-row>
          </div>
          <div v-else>
            <v-card
              flat
              class="py-4"
            >
              <v-row class="mx-0" justify="space-between">
                <v-col
                  cols="12"
                  md="6"
                >
                  <v-select
                    v-model="form.rol_ids"
                    item-value="id"
                    item-title="name"
                    label="Rol"
                    name="select"
                    multiple
                    variant="solo"
                    hide-details="auto"
                    :items="roles"
                  />
                </v-col>
                <v-col
                  cols="12"
                  md="4"
                  class="d-flex align-end justify-end"
                >
                  <v-btn
                    class="text-none"
                    color="primary"
                    variant="tonal"
                    text="Agregar usuario"
                    @click="modalCreateUser = true"
                  />
                </v-col>
                <v-col cols="12">
                  <v-data-table-server
                    v-model:items-per-page="form.size"
                    v-model:page="form.page"
                    class="table-data-users mt-2"
                    :headers="(headers as any)"
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
                            <v-avatar
                              size="50"
                              class="mr-2"
                            >
                              <img
                                v-if="item.photo && item.photo !== ''"
                                :src="getUrlImage(item.photo)"
                                alt="avatar"
                                style="width: 100%; object-fit: cover;"
                              >
                              <v-chip
                                v-else
                                variant="tonal"
                                class="w-100 h-100 d-flex align-center justify-center"
                                :color="getColorAvatar(item.rol_id)"
                              >
                                <v-icon
                                  icon="mdi-account-outline"
                                  size="x-large"
                                />
                              </v-chip>
                            </v-avatar>
                            <div>
                              <div class="text-h6">
                                {{ item.names }}
                              </div>
                              <div class="text-body-2 mt-1">
                                {{ item.email }}
                              </div>
                              <div class="text-body-2 text-capitalize">
                                {{ getRolName(item.rol_id) }}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div 
                            v-if="session.roles[0].pivot.user_id != item.id"
                            class="d-flex justify-end align-center" style="gap: 1rem;"
                          >
                            <v-btn
                              variant="tonal"
                              color="primary"
                              density="compact"
                              size="large"
                              icon="mdi-pencil"
                              @click="currentUser = item; modalCreateUser = true"
                            />
                            <v-btn
                              variant="tonal"
                              color="warning"
                              density="compact"
                              size="large"
                              icon="mdi-key"
                              @click="currentUser = item; modalChangePassword = true"
                            />
                            <v-switch
                              v-model="item.is_active"
                              color="success"
                              hide-details="auto"
                              :loading="isActivateLoading(item.id)"
                              @update:model-value="toggleActivate($event as boolean, item.id)"
                            >
                              <template #loader>
                                <v-progress-circular
                                  indeterminate
                                  size="16"
                                  width="5"
                                />
                              </template>
                            </v-switch>
                            <v-btn
                              variant="tonal"
                              density="compact"
                              size="large"
                              icon="mdi-trash-can-outline"
                              color="error"
                              :loading="loadingDelete.includes(item.id)"
                              @click="deleteUser(item)"
                            />
                          </div>
                        </td>
                      </tr>
                    </template>
                  </v-data-table-server>
                </v-col>
              </v-row>
            </v-card>
          </div>
          <MCreateUser
            :show="modalCreateUser"
            :roles="roles"
            :user="currentUser"
            @close="modalCreateUser = false;currentUser = null"
            @user-created="getUsers"
          />
          <MChangePassword
            v-if="currentUser"
            :user="currentUser"
            :show="modalChangePassword"
            @close="modalChangePassword = false;currentUser = null"
          /> 
        </div>
    </AppContent>
</template>
<script setup lang="ts">
import AppContent from '@/modules/app/pages/AppContent.vue';
import { RoleDTO } from '@/modules/auth/dto';
import { onBeforeMount, ref, watch } from 'vue'
import { UserModel, UsersDto, UsersFormDto } from '../dto/user.dto';
import UserService from '../services/user.service';
import MCreateUser from './MCreateUser.vue';
import MChangePassword from './MChangePassword.vue';
import { getUrlImage } from '@/common/util/global'
import { SessionStore } from '@/common/store';
import modalService from '@/common/util/modal.service';
import { ToastService } from '@/common/util/toast.service';

// Initial
const session = SessionStore()

const loadingFilters = ref(false)
const loadingData = ref(false)
const loadingActive = ref<number[]>([])
const loadingDelete = ref<number[]>([])

const modalCreateUser = ref<boolean>(false)
const modalChangePassword = ref<boolean>(false)

const roles = ref<Array<RoleDTO>>([])
const users = ref<UsersDto['users']>([])
const currentUser = ref<UserModel | null>(null)
const totalUsers = ref(0)

const headers = ref([
  { title: 'Información personal', key: 'personal-information', align: 'start', sortable: false},
  { title: 'Acciones', key: 'actions', align: 'center', sortable: false},
])

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

const form = ref<UsersFormDto>({
  search: '',
  page: 1,
  rol_ids: [],
  size: 10,
})

// Get data
const getFilters = () => {
  loadingFilters.value = true
  UserService.getFilters()
    .then((response) => {
      roles.value = response.data.roles

      form.value.rol_ids = response.data.roles.map(role => role.id)
    }).finally(() => {
      loadingFilters.value = false
    })
}

onBeforeMount(() => {
  getFilters()
})

const getUsers = () => {
  loadingData.value = true
  users.value = []
  UserService.getUsers(form.value)
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

const toggleActivate = (value: boolean, id: number) => {
  loadingActive.value = [...loadingActive.value, id]
  UserService.toggleActivate(id)
    .then(() => {
      const user = users.value.find(u => u.id === id)
      if (user)
        user.is_active = value
    }).catch(() => {
        const user = users.value.find(u => u.id === id)
        if (user)
            user.is_active = !value    
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
  UserService.delete(user.id)
    .then(() => {
      users.value = users.value.filter(u => u.id !== user.id)
    })
    .catch(error => {
      ToastService.error(error)
    }).finally(() => {
      loadingDelete.value = loadingDelete.value.filter(i => i !== user.id)
    })
}

// Watchers
watch(() => form.value.rol_ids, (newValue, oldValue) => {
  if(oldValue.length !== 0)  
    getUsers()
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
<style lang="scss">
.table-data-users {
  .v-data-table__thead {
    display: none !important;
  }
}
</style>
