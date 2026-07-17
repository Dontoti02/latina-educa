<template>
    <AppContent>
        <template #title>
            <div class="py-2">
                <v-icon>mdi-account-outline</v-icon>&nbsp;Mi perfil
            </div>
        </template>
        <v-row class="mt-2">
            <v-col cols="12" lg="3" md="4" sm="5" >
                <v-card class="h-100" >
                    <v-img
                        color="surface-variant"
                        height="150"
                        :src="BackgroundProfile"
                        cover
                    />
                    <v-card-text style="position: relative;">
                        <div 
                            class="d-flex flex-column justify-center align-center"
                            style="position: absolute;top: -40px; left: 0;width: 100%;"
                        >
                            <div
                                class="d-flex justify-end"
                                style="position: relative;"
                            >
                                <v-avatar
                                    size="100"
                                    class="mr-2 user-profile-img justify-end"
                                >
                                    <template v-if="loadingPhoto">
                                        <v-chip
                                            variant="tonal"
                                            class="w-100 h-100 d-flex align-center justify-center"
                                            color="primary"
                                        >
                                            <v-progress-circular
                                                indeterminate
                                                color="primary"
                                                width="3"
                                            />
                                        </v-chip>
                                    </template>
                                    <template v-else>
                                        <img
                                            v-if="sessionStore.user?.photo && sessionStore.user?.photo.length > 0"
                                            :src="getUrlImage(sessionStore.user?.photo)"
                                            alt="avatar"
                                            style="width: 100%; object-fit: cover;"
                                        >
                                        <v-chip
                                            v-else
                                            variant="tonal"
                                            class="w-100 h-100 d-flex align-center justify-center"
                                            color="primary"
                                        >
                                            <v-icon
                                                icon="mdi-account-tie"
                                                size="xxx-large"
                                            />
                                        </v-chip>
                                    </template>
                                </v-avatar>
                                <v-menu>
                                    <template #activator="{ props }">
                                    <v-btn
                                        style="position: absolute;right: 5px;bottom: 5px;"
                                        v-bind="props"
                                        icon="mdi-camera-outline"
                                        density="comfortable"
                                        color="white"
                                        size="small"
                                    />
                                    </template>
        
                                    <v-list>
                                    <v-list-item
                                        v-for="(item, i) in [
                                        { title: 'Cambiar', action: BtnAction.ChangePhoto },
                                        { title: 'Eliminar', action: BtnAction.DeletePhoto },
                                        ]"
                                        :key="i"
                                        class="px-0 mx-0 my-0 py-0"
                                    >
                                        <v-btn
                                            class="text-none"
                                            variant="text"
                                            :text="item.title"
                                            @click="changePhoto(item.action)"
                                        />
                                    </v-list-item>
                                    </v-list>
                                </v-menu>
                                <input
                                    ref="fileInput"
                                    type="file"
                                    style="display: none;"
                                    @change="addPhoto"
                                >
                            </div>
                            <div class="text-h6">
                                {{ sessionStore.user?.names }}
                            </div>
                        </div>
                        <div style="min-height: 100px;"></div>
                    </v-card-text>
                </v-card>
            </v-col>
            <v-col cols="12" lg="9" md="8" sm="7" >
                <v-card class="h-100">
                    <v-form ref="form" class="d-flex flex-column h-100" @submit.prevent="submit">
                        <v-card-text>
                            <v-row>
                                <v-col cols="12">
                                    <v-text-field
                                        v-model="userInfo.names"
                                        label="Nombres"
                                        variant="solo"
                                        placeholder="Ingrese sus nombres completos..."
                                        hide-details="auto"
                                        type="text"
                                        clearable
                                        :rules="[requiredValidator, maxLengthValidator(userInfo.names, 150)]"
                                    />
                                </v-col>
                                <v-col cols="12">
                                    <v-text-field
                                        v-model="userInfo.email"
                                        label="Email"
                                        variant="solo"
                                        placeholder="Ingrese su email..."
                                        hide-details="auto"
                                        type="email"
                                        clearable
                                        :rules="[requiredValidator, emailValidator]"
                                    />
                                </v-col>
                                <v-col cols="12">
                                </v-col>
                            </v-row>
                        </v-card-text>
                        <v-card-actions class="d-flex justify-space-between mx-2 my-2">
                        <v-btn
                            color="primary"
                            variant="tonal"
                            text="Cambiar contraseña"
                            class="text-none"
                            @click="changePasswordModal = true"
                            />
                            <div>
                                <v-btn
                                color="primary"
                                variant="outlined"
                                text="Reestablecer datos"
                                class="text-none"
                                :disabled="!valuesChanged"
                                @click="resetInfo"
                            />
                            <v-btn
                                color="primary"
                                variant="flat"
                                text="Actualizar datos"
                                class="text-none"
                                type="submit"
                                :disabled="!valuesChanged"
                                :loading="loadingSubmit"
                                />
                            </div>
                        </v-card-actions>
                    </v-form>
                </v-card>
            </v-col>
        </v-row>
        <MFormInfo
            v-model:show="changePasswordModal"
            titleModal="Cambio de contraseña"
            @close="changePasswordModal = false"
        />
    </AppContent>
</template>
<script setup lang="ts">
import { SessionStore } from '@/common/store';
import { ToastService } from '@/common/util/toast.service';
import AppContent from '@/modules/app/pages/AppContent.vue';
import BackgroundProfile from '@/assets/images/profile/background-profile.jpg'
import { computed, ref } from 'vue';
import { UserDTO } from '@/modules/auth/dto';
import { requiredValidator, emailValidator, maxLengthValidator } from '@/common/util/validators';
import ProfileService from '@/modules/private/profile/services/profile.service';
import MFormInfo from '@/modules/private/profile/ui/MFormInfo.vue';
import { getUrlImage } from '@/common/util/global'

enum BtnAction  {
    ChangePhoto = 'change-photo',
    DeletePhoto = 'delete-photo'
}

// Initial
const sessionStore = SessionStore()
const fileInput = ref()
const form = ref()

const loadingPhoto = ref(false)
const loadingSubmit = ref(false)
const userInfo = ref<UserDTO>(JSON.parse(JSON.stringify(sessionStore.get().user!)))
const changePasswordModal = ref(false)

// Actions
const openInputFile = () => {
  if (fileInput.value)
    fileInput.value.click()
}

const clearFileInput = () => {
  if (fileInput.value)
    fileInput.value.value = ''
}

const changePhoto = (action: BtnAction) => {
  if (action === BtnAction.ChangePhoto) {
    openInputFile()
  }
  else {
    loadingPhoto.value = true
    ProfileService.deletePhoto().finally(() => {
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
    ProfileService.changePhoto(file).finally(() => {
        loadingPhoto.value = false
        clearFileInput()
      })
  }
}

const resetInfo = () => {
  userInfo.value = JSON.parse(JSON.stringify(sessionStore.get().user!))
}

const submit = async () => {
    const {valid} = await form.value.validate()

    if (!valid) {
        return
    }

    loadingSubmit.value = true
    ProfileService.updateInfo({
        names: userInfo.value.names,
        email: userInfo.value.email,
    }).finally(() => {
        loadingSubmit.value = false
    })
}

// Computed
const valuesChanged = computed(() => {
    return JSON.stringify(userInfo.value) !== JSON.stringify(sessionStore.get().user!)
})
</script>
<style scoped>
.user-profile-img {
    border: 5px solid;
    border-color: #fff;
}
</style>