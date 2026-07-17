<script setup lang="ts">
import { ref } from 'vue';
import { ResumenInstitution } from '../../../domain/Institution';

const props = defineProps<{data:ResumenInstitution}>()

const list = ref([
    {
        name: 'Estudiantes',
        value: props.data.resumen.totalStudents,
        icon: 'mdi-account-school',
        color: 'primary'
    },
    {
        name: 'Docentes',
        value:  props.data.resumen.totalTeachers,
        icon: 'mdi-account-tie',
        color: 'success'
    },
    {
        name: 'Cursos',
        value: props.data.resumen.totalCourses,
        icon: 'mdi-google-classroom',
        color: 'info'
    },
    // {
    //     name: '',
    //     value: props.data.resumen.totalCourses,
    //     icon: 'mdi-google-classroom',
    //     color: 'info'
    // },
])

const className = (color:string) =>  "text-h5 font-weight-medium text-" + color
const classValue = (color:string) =>  "text-sm text-" + color

</script> 

<template>
    <VCard title="Resumen">
      <VCardText class="pt-2">
        <VRow>
          <VCol
            v-for="(item,index) in list"
            :key="index + 'resumen_institution'"
            cols="6"
            md="4"
          >
            <div class="d-flex align-center gap-4 px-2">
              <VAvatar
                :color="item.color"
                variant="tonal"
                size="42"
              >
                <VIcon :icon="item.icon" />
              </VAvatar>

              <div class="d-flex flex-column" style="width: 100%;padding: 0rem .4rem;">
                <span 
                  v-bind:class="className(item.color)"
                >
                  {{ item.value }}
                </span>
                <span v-bind:class="classValue(item.color)"
                >
                  {{ item.name }}
                </span>
              </div>
            </div>
          </VCol>
        </VRow>
      </VCardText>
    </VCard>
</template>