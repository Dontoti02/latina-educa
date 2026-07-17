<script setup lang="ts">
import { ToastService } from '@/common/util/toast.service'
import type { BannerForDragger, GetLandingPage, NewBanner, NewTeacher } from '@/models/landing'
import { LandingService } from '@/services/landing.service'
import { ImageUtils } from '@/utils/images'
import { emailValidator, requiredValidator } from '@core/utils/validators'
import BulbLightImg from '@images/illustrations/bulb-light.png'
import PencilRocketImg from '@images/illustrations/pencil-rocket.png'
import { uid } from 'uid'
import Draggable from 'vuedraggable'
import { VSkeletonLoader } from 'vuetify/labs/VSkeletonLoader'

// Inital
const form = ref()
const inputBanner = ref()
const inputTeacher = ref()
const currentIndexTeacher = ref<number | null>(null)

const loading = ref(false)
const loadingSubmit = ref(false)

const dragBanner = ref(false)
const sortBanner = ref(false)
const bannersForDragger = ref<BannerForDragger[]>([])

const newBanners = ref<NewBanner[]>([])
const newTeachers = ref<NewTeacher[]>([])

const landingInfo = ref<GetLandingPage>()
const lastLandingInfo = ref<GetLandingPage>()

// Computed
const validNumberOfServices = computed(() => {
  return landingInfo.value!.services.arrServices.length >= 3 && landingInfo.value!.services.arrServices.length <= 9
})

const validNumberOfNews = computed(() => {
  return landingInfo.value!.news.arrNews.length >= 3 && landingInfo.value!.news.arrNews.length <= 6
})

const validNumberOfCareers = computed(() => {
  return landingInfo.value!.careers.arrCareers.length >= 3 && landingInfo.value!.careers.arrCareers.length <= 6
})

const validNumberOfBanners = computed(() => {
  const count = bannersForDragger.value.length

  return count >= 3 && count <= 10
})

const validNumberOfTeachers = computed(() => {
  const count = landingInfo.value!.teachers.arrTeachers.length + newTeachers.value.length

  return count >= 4 && count <= 8
})

const dragOptionsForBanner = computed(() => {
  return {
    animation: 200,
    group: 'description',
    disabled: !sortBanner.value,
    ghostClass: 'ghost',
    chosenClass: 'no-move',
  }
})

// Data actions
const generateBannersForDragger = () => {
  const banners: Array<BannerForDragger> = []

  banners.push(...landingInfo.value!.banners.map(banner => ({
    image: banner,
    dummyUuid: null,
  })))

  banners.push(...newBanners.value.map(banner => ({
    image: banner.image,
    dummyUuid: banner.dummyUuid,
  })))

  bannersForDragger.value = banners
}

const getInfo = () => {
  loading.value = true

  LandingService.getLandingData()
    .then(response => {
      landingInfo.value = response.data
      lastLandingInfo.value = JSON.parse(JSON.stringify(response.data))
      generateBannersForDragger()
    })
    .catch(error => {
      ToastService.error(error)
    })
    .finally(() => {
      loading.value = false
    })
}

// Services Actions
const addService = () => {
  landingInfo.value!.services.arrServices.push({
    name: '',
    description: '',
    icon: 'circle-check',
  })
}

const deleteService = (index: number) => {
  landingInfo.value!.services.arrServices.splice(index, 1)
}

// News Actions
const addNew = () => {
  landingInfo.value!.news.arrNews.push({
    title: '',
    description: '',
    icon: 'article',
  })
}

const deleteNew = (index: number) => {
  landingInfo.value!.news.arrNews.splice(index, 1)
}

// Courses actions
const addCourse = () => {
  landingInfo.value!.careers.arrCareers.push({
    name: '',
    icon: 'book',
    courses: [],
  })
}

const deleteCourse = (index: number) => {
  landingInfo.value!.careers.arrCareers.splice(index, 1)
}

// Banner Actions
const openInputBanner = () => {
  if (inputBanner.value)
    inputBanner.value.click()
}

const clearBannerInput = () => {
  if (inputBanner.value)
    inputBanner.value.value = ''
}

const addBanner = (event: any) => {
  if (event.target.files.length <= 0) {
    clearBannerInput()

    return
  }

  const files = Array.from<File>(event.target.files)

  if (event.target.files.length + landingInfo.value!.banners.length + newBanners.value.length > 10) {
    ToastService.error('La cantidad de banners debe ser de 3 a 10 imágenes')
    clearBannerInput()

    return
  }

  const promises: Array<Promise<any>> = []

  files.forEach(file => {
    const reader = new FileReader()

    const promise = new Promise((resolve, reject) => {
      reader.onload = e => {
        const uuid = uid()

        newBanners.value.push({
          image: e.target!.result as string,
          file,
          dummyUuid: uuid,
        })
        bannersForDragger.value.push({
          image: e.target!.result as string,
          dummyUuid: uuid,
        })
        resolve(null)
      }

      reader.onerror = error => {
        reject(error)
      }
    })

    reader.readAsDataURL(file)
    promises.push(promise)
  })

  Promise.all(promises)
    .then(() => {
      clearBannerInput()
    })
    .catch(error => {
      console.error(error)
      ToastService.error('Error al cargar las imágenes')
    })
}

const deleteBanner = async (index: number) => {
  bannersForDragger.value.splice(index, 1)
}

const toggleSortBanner = () => {
  sortBanner.value = !sortBanner.value
}

// Teacher Actions
const addTeacher = () => {
  newTeachers.value.push({
    name: '',
    description: '',
    image: null,
    file: null,
  })
}

const deleteTeacher = (index: number, key: 'news' | 'existing') => {
  if (key === 'news')
    newTeachers.value.splice(index, 1)
  else
    landingInfo.value!.teachers.arrTeachers.splice(index, 1)
}

const openInputTeacher = (index: number) => {
  currentIndexTeacher.value = index
  if (inputTeacher.value)
    inputTeacher.value.click()
}

const clearInputTeacher = () => {
  if (inputTeacher.value)
    inputTeacher.value.value = ''
}

const addTeacherImage = (event: any) => {
  if (currentIndexTeacher.value === null)
    return

  if (event.target.files.length <= 0) {
    clearInputTeacher()

    return
  }

  const file = event.target.files[0]
  const reader = new FileReader()

  reader.onload = e => {
    newTeachers.value[currentIndexTeacher.value!].image = e.target!.result as string
    newTeachers.value[currentIndexTeacher.value!].file = file
    clearInputTeacher()
    currentIndexTeacher.value = null
  }

  reader.readAsDataURL(file)
}

// Submit actions
const uploadBanners = async () => {
  const promises: Array<Promise<any>> = []

  newBanners.value.forEach(banner => {
    const promise = LandingService.uploadImage(banner.file)
      .then(response => {
        const bannerInDragger = bannersForDragger.value.find(bannerForDragger => bannerForDragger.dummyUuid === banner.dummyUuid)
        if (bannerInDragger) {
          bannerInDragger.image = response.data
          bannerInDragger.dummyUuid = null
        }
      })
      .catch(error => {
        bannersForDragger.value = bannersForDragger.value.filter(bannerForDragger => bannerForDragger.dummyUuid !== banner.dummyUuid)
        ToastService.error(`${banner.file.name}: ${error}`)
      }).finally(() => {
        newBanners.value = newBanners.value.filter(nB => nB.dummyUuid !== banner.dummyUuid)
      })

    promises.push(promise)
  })

  return await promises
}

const deleteBanners = async () => {
  const promises: Array<Promise<any>> = []

  landingInfo.value?.banners.forEach(banner => {
    if (!bannersForDragger.value.find(bannerForDragger => bannerForDragger.image === banner && bannerForDragger.dummyUuid === null)) {
      const promise = LandingService.deleteImage(banner)
        .catch(error => {
          bannersForDragger.value.push({
            image: banner,
            dummyUuid: null,
          })
          console.error(error)
          ToastService.error(`Error al eliminar la imagen ${banner}`)
        })

      promises.push(promise)
    }
  })

  return await promises
}

const uploadTeachersImages = async () => {
  for (let i = 0; i < newTeachers.value.length; i++) {
    const teacher = newTeachers.value[i]

    await LandingService.uploadImage(teacher.file!)
      .then(response => {
        landingInfo.value!.teachers.arrTeachers.push({
          name: teacher.name,
          description: teacher.description,
          image: response.data,
        })
      })
      .catch(error => {
        console.error(error)
        ToastService.error(`Error al subir la imagen del profesor ${teacher.name}`)
      }).finally(() => {
        newTeachers.value.splice(i, 1)
        i--
      })
  }
}

const deleteTeachersImages = async () => {
  const promises: Array<Promise<any>> = []

  lastLandingInfo.value?.teachers.arrTeachers.forEach(teacher => {
    if (!landingInfo.value?.teachers.arrTeachers.find(t => t.image === teacher.image)) {
      const promise = LandingService.deleteImage(teacher.image)
        .catch(error => {
          console.error(error)
          ToastService.error(`Error al eliminar la imagen ${teacher.image}`)
        })

      promises.push(promise)
    }
  })

  return await promises
}

const submitData = async () => {
  landingInfo.value!.banners = bannersForDragger.value.filter(banner => banner.dummyUuid === null).map(banner => banner.image)

  LandingService.updateLandingData(JSON.stringify(landingInfo.value))
    .then(response => {
      lastLandingInfo.value = JSON.parse(JSON.stringify(response.data))
      ToastService.success('Información actualizada correctamente')
    })
    .catch(error => {
      ToastService.error(error)
    })
    .finally(() => {
      loadingSubmit.value = false
    })
}

const submit = async () => {
  const { valid } = await form.value.validate()
  if (!valid || !validNumberOfBanners.value
    || !validNumberOfServices.value || !validNumberOfNews.value
    || !validNumberOfCareers.value || !validNumberOfTeachers.value
    || newTeachers.value.some(teacher => teacher.image === null)
  )
    return

  loadingSubmit.value = true

  const uploadBannersPromises = await uploadBanners()
  const deleteBannersPromises = await deleteBanners()
  const deleteTeachersImagesPromises = await deleteTeachersImages()

  await Promise.all([...uploadBannersPromises, ...deleteBannersPromises, ...deleteTeachersImagesPromises])
  await uploadTeachersImages()
  submitData()
}

function openLanding() {
  if (!lastLandingInfo.value) return
  window.open(lastLandingInfo.value.url, '_blank')
}

// Mounted
onBeforeMount(() => {
  getInfo()
})

// Utils
</script>

<template>
  <div v-if="loading || landingInfo === undefined">
    <VRow>
      <VCol cols="12">
        <VSkeletonLoader
          class="w-100"
          type="image"
        />
      </VCol>
      <VCol cols="12">
        <VSkeletonLoader
          class="w-100 gap-2"
          type="list-item-three-line,list-item-three-line,list-item-three-line,list-item-three-line,list-item-three-line"
        />
      </VCol>
    </VRow>
  </div>
  <div v-else>
    <VCard>
      <VRow class="">
        <VCol
          cols="3"
          class="pl-8 pt-6"
        >
          <img
            :src="BulbLightImg"
            height="100"
          >
        </VCol>
        <VCol
          cols="6"
          class="pt-6 px-8 pb-6 d-flex text-center justify-center align-center flex-column"
        >
          <h1>Landing Page</h1>
          <p>Registra la configuración y contenido que tendrá la landing page de tu institución.</p>
        </VCol>
        <VCol
          cols="3"
          class="d-flex justify-end align-end"
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
      class="mt-6 px-4 pb-6 pt-2"
      :disabled="loadingSubmit"
    >
      <VCardText>
        <VForm
          ref="form"
          @submit.prevent="submit"
        >
          <VRow>
            <!-- Institution -->
            <VCol cols="12">
              <VRow class="justify-space-between">
                <VCol
                  cols="6"
                  class="text-h4"
                >
                  Información princial
                </VCol>
                <VCol
                  cols="6"
                  class="text-end"
                >
                  <VBtn
                    color="indigo"
                    @click="openLanding"
                  >
                    <VIcon>mdi-open-in-new</VIcon>Ver landing
                  </VBtn>
                </VCol>
              </VRow>
            </VCol>
            <VCol
              cols="12"
              class="pt-0"
            >
              <AppTextField
                v-model="landingInfo.institution.name"
                label="Nombre principal"
                :rules="[requiredValidator]"
              />
            </VCol>
            <VCol
              cols="12"
              class="pt-0"
            >
              <div class="app-text-field">
                <VLabel class="mb-1 text-body-2 text-high-emphasis">
                  Descripción
                </VLabel>
              </div>
              <VTextarea
                v-model="landingInfo.institution.description"
                rows="2"
                :rules="[requiredValidator]"
                :hint="landingInfo.institution.description.length > 180 ? 'La descripción ha excedido los caracteres recomendados (180)' : ''"
                persistent-hint
              />
            </VCol>
            <!-- Banners -->
            <VCol
              cols="12"
              class="mt-4 d-flex justify-space-between"
            >
              <div>
                <div class="d-flex gap-2">
                  <div class="text-h4">
                    Banners
                  </div>
                  <VTooltip text="Reordenar banners">
                    <template #activator="{ props }">
                      <VBtn
                        v-bind="props"
                        variant="text"
                        density="compact"
                        icon="tabler-arrows-sort"
                        :color="sortBanner ? 'success' : 'primary'"
                        @click="toggleSortBanner"
                      />
                    </template>
                  </VTooltip>
                </div>
                <div class="text-body-2">
                  Relación recomendada: 16:9
                </div>
                <div
                  v-if="!validNumberOfBanners"
                  class="text-body-2 text-error"
                >
                  Se recomienda agregar entre 3 y 10 banners
                </div>
              </div>
              <VBtn
                v-if="landingInfo.banners.length < 10"
                text="Agregar banner"
                prepend-icon="tabler-plus"
                variant="tonal"
                class="text-none"
                @click="openInputBanner"
              />
            </VCol>
            <VCol
              cols="12"
              class="d-flex flex-row justify-start align-end gap-6 custom-banners"
            >
              <Draggable
                v-model="bannersForDragger"
                item-key="image"
                class="d-flex flex-row gap-10"
                :class="{ 'list-group': sortBanner }"
                :sort="sortBanner"
                v-bind="dragOptionsForBanner"
                :component-data="{
                  tag: 'div',
                  type: 'transition-group',
                  name: !dragBanner ? 'flip-list' : null,
                }"
                @start="dragBanner = true"
                @end="dragBanner = false"
              >
                <template #item="{ element, index }">
                  <VCard
                    :variant="sortBanner ? 'elevated' : 'flat'"
                    class="d-flex flex-column justify-center px-2 pb-2 list-group-item"
                  >
                    <div class="d-flex gap-2 justify-center align-center text-h5 mb-2">
                      Banner {{ index + 1 }}
                      <VBtn
                        icon="tabler-trash"
                        variant="text"
                        color="error"
                        density="compact"
                        @click="deleteBanner(index)"
                      />
                    </div>
                    <VImg
                      :src="element.dummyUuid === null ? ImageUtils.getUrlImage(element.image) : element.image"
                      width="288"
                      height="162"
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
                  </VCard>
                </template>
              </Draggable>

              <input
                ref="inputBanner"
                type="file"
                accept="image/*"
                multiple
                style="display: none;"
                @change="addBanner($event)"
              >
            </VCol>
            <!-- Services -->
            <VCol
              cols="12"
              sm="12"
              class="mt-2 d-flex justify-space-between"
            >
              <div>
                <div class="text-h4">
                  Servicios
                </div>
              </div>
              <VBtn
                class="text-none"
                text="Agregar servicio"
                prepend-icon="tabler-plus"
                variant="tonal"
                :disabled="landingInfo.services.arrServices.length >= 9"
                @click="addService"
              />
            </VCol>
            <VCol cols="12">
              <div>
                  Los íconos de los servicios se pueden encontrar
                  <a
                    href="https://tablericons.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                  > aquí</a>.
                </div>
                <div
                  v-if="!validNumberOfServices"
                  class="text-body-2 text-error"
                >
                  Se recomienda agregar entre 3 y 9 servicios
                </div>
            </VCol>
            <VCol
              cols="12"
              class="pt-0"
            >
              <AppTextField
                v-model="landingInfo.services.title"
                label="Título de las servicios"
                :rules="[requiredValidator]"
                :hint="landingInfo.services.title.length > 40 ? 'El título ha excedido los caracteres recomendados (40)' : ''"
                persistent-hint
              />
            </VCol>
            <VCol
              cols="12"
              class="pt-0"
            >
              <AppTextarea
                v-model="landingInfo.services.description"
                rows="5"
                label="Descripción"
                :rules="[requiredValidator]"
                :hint="landingInfo.services.description.length > 100 ? 'La descripción ha excedido los caracteres recomendados (100)' : ''"
                persistent-hint
              />
            </VCol>
            <template
              v-for="(service, index) in landingInfo.services.arrServices"
              :key="`service-${index}`"
            >
              <VCol
                cols="12"
                class="text-h5 d-flex justify-space-between align-center gap-2"
              >
                <div>
                  Servicio {{ index + 1 }}
                </div>
                <VBtn
                  icon="tabler-trash"
                  variant="text"
                  color="error"
                  density="compact"
                  @click="deleteService(index)"
                />
              </VCol>
              <VCol
                cols="12"
                sm="8"
                class="pt-0"
              >
                <AppTextField
                  v-model="service.name"
                  label="Nombre del servicio"
                  :rules="[requiredValidator]"
                  :hint="service.name.length > 30 ? 'El nombre ha excedido los caracteres recomendados (30)' : ''"
                  persistent-hint
                />
              </VCol>
              <VCol
                cols="12"
                sm="4"
                class="d-flex gap-2 pt-0"
              >
                <div class="w-100">
                  <div class="app-text-field">
                    <VLabel class="mb-1 text-body-2 text-high-emphasis">
                      Nombre del ícono
                    </VLabel>
                    <VTooltip text="Se debe copiar el nombre del ícono">
                      <template #activator="{ props }">
                        <VIcon v-bind="props" icon="tabler-info-circle" size="small" color="primary" />
                      </template>
                    </VTooltip>
                  </div>
                  <VTextField v-model="service.icon" :rules="[requiredValidator]" />
                </div>
                <VIcon :icon="`tabler-${service.icon}`" class="mt-9" />
              </VCol>
              <VCol
                cols="12"
                class="pt-0"
              >
                <AppTextarea
                  v-model="service.description"
                  rows="5"
                  label="Descripción"
                  :rules="[requiredValidator]"
                  :hint="service.description.length > 60 ? 'La descripción ha excedido los caracteres recomendados (60)' : ''"
                  persistent-hint
                />
              </VCol>
            </template>
            <!-- News -->
            <VCol
              cols="12"
              class="mt-4 d-flex justify-space-between pt-0 gap-2 align-center"
            >
              <div class="text-h4">
                Novedades
              </div>
              <VBtn
                class="text-none"
                text="Agregar novedad"
                prepend-icon="tabler-plus"
                variant="tonal"
                :disabled="landingInfo.news.arrNews.length >= 6"
                @click="addNew"
              />
            </VCol>
            <VCol cols="12">
              <div
                v-if="!validNumberOfNews"
                class="text-body-2 text-error"
              >
                Se recomienda agregar entre 3 y 6 novedades
              </div>
              <div>
                Los íconos de los cursos se pueden encontrar
                <a
                  href="https://tablericons.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                > aquí</a>.
              </div>
            </VCol>
            <VCol
              cols="12"
              class="pt-0"
            >
              <AppTextField
                v-model="landingInfo.news.title"
                label="Título de las novedades"
                :rules="[requiredValidator]"
                :hint="landingInfo.news.title.length > 30 ? 'El título ha excedido los caracteres recomendados (30)' : ''"
                persistent-hint
              />
            </VCol>
            <VCol
              cols="12"
              class="pt-0"
            >
              <AppTextarea
                v-model="landingInfo.news.description"
                rows="5"
                label="Descripción"
                :rules="[requiredValidator]"
                :hint="landingInfo.news.description.length > 60 ? 'La descripción ha excedido los caracteres recomendados (60)' : ''"
                persistent-hint
              />
            </VCol>
            <template
              v-for="(newInfo, index) in landingInfo.news.arrNews"
              :key="`new-${index}`"
            >
              <VCol
                cols="12"
                class="text-h5 pt-0 d-flex justify-space-between align-center"
              >
                <div>
                  Novedad {{ index + 1 }}
                </div>
                <VBtn
                  icon="tabler-trash"
                  variant="text"
                  color="error"
                  density="compact"
                  @click="deleteNew(index)"
                />
              </VCol>
              <VCol
                cols="12"
                sm="8"
                class="pt-0"
              >
                <AppTextField
                  v-model="newInfo.title"
                  label="Título de la novedad"
                  :rules="[requiredValidator]"
                  :hint="newInfo.title.length > 25 ? 'El título ha excedido los caracteres recomendados (25)' : ''"
                  persistent-hint
                />
              </VCol>
              <VCol
                cols="12"
                sm="4"
                class="d-flex gap-2 align-top pt-0"
              >
                <div class="w-100">
                  <div class="app-text-field">
                    <VLabel class="mb-1 text-body-2 text-high-emphasis">
                      Nombre del ícono
                    </VLabel>
                    <VTooltip text="Se debe copiar el nombre del ícono">
                      <template #activator="{ props }">
                        <VIcon
                          v-bind="props"
                          icon="tabler-info-circle"
                          size="small"
                          color="primary"
                        />
                      </template>
                    </VTooltip>
                  </div>
                  <VTextField
                    v-model="newInfo.icon"
                    :rules="[requiredValidator]"
                  />
                </div>
                <VIcon
                  :icon="`tabler-${newInfo.icon}`"
                  class="mt-9"
                />
              </VCol>
              <VCol
                cols="12"
                class="pt-0"
              >
                <AppTextarea
                  v-model="newInfo.description"
                  rows="5"
                  label="Descripción"
                  :rules="[requiredValidator]"
                  :hint="newInfo.description.length > 80 ? 'La descripción ha excedido los caracteres recomendados (80)' : ''"
                  persistent-hint
                />
              </VCol>
            </template>
            <!-- Teachers -->
            <VCol
              cols="12"
              class="mt-4 d-flex justify-space-between pt-0 gap-2 align-center"
            >
              <div>
                <div class="text-h4">
                  Profesores
                </div>
                <div
                  v-if="!validNumberOfTeachers"
                  class="text-body-2 text-error"
                >
                  Se recomienda agregar entre 4 y 8 profesores
                </div>
              </div>
              <VBtn
                class="text-none"
                text="Agregar profesor"
                prepend-icon="tabler-plus"
                variant="tonal"
                :disabled="landingInfo.teachers.arrTeachers.length > 8"
                @click="addTeacher"
              />
            </VCol>
            <VCol
              cols="12"
              class="pt-0"
            >
              <AppTextField
                v-model="landingInfo.teachers.title"
                label="Título de los profesores"
                :rules="[requiredValidator]"
                :hint="landingInfo.teachers.title.length > 40 ? 'La descripción ha excedido los caracteres recomendados (40)' : ''"
                persistent-hint
              />
            </VCol>
            <VCol
              cols="12"
              class="pt-0"
            >
              <AppTextarea
                v-model="landingInfo.teachers.description"
                rows="5"
                label="Descripción"
                :rules="[requiredValidator]"
                :hint="landingInfo.teachers.description.length > 100 ? 'La descripción ha excedido los caracteres recomendados (100)' : ''"
                persistent-hint
              />
            </VCol>
            <template
              v-for="(teacher, index) in landingInfo.teachers.arrTeachers"
              :key="`teacher-${index}`"
            >
              <VCol
                cols="12"
                class="text-h5 pt-0 d-flex justify-space-between align-center"
              >
                <div>
                  Profesor {{ index + 1 }}
                </div>
                <VBtn
                  icon="tabler-trash"
                  variant="text"
                  color="error"
                  density="compact"
                  @click="deleteTeacher(index, 'existing')"
                />
              </VCol>
              <VCol
                cols="12"
                sm="4"
                md="3"
                lg="2"
                class="pt-0 d-flex justify-center align-center"
              >
                <VImg
                  :id="`teacher-image-${index}`"
                  :src="ImageUtils.getUrlImage(teacher.image)"
                  width="100%"
                  height="100%"
                  style="flex: none;"
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
              </VCol>
              <VCol
                cols="12"
                sm="8"
                md="9"
                lg="10"
                class="pt-0 d-flex justify-center align-center"
              >
                <VRow>
                  <VCol
                    cols="12"
                    class="pt-0"
                  >
                    <AppTextField
                      v-model="teacher.name"
                      label="Nombre del profesor"
                      :rules="[requiredValidator]"
                      :hint="teacher.name.length > 50 ? 'El nombre ha excedido los caracteres recomendados (50)' : ''"
                      persistent-hint
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    class="pt-0"
                  >
                    <AppTextarea
                      v-model="teacher.description"
                      rows="1"
                      label="Descripción"
                      :rules="[requiredValidator]"
                      :hint="teacher.description.length > 50 ? 'La descripción ha excedido los caracteres recomendados (50)' : ''"
                      persistent-hint
                    />
                  </VCol>
                </VRow>
              </VCol>
            </template>
            <template
              v-for="(teacher, index) in newTeachers"
              :key="`new-teacher-${index}`"
            >
              <VCol
                cols="12"
                class="text-h5 pt-0 d-flex justify-space-between align-center"
              >
                <div>
                  Profesor {{ landingInfo.teachers.arrTeachers.length + index + 1 }}
                </div>
                <VBtn
                  icon="tabler-trash"
                  variant="text"
                  color="error"
                  density="compact"
                  @click="deleteTeacher(index, 'news')"
                />
              </VCol>
              <VCol
                cols="12"
                sm="4"
                md="3"
                lg="2"
                class="pt-0 d-flex justify-center"
              >
                <div
                  v-if="teacher.image === null"
                  class="w-100"
                >
                  <VBtn
                    icon="tabler-plus"
                    variant="outlined"
                    rounded="sm"
                    class="w-100 h-100"
                    @click="openInputTeacher(index)"
                  />
                  <div class="text-body-2 text-error">
                    Debe agregar una imagen
                  </div>
                </div>
                <VImg
                  v-else
                  :src="teacher.image"
                  width="100%"
                  height="100%"
                  style="flex: none;"
                />
              </VCol>
              <VCol
                cols="12"
                sm="8"
                md="9"
                lg="10"
                class="pt-0 d-flex justify-center align-center"
              >
                <VRow>
                  <VCol
                    cols="12"
                    class="pt-0"
                  >
                    <AppTextField
                      v-model="teacher.name"
                      label="Nombre del profesor"
                      :rules="[requiredValidator]"
                      :hint="teacher.name.length > 20 ? 'El nombre ha excedido los caracteres recomendados (20)' : ''"
                      persistent-hint
                    />
                  </VCol>
                  <VCol
                    cols="12"
                    class="pt-0"
                  >
                    <AppTextarea
                      v-model="teacher.description"
                      rows="1"
                      label="Descripción"
                      :rules="[requiredValidator]"
                      :hint="teacher.description.length > 200 ? 'La descripción ha excedido los caracteres recomendados (200)' : ''"
                      persistent-hint
                    />
                  </VCol>
                </VRow>
              </VCol>
            </template>
            <input
              ref="inputTeacher"
              type="file"
              accept="image/*"
              style="display: none;"
              @change="addTeacherImage"
            >
            <!-- Courses -->
            <VCol
              cols="12"
              class="mt-2 d-flex justify-space-between"
            >
              <div>
                <div class="text-h4">
                  Cursos
                </div>
                <div
                  v-if="!validNumberOfCareers"
                  class="text-body-2 text-error"
                >
                  Se recomienda agregar entre 3 y 6 cursos
                </div>
              </div>
              <VBtn
                class="text-none"
                text="Agregar curso"
                prepend-icon="tabler-plus"
                variant="tonal"
                :disabled="landingInfo.careers.arrCareers.length >= 6"
                @click="addCourse"
              />
            </VCol>
            <VCol cols="12">
                Los íconos de los cursos se pueden encontrar
                <a
                  href="https://tablericons.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                > aquí</a>.
            </VCol>
            <VCol
              cols="12"
              class="pt-0"
            >
              <AppTextField
                v-model="landingInfo.careers.title"
                label="Título de las novedades"
                :rules="[requiredValidator]"
                :hint="landingInfo.careers.title.length > 40 ? 'El título ha excedido los caracteres recomendados (40)' : ''"
                persistent-hint
              />
            </VCol>
            <VCol
              cols="12"
              class="pt-0"
            >
              <AppTextarea
                v-model="landingInfo.careers.description"
                rows="5"
                label="Descripción"
                :rules="[requiredValidator]"
                :hint="landingInfo.careers.description.length > 100 ? 'La descripción ha excedido los caracteres recomendados (100)' : ''"
                persistent-hint
              />
            </VCol>
            <template
              v-for="(course, index) in landingInfo.careers.arrCareers"
              :key="`course-${index}`"
            >
              <VCol
                cols="12"
                class="text-h5 pt-0 d-flex align-center justify-space-between"
              >
                <div>
                  Curso {{ index + 1 }}
                </div>
                <VBtn
                  icon="tabler-trash"
                  variant="text"
                  color="error"
                  density="compact"
                  @click="deleteCourse(index)"
                />
              </VCol>
              <VCol
                cols="12"
                sm="8"
                class="pt-0"
              >
                <AppTextField
                  v-model="course.name"
                  label="Nombre del curso"
                  :rules="[requiredValidator]"
                  :hint="course.name.length > 40 ? 'El nombre ha excedido los caracteres recomendados (40)' : ''"
                  persistent-hint
                />
              </VCol>
              <VCol
                cols="12"
                sm="4"
                class="d-flex gap-2 pt-0"
              >
                <div class="w-100">
                  <div class="app-text-field">
                    <VLabel class="mb-1 text-body-2 text-high-emphasis">
                      Nombre del ícono
                    </VLabel>
                    <VTooltip text="Se debe copiar el nombre del ícono">
                      <template #activator="{ props }">
                        <VIcon
                          v-bind="props"
                          icon="tabler-info-circle"
                          size="small"
                          color="primary"
                        />
                      </template>
                    </VTooltip>
                  </div>
                  <VTextField
                    v-model="course.icon"
                    :rules="[requiredValidator]"
                  />
                </div>
                <VIcon
                  :icon="`tabler-${course.icon}`"
                  class="mt-9"
                />
              </VCol>
              <VCol
                cols="12"
                class="pt-0"
              >
                <AppCombobox
                  v-model="course.courses"
                  label="Cursos"
                  multiple
                  chips
                  deletable-chips
                  :hint="course.courses.some(c => c.length > 50) ? 'El nombre del curso ha excedido los caracteres recomendados (50)' : ''"
                  persistent-hint
                >
                  <template #chip="{ item, index }">
                    <VChip
                      :text="item.value"
                      closable
                      @click:close="course.courses.splice(index, 1)"
                    />
                  </template>
                </AppCombobox>
              </VCol>
            </template>
            <!-- Contact Information -->
            <VCol
              cols="12"
              class="mt-2 text-h4 d-flex justify-space-between"
            >
              Información de contacto
            </VCol>
            <VCol
              cols="12"
              class="pt-0"
            >
              <AppCombobox
                v-model="landingInfo.contact_information.phones"
                label="Números de contacto"
                multiple
                chips
                deletable-chips
              >
                <template #chip="{ item, index }">
                  <VChip
                    :text="item.value"
                    closable
                    @click:close="landingInfo!.contact_information.phones.splice(index, 1)"
                  />
                </template>
              </AppCombobox>
            </VCol>
            <VCol
              cols="12"
              class="pt-0"
            >
              <AppCombobox
                v-model="landingInfo.contact_information.emails"
                label="Números de contacto"
                placeholder="Ingrese un número de teléfono"
                :rules="[emailValidator]"
                multiple
                chips
                deletable-chips
              >
                <template #chip="{ item, index }">
                  <VChip
                    :text="item.value"
                    closable
                    @click:close="landingInfo!.contact_information.emails.splice(index, 1)"
                  />
                </template>
              </AppCombobox>
            </VCol>
            <VCol
              cols="12"
              class="d-flex justify-end mt-2"
            >
              <VBtn
                text="Guardar"
                type="submit"
                color="primary"
                variant="flat"
                :loading="loadingSubmit"
              />
            </VCol>
          </VRow>
        </VForm>
      </VCardText>
      <VCardActions class="d-flex justify-end" />
    </VCard>
  </div>
</template>

<style lang="scss">
// Transition for draggable
.flip-list-move {
  transition: transform 0.5s;
}

.no-move {
  transition: transform 0s;
}

.ghost {
  background: rgb(var(--v-theme-primary), 0.2);
  opacity: 0.5;
}

.list-group {
  // min-block-size: 20px;
  .list-group-item {
    cursor: move;
  }
}

/* Customize the scrollbar */
.custom-banners {
  overflow-x: auto;
}

.custom-banners::-webkit-scrollbar {
  block-size: 6px;
}

.custom-banners::-webkit-scrollbar-track {
  background-color: #f1f1f1;
}

.custom-banners::-webkit-scrollbar-thumb {
  border-radius: 4px;
  background-color: #afafaf;
}

.custom-banners::-webkit-scrollbar-thumb:hover {
  background-color: #8f8f8f;
}
</style>

<route lang="yaml">
meta:
  action: manage
  subject: LandingPage
      </route>
