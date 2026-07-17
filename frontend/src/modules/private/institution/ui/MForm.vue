<template>
    <ModalBasic
      :show="show"
      title="Instituto/Universidad"
      :size="2"
      :persistent="true"
      :width="1000"
      :isScrollable="true"
    >
    <v-form ref="form-institution" @submit.prevent="submit" fast-fail v-model="formValid">
      <v-card>
        <v-toolbar dark color="var(--bg-toolbar)" class="text-white">
          <v-toolbar-title>{{ titleModal }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-btn icon dark @click="$emit('close')">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar>
        
          <v-card-text class="my-4 mx-4">
            <v-row>
              <v-col cols="12" md="9"  class="py-0" xs="12">
                <div class="text-subtitle-2 text-medium-emphasis d-flex justify-space-between items-center">
                  <div>
                    Nombre:<Required />
                  </div>
                  <div class="d-flex justify-end items-center" style="width: 85%;"
                    v-if="!disabledEditSubdomain"
                  >
                    <div>
                      <v-text-field
                        v-model="form.subdomain"
                        :suffix="domain"
                        density="compact"
                        placeholder="rojodi"
                        hide-details
                        :loading="spinExistsSubdomain"
                        :disabled="spinExistsSubdomain || !enabledEditSubdomain"
                        :min-width="400"
                        variant="underlined"
                      ></v-text-field>
                    </div>
                    <div>
                        <v-btn 
                          variant="plain" 
                          :icon="enabledEditSubdomain ? 'mdi-check' : 'mdi-pencil'" 
                          size="x-small"
                          @click="enabledEditSubdomain = !enabledEditSubdomain"
                        ></v-btn>
                    </div>
                  </div>
                </div>
                <v-text-field
                    v-model="form.name"
                    placeholder="Nombre de la institución"
                    class="py-2"
                    density="compact"
                    variant="outlined"
                    :rules="rules.name"
                  ></v-text-field>
              </v-col>
              <v-col cols="12"  md="3" class="py-0" xs="12">
                <div class="text-subtitle-2 text-medium-emphasis pb-2">Código modular:
                  <Required />
                </div>
                <v-text-field
                    v-model="form.modularCode"
                    placeholder="Código modular"
                    class="py-2"
                    density="compact"
                    variant="outlined"
                    :rules="rules.code"
                  ></v-text-field>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="4" xs="12"  class="py-0">
                <div class="text-subtitle-2 text-medium-emphasis">Dirección:
                  <Required />
                </div>
                <v-text-field
                    v-model="form.address"
                    placeholder="Dirección"
                    class="py-2"
                    density="compact"
                    variant="outlined"
                    :rules="rules.address"
                  ></v-text-field>
              </v-col>

              <v-col cols="12" md="4" xs="12"  class="py-0">
                <div class="text-subtitle-2 text-medium-emphasis">Ruc:
                  <Required />
                </div>
                <v-text-field
                    v-model="form.ruc"
                    placeholder="Ruc"
                    class="py-2"
                    density="compact"
                    variant="outlined"
                    :rules="rules.ruc"
                  ></v-text-field>
              </v-col>

              <v-col cols="12" md="4" xs="12"   class="py-0">
                <div class="text-subtitle-2 text-medium-emphasis">Tipo:
                  <Required />
                </div>
                <v-select
                  :items="[InstitutionType.PUBLICA,InstitutionType.PRIVADA]"
                  v-model="form.typeManagement!"
                  density="compact"
                  variant="outlined"
                  placeholder="Tipo"
                  class="py-2"
                  :rules="rules.typeManagement"
                ></v-select>
              </v-col>
            </v-row>

            <v-row>
              <v-col cols="12" md="4" xs="12"   class="py-0">
                <div class="text-subtitle-2 text-medium-emphasis">Departamento:
                  <Required />
                </div>
                  <v-select
                    :items="departaments"
                    v-model="form.department"
                    density="compact"
                    variant="outlined"
                    placeholder="Departamento"
                    class="py-2"
                    :rules="rules.department"
                  ></v-select>
              </v-col>
              <v-col cols="12" md="4" xs="12"  class="py-0">
                <div class="text-subtitle-2 text-medium-emphasis">Provincia:
                  <Required />
                </div>
                  <v-select
                    :items="provinces"
                    v-model="form.province"
                    density="compact"
                    variant="outlined"
                    placeholder="Provincia"
                    label="Seleccionar "
                    :disabled="form.department === ''"
                    :rules="rules.province"
                    class="py-2"
                  ></v-select>
              </v-col>
              <v-col cols="12" md="4" xs="12" class="py-0">
                <div class="text-subtitle-2 text-medium-emphasis">Distrito:
                  <Required />
                </div>
                  <v-select
                    :items="districts"
                    v-model="form.district"
                    density="compact"
                    variant="outlined"
                    :disabled="form.province === ''"
                    placeholder="Distrito"
                    :rules="rules.district"
                    class="py-2"
                  ></v-select>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <div class="d-flex justify-end">
              <v-btn
                @click="emit('close')"
                variant="tonal"
              >
                Cancelar
              </v-btn>

              <v-btn
                type="submit"
                color="var(--login-blue-color)"
                variant="tonal"
                :loading="spinForm"
              >
                {{ disabledEditSubdomain ? 'Actualizar' : 'Registrar' }}
              </v-btn>
            </div>
          </v-card-actions>
      </v-card>
    </v-form>
      <Overlay
        :loader="loading"
      >
        <Progress
          :loading="true"
          :title=" `
            <span class='text-white font-weight-medium'>
              consultando ...
            </span>
          `"
          :color="'blue'"
        />
      </Overlay>
      <Overlay
        :loader="spinForm"
      >
        <template #default>
          <Progress
            v-if="!disabledEditSubdomain"
            :loading="true"
            :title=" `
              <span class='text-white font-weight-medium'>
                Espere, estamos creando la institución 
                <br>
                esto puede tardar unos minutos ...
              </span>
            `"
            :color="'blue'"
          />
          <Progress
            v-if="disabledEditSubdomain"
            :loading="true"
            :title=" `
              <span class='text-white font-weight-medium'>
                Actualizando datos de la institución ...
              </span>
            `"
            :color="'blue'"
          />
        </template>
      </Overlay>
    </ModalBasic>
  </template>
<script setup lang="ts">
import ModalBasic from '@/common/components/Modal.vue'
import Overlay from '@/common/components/Overlay.vue'
import Progress from '@/common/components/Progress.vue'
import Required from '@/common/components/InputRequired.vue'
import { ref, watch, computed } from 'vue';
import { InstitutionForm } from '../domain/Institution';
import { onMounted } from 'vue';
import { Ubigeo } from '../domain/ubigeo';
import institution from '../services/institution';
import { modalError } from '@/common/util/modal.service';
import { Institution } from '../domain/Institution';
import { InstitutionType} from '@/modules/private/institution/enum/enums'
import { toastSuccess } from '@/common/util/toast.service';
import { ResponseData } from '@/common/http/response'
    const props = defineProps<{
      show:boolean
      item?: Institution
    }>()
  
    const loading = ref(false)
    const spinExistsSubdomain = ref(false)
    const spinForm = ref(false)
    const disabledEditSubdomain = ref(false)
  
    const emit = defineEmits<{
        (e: 'close'): void,
        (e:'submit',{body,createdAt}:{body:Institution,createdAt:boolean}) : void
    }>()

    const titleModal = ref('REGISTRAR NUEVA INSTITUCIÓN')
    const ubigeo = ref<Ubigeo[]>()
    const domain = ref<string>('.latinaeduca.com')
    const existsSubdomain = ref(false)
    const enabledEditSubdomain = ref(false)

    const form = ref<InstitutionForm>({
      modularCode : '',
      ruc:'',
      name:'',
      typeManagement:InstitutionType.PUBLICA,
      department:null,
      province:null,
      district:null,
      address:'',
      subdomain: '' 
    })

    const formValid = ref(false)

    const rules = ref({
      name: [
        (value: string) => !!value || 'Nombre es requerido.'
      ],
      code: [
        (value: string) => !!value || 'Código modular es requerido.'
      ],
      address: [
        (value: string) => !!value || 'Dirección es requerido.'
      ],
      ruc: [
        (value: string) => !!value || 'Ruc es requerido.'
      ],
      department: [
        (value: string) => !!value || 'Despartamento es requerido.'
      ],
      province: [
        (value: string) => !!value || 'Provincia es requerido.'
      ],
      district: [
        (value: string) => !!value || 'Distrito es requerido.'
      ],
      typeManagement : [
      (value: string) => !!value || 'Tipo de institución es requerido.'
      ]
    })

    let searchTimeout: NodeJS.Timeout | null = null

    const departaments = computed(() => {
      if (!ubigeo.value) return []
      return [...new Set(ubigeo.value!.map(item => item.department))]
    })

    const provinces = computed(() => {
      if (!ubigeo.value) return []
      if (!form.value.department) return []
      return [...new Set(ubigeo.value.filter(item => item.department === form.value.department).map(item => item.province))]
    })

    const districts = computed(() => {
      if (!ubigeo.value) return []
      if (!form.value.province) return []
      return [...new Set(ubigeo.value.filter(item => item.province === form.value.province).map(item => item.district))]
    })


    const submit = async () => {
      if (!formValid.value) {
        modalError("Debe completar los campos requeridos.")
        return
      }
      spinForm.value = true
      try {
        spinForm.value = true
        let messageToast = 'Institución creada correctamente.'
        let query :ResponseData<Institution>; 
        let createdAt = false;
        if (props.item) {
          query =  await institution.update(form.value)
          messageToast = "Institución actualizada correctamente."
        } else {
          query = await institution.create(form.value)
          createdAt = true;
        }
        const {data,success,message} = query
        if (!success) {
          modalError(message)
          return
        }
        toastSuccess(messageToast)
        emit('submit',{
          body:data,
          createdAt
        })
      } catch (error) {
        modalError((error as any).message)
      } finally {
        spinForm.value = false
      }
    }

    const config = async () => {
      try {
        loading.value = true
        const {data} = await institution.config()
        ubigeo.value = data.ubigeo
        domain.value = '.' + data.domain
      } catch (error) {
        modalError((error as any).message)
      } finally {
        loading.value = false
      }
    }

    const checkSubdomain = async (subdomain:string) => {
      try {
        spinExistsSubdomain.value = true
        const {data} = await institution.existSubdomain(subdomain)
        if (data) {
          modalError("Ya se encuentra registrado el subdominio " + subdomain)
          return
        }
        existsSubdomain.value = data
        form.value.subdomain = subdomain
      } catch (error) {
        modalError((error as any).message)
      } finally {
        spinExistsSubdomain.value = false
      }
    }

    const  generateSubdomain = (name:string) =>  {
      const subdomain = name.toLowerCase().trim().replace(/\s+/g, '-');
      const cleanSubdomain = subdomain.replace(/[^a-z0-9-]/g, '').trim();
      return cleanSubdomain
    }

    watch(() => form.value.name,async (newVal) => {
      if (!newVal) {
        form.value.subdomain = 'subdominio';
        return
      }

      if (searchTimeout) {
        clearTimeout(searchTimeout)
        searchTimeout = null
      }
      if (disabledEditSubdomain.value) return 
      searchTimeout = setTimeout(async () => {
        const subdomain = generateSubdomain(newVal) 
          await checkSubdomain(subdomain)
      },750)

    })
    
    watch(() => form.value.department,async () => {
      form.value.province = null
      form.value.district = null
    })

    watch(() => form.value.province,async () => {
      form.value.district = null
    })

    const patchForm  = () => {
      if (!props.item) return

      const {id, modularCode, ruc,name, typeManagement, department, province, district, address, subdomain} = props.item
      form.value = {
        id,
        modularCode,
        ruc,
        name,
        typeManagement:typeManagement as  InstitutionType,
        department,
        address,
        province:null,
        district:null,
        subdomain
      }

      setTimeout(() => {
        form.value.province = province
      },800)

      setTimeout(() => {
        form.value.district = district
      },900)
    }

    onMounted(async () => {
      if (props.item) {
        titleModal.value = 'EDITAR INSTITUCIÓN'
        disabledEditSubdomain.value = true
      }
      await config()
      patchForm()
    })

</script>
  