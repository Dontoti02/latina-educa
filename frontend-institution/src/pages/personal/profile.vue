<script setup lang="ts">
import { RolEnum } from '@/common/enum/rol.enum'
import { SessionStore } from '@/common/store'
import { ToastService } from '@/common/util/toast.service'
import ChangePasswordModal from '@/components/users/modals/ChangePasswordModal.vue'
import EditUserModal from '@/components/users/modals/EditUserModal.vue'
import type { UserSubset } from '@/models/users'
import { UsersService } from '@/services/users.service'
import { ImageUtils } from '@/utils/images'
import UserProfileHeaderBG from '@images/pages/user-profile-header-bg.png'
import CompanyProfile from '@/components/JobOpportunities/private/company/profile.vue'
// Initial
const loadingPhoto = ref<boolean>(false)
const session = SessionStore()
const editModal = ref<boolean>(false)
const passwordModal = ref<boolean>(false)
const fileInput = ref<HTMLInputElement | null>(null)

const generateUser = (): UserSubset => {
  return {
    id: session.user?.role.pivot.user_id ?? 0,
    names: session.user?.names ?? '',
    email: session.user?.email ?? '',
    phone: session.user?.phone ?? '',
    rol_id: session.user?.role.id ?? 0,
    document_type: session.user?.document_type ?? '',
    document_number: session.user?.document_number ?? '',
  }
}

const userForEdit = ref<UserSubset>(generateUser())

const updateUser = (data: { id: number; phone: string; email: string, names: string, document_type: string, document_number: string }) => {
  session.set({
    ...session.get(),
    user: {
      ...session.user!,
      names: data.names,
      phone: data.phone,
      email: data.email,
      document_type: data.document_type,
      document_number: data.document_number,
    },
  })

  userForEdit.value = generateUser()
}

const openInputFile = () => {
  if (fileInput.value)
    fileInput.value.click()
}

const clearFileInput = () => {
  if (fileInput.value)
    fileInput.value.value = ''
}

const changePhoto = (action: 'change-photo' | 'delete-photo') => {
  if (action === 'change-photo') {
    openInputFile()
  }
  else {
    loadingPhoto.value = true
    UsersService.deletePhoto(session.user!.id)
      .then(() => {
        session.set({
          ...session.get(),
          user: {
            ...session.user!,
            photo: null,
          },
        })
      })
      .catch(error => {
        ToastService.error(error)
      }).finally(() => {
        loadingPhoto.value = false
      })
  }
}

const addPhoto = (event: any) => {
  if (event.target.files.length > 0) {
    const file = event.target.files[0]

    if (!file.type.startsWith('image/')) {
      ToastService.error(`El archivo ${file.name} no es una imagen válida`)

      return
    }

    const maxSizeInBytes = 2 * 1024 * 1024
    if (file.size > maxSizeInBytes) {
      ToastService.error(`El archivo ${file.name} excede el tamaño máximo permitido de 2 MB`)

      return
    }

    loadingPhoto.value = true
    UsersService.changePhoto(session.user!.id, { file })
      .then(response => {
        session.set({
          ...session.get(),
          user: {
            ...session.user!,
            photo: response.data,
          },
        })
      })
      .catch(error => {
        ToastService.error(error)
      }).finally(() => {
        loadingPhoto.value = false
        clearFileInput()
      })
  }
}

const  isRoleCompany = computed(() => {
  return session.user?.role.id === RolEnum.COMPANY_ID
})

</script>

<template>
  <div>
    <VCard>
      <div class="user-profile-header-banner">
        <img
          :src="UserProfileHeaderBG"
          alt="Banner image"
          class="rounded-top"
        >
      </div>
      <div class="user-profile-header d-flex flex-column flex-sm-row text-sm-start text-center mb-4">
        <div class="flex-shrink-0 mt-n2 mx-sm-0 mx-auto">
          <div
            class="d-flex justify-end"
            style="position: relative;width: 120px;"
          >
            <VAvatar
              size="90"
              class="mr-2 user-profile-img justify-end"
            >
              <template v-if="loadingPhoto">
                <VChip
                  variant="tonal"
                  class="w-100 h-100 d-flex align-center justify-center"
                  color="primary"
                >
                  <VProgressCircular
                    indeterminate
                    color="primary"
                    width="3"
                  />
                </VChip>
              </template>
              <template v-else>
                <img
                  v-if="session.user?.photo"
                  :src="ImageUtils.getUrlImage(session.user?.photo)"
                  alt="avatar"
                  style="width: 100%; object-fit: cover;"
                >
                <VChip
                  v-else
                  variant="tonal"
                  class="w-100 h-100 d-flex align-center justify-center"
                  color="primary"
                >
                  <VIcon
                    icon="tabler-user"
                    size="xx-large"
                  />
                </VChip>
              </template>
            </VAvatar>
            <VMenu>
              <template #activator="{ props }">
                <VBtn
                  style="position: absolute;right: 5px;bottom: 5px;"
                  v-bind="props"
                  icon="tabler-camera"
                  density="compact"
                  color="white"
                />
              </template>

              <VList>
                <VListItem
                  v-for="(item, i) in [
                    { title: 'Cambiar', action: 'change-photo' },
                    { title: 'Eliminar', action: 'delete-photo' },
                  ]"
                  :key="i"
                  class="px-0 mx-0 my-0 py-0"
                >
                  <VBtn
                    variant="text"
                    @click="changePhoto(item.action)"
                  >
                    {{ item.title }}
                  </VBtn>
                </VListItem>
              </VList>
            </VMenu>
            <input
              ref="fileInput"
              type="file"
              style="display: none;"
              @change="addPhoto"
            >
          </div>
        </div>
        <div class="flex-grow-1 mt-3 mt-sm-5">
          <div class="d-flex flex-column flex-md-row align-md-end align-sm-start align-center justify-md-space-between justify-start mx-4 gap-4">
            <div class="user-profile-info">
              <div class="text-h3 mb-2 text-capitalize">
                {{ session.user?.names.toLocaleLowerCase() }}
              </div>
              <ul class="list-inline mb-0 d-flex align-center flex-wrap justify-sm-start justify-center gap-2">
                <li class="list-inline-item d-flex gap-1 text-capitalize">
                  <VIcon
                    icon="tabler-user-check"
                    size="20"
                  /> {{ session.user?.role.name.toLowerCase() }}
                </li>
                <li class="list-inline-item d-flex gap-1">
                  <VIcon
                    icon="tabler-mail"
                    size="20"
                  /> {{ session.user?.email }}
                </li>
                <li class="list-inline-item d-flex gap-1">
                  <VIcon
                    icon="tabler-phone"
                    size="20"
                  /> {{ session.user?.phone }}
                </li>
                <li class="list-inline-item d-flex gap-1">
                  <VIcon
                    icon="tabler-id"
                    size="20"
                  /> {{ session.user?.document_type }} {{ session.user?.document_number }}
                </li>
              </ul>
            </div>
            <div class="d-flex gap-2 flex-column flex-sm-row">
              <VBtn
                class="text-none"
                text="Cambiar contraseña"
                variant="outlined"
                @click="passwordModal = true"
              />
              <VBtn
                class="text-none"
                text="Actualizar datos"
                @click="editModal = true"
              />
            </div>
          </div>
        </div>
      </div>
      <EditUserModal
        v-if="userForEdit"
        :show="editModal"
        :user="userForEdit"
        :roles="session.roles"
        @close="editModal = false"
        @update-user="updateUser"
      />
      <ChangePasswordModal
        :show="passwordModal"
        :user="session.user!"
        @close="passwordModal = false"
      />
    </VCard>
    <CompanyProfile
      v-if="isRoleCompany"
    />
  </div>
</template>

<style lang="scss">
.user-profile-header-banner {
  img {
    block-size: 200px;
    inline-size: 100%;
    object-fit: cover;
  }
}

.user-profile-header {
  margin-block-start: -1rem;

  .user-profile-img {
    border: 5px solid;
  }
}

.v-theme--light .user-profile-header .user-profile-img {
  border-color: #fff;
}

.v-theme--dark .user-profile-header .user-profile-img {
  border-color: #2f3349;
}
</style>

<route lang="yaml">
meta:
  action: read
  subject: Profile
        </route>
