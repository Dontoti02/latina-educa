<script lang="ts" setup>
import { DEFAULT_JOB_OFFER_CREATE_FORM } from '@/components/JobOpportunities/utils/joboffer.utils';
import { FindJobOffer, JobOfferCreateForm } from '@/models/job-opportunities/job-offer';
import { VCard, VCol, VForm } from 'vuetify/lib/components/index.mjs';
import { JobOfferFiltersResponse } from '../../../../../models/job-opportunities/job-offer';
import { requiredValidator } from '@/@core/utils/validators';
import { QuillEditor } from '@vueup/vue-quill'
import { JobOpportunitiesJobOfferService } from '@/services/job-opportutines/job-offer';
import { toastError, toastSuccess } from '@/common/util/toast.service';
import { UbigeoService } from '@/common/services/ubigeo.service';
import { DateFormatting } from '@/utils/date-formatting';
import { VSkeletonLoader } from 'vuetify/lib/labs/components.mjs';
import AddMasterRecordButton from '../../maintainers/AddMasterRecordButton.vue';
import { JobOpportunitiesMasterTableConfig } from '@/config/job-opportunities.config';
import { toRef, reactive } from 'vue'

const props = defineProps<{
  filters: JobOfferFiltersResponse,
  loadingParams: boolean,
  item: FindJobOffer | null
}>()
const quillToolbar = [[{ size: ['small', false, 'large', 'huge'] }], ['bold', 'italic'], [{ list: 'bullet' }, { list: 'ordered' }], ['link', 'image']]
const formValid = ref(false);
let debounceTimeout: ReturnType<typeof setTimeout> | null = null
const formRef = ref<InstanceType<typeof VForm> | null>(null)
const form = ref<JobOfferCreateForm>(DEFAULT_JOB_OFFER_CREATE_FORM)
const loadingSubmit = ref(false)
const ubigeoService = UbigeoService;

// ref quilleditor
const editorDescriptionRef = ref<InstanceType<typeof QuillEditor> | null>(null)
const editorRequirementsRef = ref<InstanceType<typeof QuillEditor> | null>(null)
  const editorBenefitsRef = ref<InstanceType<typeof QuillEditor> | null>(null)

const departments = computed(() => {
  return ubigeoService.departments.map((department) => ({
    name: department.name,
    id: department.id
  }))
})


const provinces = computed(() => {
  if (!form.value.department) return []
  return ubigeoService.provincies[form.value.department].map((province) => ({
    name: province.name,
    id: province.id
  }))
})

watch(
  form,
  () => {
    if (debounceTimeout) clearTimeout(debounceTimeout)
    debounceTimeout = setTimeout(async () => {
      if (formRef.value) {
        const { valid } = await formRef.value.validate()
        formValid.value = valid
      }
    }, 200)
  },
  { deep: true }
)

const router = useRouter()

 const clearQuillEditors = () => {
  const editors = [
    editorDescriptionRef.value?.getQuill(),
    editorRequirementsRef.value?.getQuill(),
    editorBenefitsRef.value?.getQuill(),
  ]
  editors.forEach(editor => {
    if (editor) editor.setText('')
  })
}
const clearForm = () => {
  clearQuillEditors()
  formRef.value?.reset()
  form.value = {
    ...DEFAULT_JOB_OFFER_CREATE_FORM
  }
  
}
const onSubmit = async () => {
  try {
    loadingSubmit.value = true
    let query = null;
    if (props.item) {
      query = JobOpportunitiesJobOfferService.update(props.item.id, form.value)
    } else {
       query = JobOpportunitiesJobOfferService.create(form.value)
    } 
    const { success,message } =await query
    if (!success) {
      toastError(message)
      return
    }
    toastSuccess(message)
    clearForm()
    router.push({
      name: 'bolsa-laboral-panel-offers'
    })
  } catch (error) {
    if (error instanceof Error) {
      toastError(error.message)
      return
    }
    toastError(error as string)
  } finally {
    loadingSubmit.value = false
  }
}

const setFormOnUpdate = () => {
  if (!props.item) return
  form.value = {
    title: props.item.title,
    description: props.item.description,
    requirements: props.item.requirements,
    benefits: props.item.benefits,
    companyId: props.item.companyId,
    categoryId: props.item.categoryId,
    contractTypeId: props.item.contractTypeId,
    locationId: props.item.locationId,
    scheduleId:  props.item.scheduleId,
    salary: props.item.salary,
    salaryCurrency: props.item.salaryCurrency,
    address: props.item.address,
    department: props.item.department,
    province: props.item.province,
    country: props.item.country,
    publicationDate: DateFormatting.formatDateTimePickerComponent(props.item.publicationDate),
    attachments: [],
  }
}

const maxDate = computed(() => {
  return DateFormatting.formatDateTimePickerComponent()
})
watch(
  () => props.item,
  () => {
    setFormOnUpdate()
  },
  { immediate: true }
)

const masterRefs = reactive({
  category: toRef(props.filters, 'categories'),
  contract_type: toRef(props.filters, 'contractTypes'),
  location: toRef(props.filters, 'locations'),
  work_schedule: toRef(props.filters, 'schedules'),
  company: toRef(props.filters, 'companies'),
  salary_range: toRef(props.filters, 'salaryRanges'),
})

const handleRecordAdded = (tableKey: keyof typeof masterRefs, record: { id: number; name: string }) => {
  const list = masterRefs[tableKey]
  list.push(record)
}

onMounted(() => {

})
</script>
<template>
  <VCard class="my-2">
    <VForm ref="formRef" class="w-100" @submit.prevent="onSubmit">
      <VCardText class="px-4 pb-4 custom-form">
        <VRow v-if="props.loadingParams">
          <VCol cols="12">
            <VSkeletonLoader
              type="list-item-three-line,list-item-three-line,list-item-three-line,list-item-three-line" />
          </VCol>
        </VRow>

        <VRow v-else>
          <!-- Texto -->
          <VCol cols="12" md="9">
            <AppTextField v-model="form.title" :disabled="loadingSubmit" label="Título"
              prepend-inner-icon="tabler-letter-case" :rules="[requiredValidator]" />
          </VCol>
          <VCol cols="12" md="3">
            <AppDateTimePicker 
              v-model="form.publicationDate" 
              :disabled="loadingSubmit" 
              label="Fecha de publicación"
              :rules="[requiredValidator]" 
              :config="{
                dateFormat: 'Y-m-d H:i:s',
                maxDate: maxDate,
                timePicker : true,
              }" prepend-inner-icon="tabler-calendar-event"  
            />
          </VCol>
          <VCol cols="12" class="pb-4">
            <!-- add label -->
            <label>
              Descripción
            </label>
            <QuillEditor
              ref="editorDescriptionRef"
              v-model:content="form.description"
              theme="snow"
              id="editor-description"
              :toolbar="quillToolbar"
              content-type="html"
              placeholder="Descripción..."
              :read-only="loadingSubmit"
              :required="true"
              style="height: 10rem !important;"
            />
          </VCol>

            <VCol cols="6">
              <label>
                Requisitos
              </label>
              <QuillEditor
                ref="editorRequirementsRef"
                id="editor-requirements"
                v-model:content="form.requirements"
                theme="snow"
                :toolbar="quillToolbar"
                content-type="html"
                :read-only="loadingSubmit"
                placeholder="Requisitos"
                :required="true"
                style="height: 6rem !important;"
              />
          </VCol>

          <VCol cols="6">
              <label>
                Beneficios
              </label>
              <QuillEditor
                ref="editorBenefitsRef"
                id="editor-beneficios"
                v-model:content="form.benefits"
                theme="snow"
                :toolbar="quillToolbar"
                :read-only="loadingSubmit"
                content-type="html"
                placeholder="Beneficios"
                :required="true"
                style="height: 6rem !important;"
              />
          </VCol>

          <VCol cols="12" md="4">
            <AppSelect 
              v-model="form.contractTypeId" 
              :items="props.filters.contractTypes" 
              item-title="name"
              item-value="id" label="Tipo de contrato" 
              :disabled="loadingSubmit" 
              :rules="[requiredValidator]" 
            >
              <template #append-inner>
                <AddMasterRecordButton 
                  :tableKey="JobOpportunitiesMasterTableConfig.contract_type.key" 
                  @record-added="record => handleRecordAdded(JobOpportunitiesMasterTableConfig.contract_type.key, record)" 
                />
              </template>
            </AppSelect>
          </VCol>

          <VCol cols="12" md="4">
            <AppSelect 
              v-model="form.scheduleId" 
              :items="props.filters.schedules" 
              item-title="name" item-value="id"
              label="Jornada laboral" 
              :disabled="loadingSubmit" 
              :rules="[requiredValidator]"
            >
              <template #append-inner>
                <AddMasterRecordButton 
                  :tableKey="JobOpportunitiesMasterTableConfig.work_schedule.key" 
                  @record-added="record => handleRecordAdded(JobOpportunitiesMasterTableConfig.work_schedule.key, record)" 
                />
              </template>
            </AppSelect>
          </VCol>

          <VCol cols="12" md="2">
            <AppTextField v-model="form.salary" :disabled="loadingSubmit" label="Salario" type="number"
              :prepend-inner-icon="'mdi-cash'" :rules="[requiredValidator,
                (v:number) => {
                  if (form.salary && form.salary < 0) {
                    return 'El salario no puede ser menor a 0'
                  }
                  return true
                }
              ]" />
          </VCol>

          <VCol cols="12" md="2">
            <AppSelect v-model="form.salaryCurrency" :items="[{
              text: 'SOLES',
              value: 'SOL'
            }]" item-value="value" item-title="text" :disabled="loadingSubmit" label="Moneda"
              :rules="[requiredValidator]" />
          </VCol>

          <VCol cols="12" md="4">
            <AppSelect 
              v-model="form.locationId" 
              :items="props.filters.locations" 
              item-title="name" 
              item-value="id"
              label="Modalidad de trabajo" 
              :disabled="loadingSubmit" 
              :rules="[requiredValidator]" 
            >
              <template #append-inner>
                <AddMasterRecordButton 
                  :tableKey="JobOpportunitiesMasterTableConfig.location.key" 
                  @record-added="record => handleRecordAdded(JobOpportunitiesMasterTableConfig.location.key, record)" 
                />
              </template>
            </AppSelect>
          </VCol>

          <VCol cols="12" md="4">
            <AppSelect 
              v-model="form.department" 
              :items="departments" 
              item-title="name" 
              item-value="id"
              label="Departamento" 
              :disabled="loadingSubmit"
            />
          </VCol>

          <VCol cols="12" md="4">
            <AppSelect 
              v-model="form.province" 
              :items="provinces" 
              item-title="name" 
              item-value="id"
              label="Provincia" 
              :disabled="loadingSubmit || !form.department"
            />
          </VCol>

          <VCol cols="12" md="4">
            <AppTextField v-model="form.address" :disabled="loadingSubmit" label="Dirección"
              prepend-inner-icon="tabler-map-pin" />
          </VCol>
          <VCol cols="12" md="4">
            <AppSelect 
              v-model="form.categoryId" 
              :items="props.filters.categories" 
              item-title="name" 
              item-value="id"
              label="Categoría" 
              :disabled="loadingSubmit" 
              :rules="[requiredValidator]"
            >
              <template #append-inner>
                <AddMasterRecordButton 
                  :tableKey="JobOpportunitiesMasterTableConfig.category.key" 
                  @record-added="record => handleRecordAdded(JobOpportunitiesMasterTableConfig.category.key, record)" 
                />
              </template>
            </AppSelect>
          </VCol>

          <VCol cols="12" md="4" v-if="props.filters.isAdmin">
            <AppSelect v-model="form.companyId" :items="props.filters.companies" item-title="name" item-value="id"
              label="Empresa" :disabled="loadingSubmit" :rules="[props.filters.isAdmin ? requiredValidator : '']" />
          </VCol>

        </VRow>
      </VCardText>

      <VDivider />

      <VCardActions class="px-4 py-4">
        <VSpacer />
        <VBtn type="submit" 
        :loading="loadingSubmit" 
        :disabled="loadingSubmit || !formValid" 
        color="primary"
        >
          <VIcon left>mdi-save</VIcon>
          {{
            props.item ? 'ACTUALIZAR OFERTA LABORAL' : 'CREAR OFERTA LABORAL'
          }}
        </VBtn>
      </VCardActions>
    </VForm>
  </VCard>
</template>
