<template>
  <AppContent>
    <template #title>
      <div class="py-2">
        <v-icon>mdi-cogs</v-icon>&nbsp;Parámetros
      </div>
    </template>
  </AppContent>
  <div
    v-if="loadingParams"
    class="mt-4 w-100 d-flex justify-center rounded-lg"
  >
    <VRow>
      <VCol cols="12">
        <VSkeletonLoader
          class="w-100 mt-4"
          type="heading,list-item-three-line,list-item-three-line,heading,list-item-three-line,list-item-three-line"
        />
      </VCol>
    </VRow>
  </div>
  <VCard
    v-else
    class="mt-6 px-4 py-6"
  >
    <template v-if="configuration">
      <VForm
        ref="form"
        :disabled="loadingSubmitInfo"
        @submit.prevent="submit"
      >
        <VRow>
          <!-- General -->
          <VCol
            cols="12"
            class="text-h5"
          >
            Información General
          </VCol>
          <VCol
            v-if="configuration.application_name"
            cols="12"
          >
            <v-text-field
              v-model="configuration.application_name.value"
              variant="solo"
              :label="configuration.application_name.name"
              hide-details="auto"
              :rules="[requiredValidator]"
            />
          </VCol>
          <VCol
            v-if="configuration.default_limit_space_institution_mb"
            cols="12"
          >
            <v-text-field
              v-model="configuration.default_limit_space_institution_mb.value"
              variant="solo"
              :label="configuration.default_limit_space_institution_mb.name"
              type="number"
              min="0"
              hide-details="auto"
              :rules="[requiredValidator]"
            />
          </VCol>
          <VCol
            v-if="configuration.user_default_auth_institution"
            cols="12"
            class="d-flex flex-column"
            style="gap: 0.75rem"
          >
            <div>
              <v-label class="text-body-2">{{ configuration.user_default_auth_institution.name }}</v-label>
            </div>
            <template v-if="configuration.user_default_auth_institution.value">
              <v-row>
                <v-col cols="6">
                  <v-text-field
                    v-model="configuration.user_default_auth_institution.value!.email"
                    variant="solo"
                    label="Email"
                    hide-details="auto"
                    :rules="[requiredValidator, emailValidator]"
                  />
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="configuration.user_default_auth_institution.value!.password"
                    variant="solo"
                    label="Contraseña"
                    hide-details="auto"
                    :type="showPass ? 'text' : 'password'"
                    :append-icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
                      @click:append="showPass = !showPass"
                    :rules="[requiredValidator]"
                  />
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12">
                  <v-text-field
                    v-model="configuration.user_default_auth_institution.value!.names"
                    variant="solo"
                    label="Nombre completo"
                    hide-details="auto"
                    :rules="[requiredValidator]"
                  />
                </v-col>
              </v-row>
              
            </template>
          </VCol>
          <VCol
            cols="12"
            class="d-flex justify-end"
          >
            <VBtn
              color="primary" 
              type="submit"
              :loading="loadingSubmitInfo"
            >
              Actualizar
            </VBtn>
          </VCol>
        </VRow>
      </VForm>
      <VForm
        ref="form2"
        :disabled="loadingSubmitMailing"
        @submit.prevent="submitMailing"
        v-if="configuration.mailing.value"
      >
      <VRow>
          <!-- Mailing -->
          <VCol
            cols="12"
            class="text-h5"
          >
            Configuración de notificaciones por correo
          </VCol>
          
          <VCol cols="12">
            <VRow>
              <VCol cols="12" md="6" xs="12">
                <v-text-field
                  v-model="configuration.mailing.value!.email"
                  variant="solo"
                  :label="'Correo electrónico para envio de correos'"
                  hide-details="auto"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="12" md="6" xs="12">
                <v-text-field
                  v-model="configuration.mailing.value!.token"
                  variant="solo"
                  label="token de aplicación(contraseña de correo)"
                  hide-details="auto"
                  :type="showToken ? 'text' : 'password'"
                  :append-icon="showToken ? 'mdi-eye' : 'mdi-eye-off'"
                    @click:append="showToken = !showToken"
                  :rules="[requiredValidator]"
                />
              </VCol>
            </VRow>

            <VRow>
              <VCol cols="12" md="6" xs="12">
                <v-text-field
                  v-model="configuration.mailing.value!.subject"
                  variant="solo"
                  :label="'Nombre para correos(Subject)'"
                  hide-details="auto"
                  :rules="[requiredValidator]"
                />
              </VCol>
              <VCol cols="12" md="6" xs="12">
                <v-switch
                  inset
                  :model-value="configuration.mailing.value!.enable"
                  color="primary"
                  label="Habilitar / Deshabilitar envio de correos"
                  hide-details
                ></v-switch>
              </VCol>
              <VCol
                cols="12"
                class="d-flex justify-end"
              >
                <VBtn
                  color="primary"
                  type="submit"
                  :loading="loadingSubmitMailing"
                >
                  Actualizar configuración de correo
                </VBtn>
              </VCol>
            </VRow>
          </VCol>
        </VRow>
      </VForm>
      <VRow>
        <!-- Logos -->
        <VCol
          cols="12"
          class="text-h5 mt-4"
        >
          Iconos
        </VCol>
        <VCol
          v-if="configuration.logo"
          cols="12"
          sm="6"
          class="d-flex flex-column justify-top align-center w-100"
        >
          <div class="text-center text-h6 mb-2">
            {{ configuration.logo.name }}
          </div>
          <div
            class="text-center icon-container d-flex flex-column align-center w-100 h-100"
            @click="openInputLogo"
          >
            <template v-if="!loadingLogo">
              <VImg
                v-if="configuration.logo.value !== null && configuration.logo.value !== ''"
                :src="getUrlImage(configuration.logo.value)"
                aspect-ratio="1.6"
                class="w-100"
              >
                <template #placeholder>
                  <VRow
                    align="center"
                    class="fill-height ma-0"
                    justify="center"
                  >
                    <VProgressCircular
                      color="grey-lighten-5"
                      indeterminate
                    />
                  </VRow>
                </template>
                <template #error>
                  <div class="w-100 h-100 d-flex flex-column align-center justify-center border-sm rounded">
                    <VIcon
                      icon="mdi-close-box-outline"
                      size="xxx-large"
                    />
                    Error al cargar la imagen
                  </div>
                </template>
              </VImg>
              <div
                v-else
                class="d-flex flex-column align-center justify-center w-100 h-100 border-sm rounded py-2 px-2"
              >
                <VIcon
                  icon="mdi-upload"
                  size="xxx-large"
                />
                Agregar una imagen
              </div>
              <div class="icon-message">
                <span class="text-white">Haga clic para seleccionar una imagen</span>
              </div>
            </template>
            <template v-else>
              <VChip
                class="w-100 h-100 rounded-sm d-flex align-center justify-center px-2 py-2"
                color="primary"
                @click.stop=""
              >
                <VProgressCircular
                  indeterminate
                  size="large"
                  color="white"
                />
              </VChip>
            </template>
          </div>
          <input
            ref="inputLogo"
            type="file"
            accept="image/*"
            style="display: none;"
            @change="changeImage($event, configuration.logo.key)"
          >
        </VCol>
        <VCol
          v-if="configuration.favicon"
          cols="12"
          sm="6"
          class="d-flex flex-column justify-top align-center w-100"
        >
          <div class="text-center text-h6 mb-2">
            {{ configuration.favicon.name }}
          </div>
          <div
            class="text-center icon-container d-flex flex-column align-center w-100 h-100"
            @click="openInputFavicon"
          >
            <template v-if="!loadingFavicon">
              <VImg
                v-if="configuration.favicon.value !== null && configuration.favicon.value !== ''"
                :src="getUrlImage(configuration.favicon.value)"
                aspect-ratio="1.6"
                class="w-100"
              >
                <template #placeholder>
                  <VRow
                    align="center"
                    class="fill-height ma-0"
                    justify="center"
                  >
                    <VProgressCircular
                      color="grey-lighten-5"
                      indeterminate
                    />
                  </VRow>
                </template>
                <template #error>
                  <div class="w-100 h-100 d-flex flex-column align-center justify-center border-sm rounded">
                    <VIcon
                      icon="mdi-close-box-outline"
                      size="xxx-large"
                    />
                    Error al cargar la imagen
                  </div>
                </template>
              </VImg>
              <div
                v-else
                class="d-flex flex-column align-center justify-center w-100 h-100 border-sm rounded py-2 px-2"
              >
                <VIcon
                  icon="mdi-upload"
                  size="xxx-large"
                />
                Agregar una imagen
              </div>
              <div class="icon-message">
                <span class="text-white">Haga clic para seleccionar una imagen</span>
              </div>
            </template>
            <template v-else>
              <VChip
                class="w-100 h-100 rounded-sm d-flex align-center justify-center px-2 py-2"
                color="primary"
                @click.stop=""
              >
                <VProgressCircular
                  indeterminate
                  size="large"
                  color="white"
                />
              </VChip>
            </template>
          </div>
          <input
            ref="inputFavicon"
            type="file"
            accept="image/*"
            style="display: none;"
            @change="changeImage($event, configuration.favicon.key)"
          >
        </VCol>
        <!-- Banner -->
        <VCol
          cols="12"
          class="mt-4 d-flex justify-space-between"
        >
          <div>
            <div class="text-h5">
              Banner
            </div>
            <div class="text-body-2">
              Será mostrado en la pantalla de Login.<br>
              Dimensiones mínimas: 390 x 300 px<br>
              Dimensiones recomendadas: 505 x 390 px
            </div>
          </div>
          <VBtn
            v-if="configuration.banner"
            icon="mdi-trash"
            variant="text"
            color="error"
            density="compact"
            @click="deleteBanner"
          />
        </VCol>
        <VCol
          v-if="configuration.banner"
          cols="12"
          class="d-flex flex-column justify-top align-center w-100"
        >
          <div class="text-center text-h6 mb-2">
            {{ configuration.banner.name }}
          </div>
          <div
            class="text-center icon-container d-flex flex-column align-center w-100 h-100"
            @click="openInputBanner"
          >
            <template v-if="!loadingBanner">
              <VImg
                v-if="configuration.banner.value !== null && configuration.banner.value !== ''"
                :src="getUrlImage(configuration.banner.value)"
                aspect-ratio="1.6"
                class="w-100"
              >
                <template #placeholder>
                  <VRow
                    align="center"
                    class="fill-height ma-0"
                    justify="center"
                  >
                    <VProgressCircular
                      color="grey-lighten-5"
                      indeterminate
                    />
                  </VRow>
                </template>
                <template #error>
                  <div class="w-100 h-100 d-flex flex-column align-center justify-center border-sm rounded">
                    <VIcon
                      icon="mdi-close-box-outline"
                      size="xxx-large"
                    />
                    Error al cargar la imagen
                  </div>
                </template>
              </VImg>
              <div
                v-else
                class="d-flex flex-column align-center justify-center w-100 h-100 border-sm rounded py-2 px-2"
              >
                <VIcon
                  icon="mdi-upload"
                  size="xxx-large"
                />
                Agregar una imagen
              </div>
              <div class="icon-message">
                <span class="text-white">Haga clic para seleccionar una imagen</span>
              </div>
            </template>
            <template v-else>
              <VChip
                class="w-100 h-100 rounded-sm d-flex align-center justify-center px-2 py-2"
                color="primary"
                @click.stop=""
              >
                <VProgressCircular
                  indeterminate
                  size="large"
                  color="white"
                />
              </VChip>
            </template>
          </div>
          <input
            ref="inputBanner"
            type="file"
            accept="image/*"
            style="display: none;"
            @change="changeImage($event, configuration.banner.key)"
          >
        </VCol>
      </VRow>
    </template>
  </VCard>
</template>
<script setup lang="ts">
import AppContent from '@/modules/app/pages/AppContent.vue';
import { emailValidator, requiredValidator } from '@/common/util/validators'
import modalService from '@/common/util/modal.service'
import { ToastService, toastError } from '@/common/util/toast.service'
import { onMounted, ref } from 'vue';
import { getSysParams, getUrlImage } from '@/common/util/global'
import ParametersRepository from '@/modules/private/parameters/repository/parameters.repository'
import { ParametersFormDto } from '../dto/parameters.dto';

// Initial
const form = ref()
const form2 = ref()
const inputLogo = ref()
const inputFavicon = ref()
const inputBanner = ref()

const loadingParams = ref(true)
const loadingSubmitInfo = ref(false)
const loadingSubmitMailing = ref(false)
const loadingLogo = ref(false)
const loadingFavicon = ref(false)
const loadingBanner = ref(false)
const showPass = ref(false)
const showToken = ref(false)

const extensionsAllowed = ref<Array<string>>([])
const configuration = ref<ParametersFormDto>({})
let originalConfiguration: ParametersFormDto = {}

const infoKeys = [
  'application_name',
  'default_limit_space_institution_mb',
  'user_default_auth_institution',
]

const mailingKey = 'mailing'

// Methods
const getSystemConfiguration = async () => {
  loadingParams.value = true
  ParametersRepository.getSystemParameters().then(response => {
    configuration.value = response.data.reduce((obj, item) => {
      obj[item.key] = item

      return obj
    }, {} as ParametersFormDto)
    originalConfiguration = JSON.parse(JSON.stringify(configuration.value))

    if (configuration.value.extensions_allowed_to_upload && Array.isArray(configuration.value.extensions_allowed_to_upload.value)) {
      extensionsAllowed.value = configuration.value.extensions_allowed_to_upload.value
        .filter((item: { extension: string; permitted: true }) => item.permitted)
        .map((item: { extension: string; permitted: true }) => item.extension)
    }
  }).catch(error => {
    ToastService.error(error)
  }).finally(() => {
    loadingParams.value = false
  })
}

onMounted(() => {
  getSystemConfiguration()
})

// Actions
const getInfoPromises = () => {
  if (configuration.value.extensions_allowed_to_upload && Array.isArray(configuration.value.extensions_allowed_to_upload.value)) {
    configuration.value.extensions_allowed_to_upload.value.forEach((item: {
      extension: string
      permitted: boolean
    }) => {
      item.permitted = extensionsAllowed.value.includes(item.extension)
    })
  }

  return infoKeys.map(key => {

    const value = configuration.value[key].value;

    let valueFormat : typeof value = null

    valueFormat = value

    if ((typeof value === 'number' && Number.isFinite(value)) || (value !== null && typeof value === 'object')) {
      valueFormat = JSON.stringify(value)
    }

    return ParametersRepository.updateParameters(key, valueFormat)
  })
}

const submitMailing = async () => {
  const { valid } = await form2.value.validate()

  if (!valid) return

  try {
    loadingSubmitMailing.value = true      
    const value = JSON.stringify(configuration.value[mailingKey]);
    const {success, data} = await ParametersRepository.updateParameters(mailingKey, value)
    if (!success) {
      toastError(data)
      return
    }
    originalConfiguration[mailingKey].value = configuration.value[mailingKey].value

  } catch (error) {
    toastError((error as any).message)
  } finally {
    loadingSubmitMailing.value = false
  }
}

const submit = async () => {
  const { valid } = await form.value.validate()
  if (!valid) return

  loadingSubmitInfo.value = true
  Promise.allSettled(getInfoPromises()).then(results => {
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        ToastService.error('Error al actualizar la configuración del sistema')

        return
      }

      if (result.value.success) {
        originalConfiguration[infoKeys[index]].value = configuration.value[infoKeys[index]].value
      }
      else {
        configuration.value[infoKeys[index]].value = originalConfiguration[infoKeys[index]].value
        ToastService.error(result.value.data)
      }
      ToastService.success('Configuración del sistema actualizado correctamente.')
    })
    getSysParams()
  }).finally(() => {
    loadingSubmitInfo.value = false
  })
  
}

const openInputLogo = () => {
  if (inputLogo.value)
    inputLogo.value.click()
}

const openInputFavicon = () => {
  if (inputFavicon.value)
    inputFavicon.value.click()
}

const openInputBanner = () => {
  if (inputBanner.value)
    inputBanner.value.click()
}

const updateLoadingLogo = (key: string, loading: boolean) => {
  if (key === 'logo')
    loadingLogo.value = loading
  else if (key === 'favicon')
    loadingFavicon.value = loading
  else if (key === 'banner')
    loadingBanner.value = loading
}

const onImageLoad = (img: HTMLImageElement,values:{
  file:any,
  key:string
}) => {

  const {file,key} = values
  if (img.naturalWidth < 390 || img.naturalHeight < 300) {
    ToastService.error(`La imagen ${file.name} no cumple el mínimo de 390 x 300 px`)
    return
  }
  updateLoadingLogo(key, true)
  ParametersRepository.updateParameters(key, file)
    .then(response => {
      configuration.value[key].value = response.data
      ToastService.success(`${configuration.value[key].name} actualizado correctamente`)
    })
    .catch(error => {
      ToastService.error(error)
    }).finally(() => {
      updateLoadingLogo(key, false)
    })
};

const changeImage = (event: any, key: string) => {
  if (event.target.files.length > 0) {
    const file = event.target.files[0]

    const maxSizeInBytes = 2 * 1024 * 1024
    if (file.size > maxSizeInBytes) {
      ToastService.error(`El archivo ${file.name} excede el tamaño máximo permitido de 2 MB`)

      return
    }

    if (key === 'banner') {
      const img = new Image()

      img.onload = () => onImageLoad(img,{
        file,key
      });

      img.src = URL.createObjectURL(file)
    }
    else {
      updateLoadingLogo(key, true)
      ParametersRepository.updateParameters(key, file)
        .then(response => {
          configuration.value[key].value = response.data
          ToastService.success(`${configuration.value[key].name} actualizado correctamente`)
          getSysParams()
        })
        .catch(error => {
          ToastService.error(error)
        }).finally(() => {
          updateLoadingLogo(key, false)
        })
    }
  }
}

const deleteBanner = async () => {
  const confirm = await modalService.confirmation({
    title: 'Eliminar banner',
    content: '¿Está seguro de eliminar el banner?',
  })

  if (!confirm)
    return

  updateLoadingLogo('banner', true)
  ParametersRepository.updateParameters('banner', null)
    .then(() => {
      configuration.value.banner.value = null
      ToastService.success(`${configuration.value.banner.name} eliminado correctamente`)
    })
    .catch(error => {
      ToastService.error(error)
    }).finally(() => {
      updateLoadingLogo('banner', false)
    })
}
</script>
<style lang="scss">
.icon-container {
  position: relative;
  block-size: 100%;
  cursor: pointer;
  inline-size: auto;
  max-inline-size: 250px;
  min-block-size: 200px;
  min-inline-size: 200px;
}

.icon-message {
  position: absolute;
  display: none;
  background-color: rgb(0, 0, 0, 15%);
  block-size: 100%;
  inline-size: 100%;
  inset-block-start: 0;
  inset-inline-start: 0;
  transition: background-color 0.3s;
}

.icon-container:hover .icon-message {
  display: flex !important;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 25%);
}
</style>