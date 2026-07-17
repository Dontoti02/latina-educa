<script setup lang="ts">
import { emailValidator, requiredValidator } from '@/@core/utils/validators'
import { SessionStore } from '@/common/store'
import modalService from '@/common/util/modal.service'
import { ToastService } from '@/common/util/toast.service'
import type { SystemConfigurationForm } from '@/models/system-configurations'
import { useAppAbility } from '@/plugins/casl/useAppAbility'
import { SystemConfigurationService } from '@/services/system-configuration.service'
import { ImageUtils } from '@/utils/images'
import { applyConfig, getBoxColor, getMenu, getSysConf, setPrimaryColor } from '@/utils/system-configuration'
import { useTheme } from 'vuetify'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'
import AppTextField from '@/@core/components/app-form-elements/AppTextField.vue';
// Initial
const ability = useAppAbility()
const sessionStore = SessionStore()
const form = ref()
const inputLogo = ref()
const inputFavicon = ref()
const inputBanner = ref()

const loadingParams = ref(true)
const loadingSubmitInfo = ref(false)
const loadingLogo = ref(false)
const loadingFavicon = ref(false)
const loadingBanner = ref(false)

const extensionsAllowed = ref<Array<string>>([])
const configuration = ref<SystemConfigurationForm>({})
let originalConfiguration: SystemConfigurationForm = {}

const has_virtual_library_url = ref<boolean>(false)
const has_inst_repository_url = ref<boolean>(false)
const has_external_job_opportunities_url = ref<boolean>(false)

const vuetifyTheme = useTheme()
const initialThemeColors = JSON.parse(JSON.stringify(vuetifyTheme.current.value.colors))
const colors = ['primary', 'secondary', 'success', 'info', 'warning', 'error']

const infoKeys = [
  'application_name',
  'support_emails',
  'study_days',
  'study_hour_start',
  'study_hour_end',
  'maximum_file_size_to_upload',
  'extensions_allowed_to_upload',
  'virtual_library_url',
  'institutional_repository_url',
  'primary_color',
  'igv_amount',
  'redirect_links',
  'external_job_opportunities'
]

// Methods
const getSystemConfiguration = async () => {
  loadingParams.value = true
  SystemConfigurationService.getSystemConfiguration().then(response => {
    configuration.value = response.data.reduce((obj, item) => {
      obj[item.key] = item

      return obj
    }, {} as SystemConfigurationForm)
    originalConfiguration = JSON.parse(JSON.stringify(configuration.value))

    if (configuration.value.extensions_allowed_to_upload && Array.isArray(configuration.value.extensions_allowed_to_upload.value)) {
      extensionsAllowed.value = configuration.value.extensions_allowed_to_upload.value
        .filter((item: { extension: string; permitted: true }) => item.permitted)
        .map((item: { extension: string; permitted: true }) => item.extension)
    }

    if(configuration.value.virtual_library_url && !!configuration.value.virtual_library_url.value) {
      has_virtual_library_url.value = true
    }

    if(configuration.value.institutional_repository_url && !!configuration.value.institutional_repository_url.value) {
      has_inst_repository_url.value = true
    }

    if(configuration.value.external_job_opportunities && !!configuration.value.external_job_opportunities.value) {
      has_external_job_opportunities_url.value = true
    }
  }).catch(error => {
    ToastService.error(error)
  }).finally(() => {
    loadingParams.value = false
    console.log({ configuration: configuration.value.redirect_links })
  })
}

// Mounted
onMounted(() => {
  getSystemConfiguration()
})

// Unmounted
onUnmounted(() => {
  applyConfig(vuetifyTheme)
})

// Actions
const setColor = (color: string) => {
  configuration.value.primary_color.value = color
  setPrimaryColor(vuetifyTheme, color)
}

const getInfoPromises = () => {
  if (configuration.value.extensions_allowed_to_upload && Array.isArray(configuration.value.extensions_allowed_to_upload.value)) {
    configuration.value.extensions_allowed_to_upload.value.forEach((item: {
      extension: string
      permitted: boolean
    }) => {
      item.permitted = extensionsAllowed.value.includes(item.extension)
    })
  }

  if(configuration.value.virtual_library_url && !has_virtual_library_url.value) {
    configuration.value.virtual_library_url.value = null
  }

  if(configuration.value.institutional_repository_url && !has_inst_repository_url.value) {
    configuration.value.institutional_repository_url.value = null
  }

  if (configuration.value.external_job_opportunities && !has_external_job_opportunities_url.value) {
    configuration.value.external_job_opportunities.value = null
  }
  return infoKeys.map(key => {
    const value = typeof configuration.value[key].value === 'string'
      ? configuration.value[key].value.trim()
      : JSON.stringify(configuration.value[key].value)

    return SystemConfigurationService.updateConfiguration(key, value)
  })
}

const submit = async () => {
  const { valid } = await form.value.validate()

  if (!valid)
    return

  loadingSubmitInfo.value = true
  Promise.allSettled(getInfoPromises()).then(results => {
    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        configuration.value[infoKeys[index]].value = originalConfiguration[infoKeys[index]].value
        ToastService.error(result.reason)

        return
      }

      if (result.value.success) {
        originalConfiguration[infoKeys[index]].value = configuration.value[infoKeys[index]].value
      }
      else {
        
        ToastService.error(result.value.data)
      }
    })

    getSysConf(vuetifyTheme)
    getMenu(ability)
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

      img.onload = function () {
        if (this.width < 390 || this.height < 300) {
          ToastService.error(`La imagen ${file.name} no cumple el mínimo de 390 x 300 px`)
        }
        else {
          updateLoadingLogo(key, true)
          SystemConfigurationService.updateConfiguration(key, file)
            .then(response => {
              configuration.value[key].value = response.data
              ToastService.success(`${configuration.value[key].name} actualizado correctamente`)
            })
            .catch(error => {
              ToastService.error(error)
            }).finally(() => {
              updateLoadingLogo(key, false)
              event.target.value = ''
            })
        }
      }

      img.src = URL.createObjectURL(file)
    }
    else {
      updateLoadingLogo(key, true)
      SystemConfigurationService.updateConfiguration(key, file)
        .then(response => {
          configuration.value[key].value = response.data
          ToastService.success(`${configuration.value[key].name} actualizado correctamente`)
          getSysConf(vuetifyTheme)
        })
        .catch(error => {
          ToastService.error(error)
        }).finally(() => {
          updateLoadingLogo(key, false)
          event.target.value = ''
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
  SystemConfigurationService.updateConfiguration('banner', null)
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

const onSetJobLink = () => {
  const currentDomain = window.location.origin
  configuration.value.external_job_opportunities.value = `${currentDomain}/bolsa-laboral/empleos`
}
</script>

<template>
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
    <VForm
      ref="form"
      :disabled="loadingSubmitInfo"
      @submit.prevent="submit"
    >
      <VRow>
        <!-- General -->
        <VCol
          cols="12"
          class="text-h4"
        >
          Información General
        </VCol>
        <VCol
          v-if="configuration.application_name"
          cols="12"
        >
          <AppTextField
            v-model="configuration.application_name.value"
            :label="configuration.application_name.name"
            :rules="[requiredValidator]"
          />
        </VCol>
        <VCol
          v-if="configuration.support_emails"
          cols="12"
        >
          <AppCombobox
            v-model="configuration.support_emails.value"
            :label="configuration.support_emails.name"
            placeholder="Ingrese un correo"
            :rules="[emailValidator]"
            multiple
            chips
            deletable-chips
          >
            <template #chip="{ item, index }">
              <VChip
                :text="item.value"
                closable
                @click:close="configuration.support_emails.value.splice(index, 1)"
              />
            </template>
          </AppCombobox>
        </VCol>
        <VCol
          v-if="configuration.study_days"
          cols="12"
        >
          <div class="app-text-field flex-grow-1">
            <VLabel class="mb-1 text-body-2 text-high-emphasis">
              {{ configuration.study_days.name }}
            </VLabel>
          </div>
          <div class="d-flex flex-column flex-md-row justify-md-space-between">
            <VCheckbox
              v-for="(day, index) in ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']"
              :key="index"
              v-model="configuration.study_days.value"
              :label="day"
              :value="index"
            />
          </div>
        </VCol>
        <VCol
          v-if="configuration.application_name"
          cols="12"
        >
          <AppTextField
            type="number"
            v-model="configuration.igv_amount.value"
            :label="configuration.igv_amount.name"
            :rules="[requiredValidator]"
          />
        </VCol>
        <VCol
          v-if="configuration.study_hour_start"
          cols="6"
        >
          <VCard
            flat
            :disabled="loadingSubmitInfo"
          >
            <AppTimePicker
              v-model="configuration.study_hour_start.value"
              :label="configuration.study_hour_start.name"
              prepend-inner-icon="tabler-clock"
              :config="{ enableTime: true, noCalendar: true, dateFormat: 'H:i', minuteIncrement: 15 }"
            />
          </VCard>
        </VCol>
        <VCol
          v-if="configuration.study_hour_end"
          cols="6"
        >
          <VCard
            flat
            :disabled="loadingSubmitInfo"
          >
            <AppTimePicker
              v-model="configuration.study_hour_end.value"
              :label="configuration.study_hour_end.name"
              prepend-inner-icon="tabler-clock"
              :config="{ enableTime: true, noCalendar: true, dateFormat: 'H:i', minuteIncrement: 15 }"
            />
          </VCard>
        </VCol>
        <VCol
          v-if="configuration.extensions_allowed_to_upload"
          cols="12"
          class="d-flex flex-column justify-end"
        >
          <div class="app-text-field flex-grow-1">
            <VLabel class="mb-1 text-body-2 text-high-emphasis">
              Extensiones permitidas
            </VLabel>
            <VSelect
              v-model="extensionsAllowed"
              multiple
              item-title="extension"
              item-value="extension"
              :items="configuration.extensions_allowed_to_upload.value"
              :rules="[requiredValidator]"
            />
          </div>
        </VCol>
        <VCol
          v-if="configuration.maximum_file_size_to_upload"
          cols="12"
        >
          <AppTextField
            v-model="configuration.maximum_file_size_to_upload.value"
            :label="configuration.maximum_file_size_to_upload.name"
            type="number"
            min="0"
            :rules="[requiredValidator]"
          />
        </VCol>
        <VCol
          v-if="configuration.virtual_library_url"
          cols="12"
        >
          <VCheckbox
            v-model="has_virtual_library_url"
            label="¿Cuenta con link de Biblioteca Virtual?"
          />
          <AppTextField
            v-if="has_virtual_library_url"
            v-model="configuration.virtual_library_url.value"
            :label="configuration.virtual_library_url.name"
          />
        </VCol>
        <VCol
          v-if="configuration.institutional_repository_url"
          cols="12"
        >
          <VCheckbox
            v-model="has_inst_repository_url"
            label="¿Cuenta con link de Repositorio Institucional?"
          />
          <AppTextField
            v-if="has_inst_repository_url"
            v-model="configuration.institutional_repository_url.value"
            :label="configuration.institutional_repository_url.name"
          />
        </VCol>
        <VCol
          v-if="configuration.institutional_repository_url"
          cols="12"
        >
          <VCheckbox
            v-model="has_external_job_opportunities_url"
            label="¿Cuenta con link de Bolsa de Trabajo?"
          />
            <AppTextField
            v-if="has_external_job_opportunities_url"
            v-model="configuration.external_job_opportunities.value"
            :label="configuration.external_job_opportunities.name"
            >
            <template #append-inner>
              <VTooltip text="Usar enlace de bolsa laboral interno">
              <template #activator="{ props }">
                <VIcon
                v-bind="props"
                icon="tabler-link"
                class="cursor-pointer"
                @click="onSetJobLink()"
                />
              </template>
              </VTooltip>
            </template>
          </AppTextField>
          
        </VCol>
        <VCol cols="12">
          <VCard
            flat
            :disabled="loadingSubmitInfo"
          >
            <div class="app-text-field flex-grow-1">
              <VLabel class="mb-1 text-body-2 text-high-emphasis">
                Primary Color
              </VLabel>

              <div class="d-flex gap-x-4 mt-2">
                <div
                  v-for="(color, index) in colors"
                  :key="color"
                  style=" border-radius: 0.5rem; block-size: 2.5rem;inline-size: 2.5rem; transition: all 0.25s ease;"
                  :style="{ backgroundColor: getBoxColor(initialThemeColors[color], index) }"
                  class="cursor-pointer d-flex align-center justify-center"
                  :class="{ 'elevation-4': vuetifyTheme.current.value.colors.primary === getBoxColor(initialThemeColors[color], index) }"
                  @click="setColor(getBoxColor(initialThemeColors[color], index))"
                >
                  <VFadeTransition>
                    <VIcon
                      v-show="vuetifyTheme.current.value.colors.primary === (getBoxColor(initialThemeColors[color], index))"
                      icon="tabler-check"
                      color="white"
                    />
                  </VFadeTransition>
                </div>
              </div>
            </div>
          </VCard>
        </VCol>
        <VCol cols="12">
          <VCard
            flat
            :disabled="loadingSubmitInfo"
          >
            <div class="app-text-field flex-grow-1">
              <VLabel class="mb-1 text-body-2 text-high-emphasis">
                Enlace de redirección 
              </VLabel>

              <div class="d-flex gap-x-4 mt-2">
                <AppTextField
                  v-if="Array.isArray(configuration.redirect_links?.value) && configuration.redirect_links.value[0]"
                  v-model="configuration.redirect_links.value[0].name"
                  :label="'Nombre del enlace'"
                  :rules="[requiredValidator]"
                />
                <AppTextField
                  v-if="Array.isArray(configuration.redirect_links?.value) && configuration.redirect_links.value[0]"
                  v-model="configuration.redirect_links.value[0].link"
                  :label="'Enlace'"
                  :rules="[
                    requiredValidator,
                    (v: string) => {
                      const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w\-._~:/?#[\]@!$&'()*+,;=]*)?$/i
                      return urlPattern.test(v) || 'Ingrese un enlace válido'
                    }
                  ]"
                />
              </div>
            </div>
          </VCard>
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
    <VRow>
      <!-- Logos -->
      <VCol
        cols="12"
        class="text-h4 mt-4"
      >
        Iconos
      </VCol>
      <VCol
        v-if="configuration.logo"
        cols="12"
        sm="6"
        class="d-flex flex-column justify-top align-center w-100"
      >
        <div class="text-center text-h5 mb-2">
          {{ configuration.logo.name }}
        </div>
        <div
          class="text-center icon-container d-flex flex-column align-center w-100 h-100"
          @click="openInputLogo"
        >
          <template v-if="!loadingLogo">
            <VImg
              v-if="configuration.logo.value !== null && configuration.logo.value !== ''"
              :src="ImageUtils.getUrlImage(configuration.logo.value)"
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
                    icon="tabler-photo-cancel"
                    size="xxx-large"
                  />
                  <div class="text-center">
                    Error al cargar la imagen
                  </div>
                </div>
              </template>
            </VImg>
            <div
              v-else
              class="d-flex flex-column align-center justify-center w-100 h-100 border-sm rounded py-2 px-2"
            >
              <VIcon
                icon="tabler-upload"
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
        <div class="text-center text-h5 mb-2">
          {{ configuration.favicon.name }}
        </div>
        <div
          class="text-center icon-container d-flex flex-column align-center w-100 h-100"
          @click="openInputFavicon"
        >
          <template v-if="!loadingFavicon">
            <VImg
              v-if="configuration.favicon.value !== null && configuration.favicon.value !== ''"
              :src="ImageUtils.getUrlImage(configuration.favicon.value)"
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
                    icon="tabler-photo-cancel"
                    size="xxx-large"
                  />
                  <div class="text-center">
                    Error al cargar la imagen
                  </div>
                </div>
              </template>
            </VImg>
            <div
              v-else
              class="d-flex flex-column align-center justify-center w-100 h-100 border-sm rounded py-2 px-2"
            >
              <VIcon
                icon="tabler-upload"
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
          <div class="text-h4">
            Banner
          </div>
          <div class="text-body-2">
            Será mostrado en la pantalla de Login.<br>
            Dimensiones mínimas: 390 x 300 px<br>
            Dimensiones recomendadas: 1280 x 960 px
          </div>
        </div>
        <VBtn
          v-if="configuration.banner"
          icon="tabler-trash"
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
        <div class="text-center text-h5 mb-2">
          {{ configuration.banner.name }}
        </div>
        <div
          class="text-center icon-container d-flex flex-column align-center w-100 h-100"
          @click="openInputBanner"
        >
          <template v-if="!loadingBanner">
            <VImg
              v-if="configuration.banner.value !== null && configuration.banner.value !== ''"
              :src="ImageUtils.getUrlImage(configuration.banner.value)"
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
                    icon="tabler-photo-cancel"
                    size="xxx-large"
                  />
                  <div class="text-center">
                    Error al cargar la imagen
                  </div>
                </div>
              </template>
            </VImg>
            <div
              v-else
              class="d-flex flex-column align-center justify-center w-100 h-100 border-sm rounded py-2 px-2"
            >
              <VIcon
                icon="tabler-upload"
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
  </VCard>
</template>

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
