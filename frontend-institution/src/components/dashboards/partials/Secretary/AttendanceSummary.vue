<script setup lang="ts">
import VueApexCharts from 'vue3-apexcharts'
import { useDisplay, useTheme } from 'vuetify/lib/framework.mjs'
import { hexToRgb } from '@/@layouts/utils'
import type { StudyProgram, TopClassroom } from '@/models/dashboard'
import type { SessionDTO } from '@/models/login'
import { nextTick } from 'vue'

const props = defineProps<{
  careers: StudyProgram[]
  user: SessionDTO | null
}>()

const careerSelected = ref<StudyProgram>()
const courseSelected = ref<TopClassroom | null>(null)
const graphLoading = ref(false)
const xaxisLabels = ref(['Etq1']) 
const vuetifyTheme = useTheme()
const display = useDisplay()

const series = ref([{ data: [] }])

const themeKey = ref(0)
const chartRef = ref<typeof VueApexCharts | null>(null)

watch(() => vuetifyTheme.global.name.value, () => {
  themeKey.value++
})

watch(() => vuetifyTheme.global.name.value, async () => {
  await nextTick()
  chartRef.value?.chart?.updateOptions({ ...chartOptions.value }, true, true)
  window.dispatchEvent(new Event('resize'))
})

const chartOptions = computed(() => {
  const currentTheme = vuetifyTheme.current.value.colors
  const variableTheme = vuetifyTheme.current.value.variables
  const headingColor = `rgba(${hexToRgb(currentTheme['on-background'])},${variableTheme['high-emphasis-opacity']})`

  const chartColors = {
    donut: {
      series1: currentTheme.success,
      series2: currentTheme.warning,
      series3: currentTheme.error,
    },
  }

  return {
    chart: {
      id: 'attendanceChart',
      parentHeightOffset: 0,
      type: 'area',
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      categories: xaxisLabels.value,
      labels: {
        rotate: -45,
        trim: true,
        hideOverlappingLabels: true,
        show: false,
      },
      type: 'date',
    },
    yaxis: {
      min: 0,
      tickAmount: 3,
    },
    colors: [
      chartColors.donut.series1,
      chartColors.donut.series2,
      chartColors.donut.series3,
    ],
    legend: {
      show: false,
    },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 90, 100],
      },
    },
    stroke: {
      width: 0,
    },
    markers: {
      size: 6,
      strokeWidth: 3,
      strokeColors: '#fff',
      fillOpacity: 1,
      hover: {
        size: 8,
      },
    },
    dataLabels: {
      enabled: false,
      formatter(val: string) {
        return `${parseInt(val)}%`
      },
    },
    tooltip: {
      theme: false,
    },
    grid: {
      padding: {
        top: 0,
        bottom: -10,
      },
    },
    states: {
      hover: {
        filter: {
          type: 'none',
        },
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: {
            show: true,
            value: {
              fontSize: '1.375rem',
              fontFamily: 'Public Sans',
              color: headingColor,
              fontWeight: 600,
              offsetY: -15,
              formatter(val: string) {
                return `${parseInt(val)}%`
              },
            },
            name: {
              offsetY: 20,
              fontFamily: 'Public Sans',
            },
            total: {
              show: true,
              showAlways: true,
              color: currentTheme.secondary,
              fontSize: '.8125rem',
              label: 'Total',
              fontFamily: 'Public Sans',
            },
          },
        },
      },
    },
    responsive: [
      {
        breakpoint: display.thresholds.value.lg,
        options: {
          chart: { width: 330, height: 160 },
        },
      },
      {
        breakpoint: 420,
        options: {
          chart: { width: 150, height: 120 },
        },
      },
    ],
  }
})

const loadGraph = (e: TopClassroom | null) => {
  graphLoading.value = true
  series.value = [{
    data: e?.assistants
      .map(v => { return v.count }) ?? [],
  }]

  xaxisLabels.value = e?.assistants
    .map(v => { return v.date }) ?? []

  setTimeout(() => {
    graphLoading.value = false
  }, 100)
}

watch(careerSelected, e => {
  if (!e || e.top_classrooms.length === 0)
    courseSelected.value = null
  else
    courseSelected.value = e.top_classrooms[0]
})

watch(courseSelected, e => {
  loadGraph(e)
})

onMounted(() => {
  if (props.careers.length > 0) {
    careerSelected.value = props.careers[0]
    if (props.careers[0].top_classrooms.length > 0) {
      courseSelected.value = props.careers[0].top_classrooms[0]
      loadGraph(courseSelected.value)
    }
  }
})

const widthChart = computed(() => {
  return '100%'
})
</script>

<template>
  <VCard title="Promedio de asistencias">
    <template #subtitle>
      <div
        v-if="careers.length > 0"
        class=" me-n2"
        style="width: 100%;"
      >
        <AppSelect
          v-model="careerSelected"
          :items="careers"
          item-title="name"
          label="Carrera"
          placeholder="Selecciona una carrera"
          return-object
        />
        <AppSelect
          v-model="courseSelected"
          :items="careerSelected?.top_classrooms ?? []"
          item-title="name"
          label="Curso"
          placeholder="Selecciona un curso"
          return-object
        />
      </div>
    </template>
    <template v-if="courseSelected">
      <VCardText>
        <VRow>
          <VCol cols="12">
            <template v-if="courseSelected.assistants.length > 0">
              <VueApexCharts
                v-if="courseSelected && !graphLoading"
                ref="chartRef"
                :key="themeKey"
                type="area"
                height="300"
                :width="widthChart"
                :options="chartOptions"
                :series="series"
              />
            </template>
            <template v-else>
              <p class="text-center">
                No se han encontrado asistencias registradas
              </p>
            </template>
          </VCol>
        </VRow>
      </VCardText>
    </template>
    <p
      v-else
      class="text-center"
    >
      No se han encontrado asistencias registradas
    </p>
  </VCard>
</template>
