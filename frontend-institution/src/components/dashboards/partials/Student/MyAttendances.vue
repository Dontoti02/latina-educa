<script setup lang="ts">
import VueApexCharts from 'vue3-apexcharts'
import { useDisplay, useTheme } from 'vuetify/lib/framework.mjs'
import { hexToRgb } from '@/@layouts/utils'
import type { Attendance } from '@/models/dashboard'
import type { SessionDTO } from '@/models/login'

const props = defineProps<{
  attendances: Attendance[]
  user: SessionDTO | null
}>()

const items = ref([
  {
    label: 'Asistencias',
    color: 'success',
    icon: 'tabler-circle-check',
    key: 'attended',
  },
  {
    label: 'Tardanzas',
    color: 'warning',
    icon: 'tabler-clock',
    key: 'late',
  },
  {
    label: 'Faltas',
    color: 'error',
    icon: 'tabler-circle-x',
    key: 'absence',
  },
])

const vuetifyTheme = useTheme()
const display = useDisplay()

const series = ref([0, 0, 0])
const courseSelected = ref<Attendance>()

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
      parentHeightOffset: 0,
      type: 'donut',
    },
    labels: ['Asistencias', 'Tardanzas', 'Faltas'],
    colors: [
      chartColors.donut.series1,
      chartColors.donut.series2,
      chartColors.donut.series3,
    ],
    stroke: {
      width: 0,
    },
    dataLabels: {
      enabled: false,
      formatter(val: string) {
        return `${parseInt(val)}%`
      },
    },
    legend: {
      show: false,
    },
    tooltip: {
      theme: false,
    },
    grid: {
      padding: {
        top: 0,
        bottom: -10,
        right: -20,
        left: -20,
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
          chart: { width: 200, height: 160 },
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

const getMenuList = computed(() => {
  if (!props.attendances)
    return []

  return props.attendances.map((attendance, index) => {
    return {
      title: attendance.course,
      value: index,
    }
  })
})

const changeCourse = (data: number) => {
  courseSelected.value = props.attendances[data]
  series.value = [
    courseSelected.value.attended.value,
    courseSelected.value.late.value,
    courseSelected.value.absence.value,
  ]
}

onMounted(() => {
  if (props.attendances.length > 0)
    changeCourse(0)
})
</script>

<template>
  <VCard
    :title="user?.role.id === 3 ? 'Asistencia por curso' : 'Promedio de asistencia por curso'"
    :subtitle="courseSelected?.course"
  >
    <template #append>
      <div
        v-if="attendances.length > 0"
        class="mt-n4 me-n2"
      >
        <MoreBtn
          :menu-list="getMenuList"
          @change="changeCourse($event[0])"
        />
      </div>
    </template>
    <template v-if="attendances.length > 0">
      <VCardText>
        <VRow>
          <VCol
            cols="12"
            class="d-flex justify-center"
          >
            <VueApexCharts
              v-if="courseSelected"
              :options="chartOptions"
              :series="series"
              :height="210"
              :width="230"
            />
            <VueApexCharts
              v-if="courseSelected"
              ref="chartRef"
              :key="themeKey"
              :options="chartOptions"
              :series="series"
              :height="210"
              :width="230"
            />
          </VCol>
        </VRow>
        <VRow
          class="mt-12"
          no-gutters
        >
          <template
            v-for="(item, index) in items"
            :key="`item-${index}`"
          >
            <VCol cols="auto">
              <div class="d-flex align-center mb-3">
                <VAvatar
                  :color="item.color"
                  variant="tonal"
                  :size="24"
                  rounded
                  class="me-2"
                >
                  <VIcon
                    size="18"
                    :icon="item.icon"
                  />
                </VAvatar>

                <span>{{ item.label }}</span>
              </div>

              <template v-if="courseSelected">
                <h5 class="text-h5">
                  {{ courseSelected[item.key].value }}
                </h5>
                <span class="text-sm text-disabled">{{ courseSelected[item.key].percentage }}%</span>
              </template>
            </VCol>

            <VCol v-if="index < items.length - 1">
              <div class="d-flex flex-column align-center justify-center h-100">
                <VDivider
                  vertical
                  class="mx-auto"
                />
              </div>
            </VCol>
          </template>
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
