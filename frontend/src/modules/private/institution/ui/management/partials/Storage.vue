<script setup lang="ts">
import VueApexCharts from 'vue3-apexcharts'
import { useTheme } from 'vuetify'
import { hexToRgb } from '@/common/util/global'
import { computed, onMounted, ref } from 'vue';
import { ResumenStorage } from '../../../domain/Institution';
import ModalResizeStorage from '../modals/ResizeStorage.vue';

const props = defineProps<{data:ResumenStorage}>()

const series = ref<number[]>([])

const vuetifyTheme = useTheme()

const modal = ref(false)

const  updateSeries = () => {
    const percentage = (props.data.chart.used / props.data.chart.total) * 100;
    series.value = [percentage];
}

onMounted(() => {
    updateSeries()
})

const progressColor = 'rgba(255, 76, 81)';
// const progressColor = 'rgba(0, 186, 209, 1)';

const chartOptions = computed(() => {
  const variableTheme = vuetifyTheme.current.value.variables

return {
    chart: {
      sparkline: {
        enabled: true,
      },
      parentHeightOffset: 0,
      type: 'radialBar',
    },
    colors: [progressColor],
    plotOptions: {
      radialBar: {
        offsetY: 0,
        startAngle: -90,
        endAngle: 90,
        hollow: {
          size: '65%',
        },
        track: {
            show:true,
          strokeWidth: '45%',
          background: `rgba(${hexToRgb(String(variableTheme['border-color']))},${variableTheme['border-opacity']})`,
        },
        dataLabels: {
            name: {
                fontSize: '12px',
                color:'gray',
                formatter: () => {
                    return 'de ' + props.data.chart.total + ' MB ('+ (props.data.chart.total/1024) + ' GB)'
                }
            },
          value: {
            show: true,
            fontSize: '20px',
            color: progressColor,
            fontWeight: 600,
            offsetY: -40,
            formatter: () => {
                return  props.data.chart.used + ' MB'
            }
          },
          total: {
            label: 'usado de ' + props.data.chart.total + ' MB ',
            fontSize: '12px',
            color:'gray',
            formatter: () => {
                return props.data.chart.total + ' MB'
            }
          }
        },
        barLabels : {
            enabled:true,
            formatter:() => {
                return 'hghhhh'
            }
        }
      },
    },
    grid: {
      show: true,
      padding: {
        bottom: 5,
      },
    },
    stroke: {
      lineCap: 'round',
    },
    labels: ['Progress'],
    responsive: [
      {
        breakpoint: 1442,
        options: {
          chart: {
            height: 140,
          },
          plotOptions: {
            radialBar: {
              dataLabels: {
                value: {
                  fontSize: '18px',
                },
              },
              hollow: {
                size: '60%',
              },
            },
          },
        },
      },
      {
        breakpoint: 1370,
        options: {
          chart: {
            height: 120,
          },
        },
      },
      {
        breakpoint: 1280,
        options: {
          chart: {
            height: 150,
          },
          plotOptions: {
            radialBar: {
              dataLabels: {
                value: {
                  fontSize: '18px',
                },
              },
              hollow: {
                size: '70%',
              },
            },
          },
        },
      },
      {
        breakpoint: 960,
        options: {
          chart: {
            height: 250,
          },
          plotOptions: {
            radialBar: {
              hollow: {
                size: '70%',
              },
              dataLabels: {
                value: {
                  fontSize: '18px',
                },
              },
            },
          },
        },
      },
    ],
  }
})

const colors = ['warning','info','error','indigo']

const emit = defineEmits<{
    (e:'reload',total:number) : void
}>()



const onReloadChart = (newLimitStorage:number) => {
  emit('reload',newLimitStorage)
  modal.value = false
}

const openModalResize = () => {
  modal.value = true
}
</script>

<template>
  <VCard title="Almacenamiento" class="text-indigo">
    <template v-slot:append>
      <v-menu
          transition="slide-y-transition"
      >
          <template v-slot:activator="{ props }">
              <v-btn
                  icon
                  variant="text"
                  v-bind="props"
              >
                  <v-icon> mdi-dots-vertical</v-icon>
              </v-btn>
          </template>
          <v-list>
              <v-list-item
                @click="openModalResize()"
              >
                  <template v-slot:prepend>
                      <v-icon :icon="'mdi-chart-donut'"></v-icon>
                  </template>
                  <v-list-item-title>Cambiar limite de espacio</v-list-item-title>
              </v-list-item>
          </v-list>
      </v-menu>
    </template>
    <VCardText class="d-flex text-center justify-space-between">
        <VueApexCharts
          :options="chartOptions"
          :series="series"
          type="radialBar"
          :height="250"
          :width="350"
        />
    </VCardText>
    <VCardActions>
        <VList class="card-list" style="width: 100%;">
            <VListItem
            v-for="(item,index) in props.data.detail"
            :key="item.name"
            >
            <template #prepend>
                <VAvatar
                    :color="colors[index]"
                    variant="tonal"
                    size="34"
                    rounded
                >
                    <VIcon :icon="item.icon" />
                </VAvatar>
            </template>

            <VListItemTitle class="font-weight-medium">
                {{ item.name }}
                <p class="font-weight-medium text-caption me-3">{{ item.count }}</p>
            </VListItemTitle>

            <template #append>
                <span :class="`text-primary`">{{ item.sizeMb }} MB</span>
            </template>
            </VListItem>
      </VList>
    </VCardActions>
  </VCard>

  <ModalResizeStorage 
    :show="modal"
    :storage="{
      institutionId:1,
      currentSpaceLimit:data.chart.total,
    }"
    @close="modal = false"
    @reload="onReloadChart($event)"
  />

</template>
