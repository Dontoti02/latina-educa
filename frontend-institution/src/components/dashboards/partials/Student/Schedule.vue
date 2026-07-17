<script setup lang="ts">
import type { CalendarOptions } from '@fullcalendar/core'
import timeGridPlugin from '@fullcalendar/timegrid'
import FullCalendar from '@fullcalendar/vue3'
import { VCardText } from 'vuetify/lib/components/index.mjs'
import { ScheduleService } from '@/services/schedules.service'
import type { Schedule } from '@/models/dashboard'

interface CustomEvent {
  id: string
  title: string
  start: string
  end: string
  backgroundColor: string
  textColor: string
  extendedProps: {
    section: string
    cycle: string
  }
}

const props = defineProps<{
  schedule: Schedule[]
}>()

const refCalendar = ref()
const tooltip = ref()
const loading = ref(true)
const colors = ref(['#F44336', '#795548', '#673AB7', '#3F51B5', '#2196F3', '#009688', '#4CAF50', '#607D8B', '#9C27B0'])
const selectedEvent = ref({ title: '', cycle: '', section: '', color: '', start: '', end: '' })

const calendarOptions = {
  plugins: [timeGridPlugin],
  locale: 'es',
  slotLabelFormat: {
    hour: 'numeric',
    omitZeroMinute: false,
    hour12: true,
    hourCycle: 'h12',
    omitCommas: true,
    meridiem: 'lowercase',
  },
  slotMinTime: '07:00',
  slotMaxTime: '18:00',
  initialView: 'timeGridWeek',
  headerToolbar: false,
  allDaySlot: false,
  weekNumbers: false,
  fixedWeekCount: false,
  dayHeaderFormat: { weekday: 'long' },
  hiddenDays: [0],
  height: 'auto',
  nowIndicator: true,
  events: [],
  firstDay: 1,
  eventMouseEnter: e => {
    const targetElement = e.jsEvent.target as HTMLElement

    selectedEvent.value = {
      title: e.event.title,
      cycle: e.event.extendedProps.cycle,
      section: e.event.extendedProps.section,
      color: e.event.backgroundColor,
      start: e.event.start!.toTimeString().slice(0, 5),
      end: e.event.end!.toTimeString().slice(0, 5),
    }

    targetElement.parentElement?.appendChild(tooltip.value)
    tooltip.value.style.display = 'block'
  },
  eventMouseLeave: () => {
    tooltip.value.style.display = 'none'
  },
} as CalendarOptions

// const reduceSchedules = () => {
//   return [...new Set(props.schedule.map(event => event.title))]
//     .map((title, index) => {
//       return {
//         title,
//         color: colors.value[index % colors.value.length],
//       }
//     })
// }

const convertSchedule = () => {
  // const arr = reduceSchedules()

  const now = new Date()

  now.setDate(now.getDate() - now.getDay())

  console.log(now)

  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0') // Months are 0-based, so we add 1

  // 2024-05-21T10:00:00
  const events: CustomEvent[] = []

  props.schedule.forEach((e, index) => {
    const aux = e.days.map(day => {
      return {
        id: `${day.id}`,
        title: e.course.name,
        start: `${year}-${month}-${now.getDate() + day.day}T${day.hour_start}:00`,
        end: `${year}-${month}-${now.getDate() + day.day}T${day.hour_end}:00`,
        backgroundColor: colors.value[index],
        textColor: '#ffffff',
        extendedProps: {
          section: `${e.section.name}`,
          cycle: `${e.cycle.name}`,
        },
      }
    })

    // console.log(aux)

    events.push(...aux)
  },
  )

  // const events = props.schedule.map(event => {
  //   return {
  //     title: event.title,
  //     start: `${year}-${month}-${now.getDate() + event.day}T${event.start}:00`,
  //     end: `${year}-${month}-${now.getDate() + event.day}T${event.end}:00`,
  //     backgroundColor: arr.find(item => item.title === event.title)?.color || '#ff0000',
  //     textColor: '#ffffff',
  //   }
  // })

  console.log(events)
  calendarOptions.events = events
  loading.value = false
}

const getScheduleRange = () => {
  loading.value = true
  ScheduleService.getFilters()
    .then(response => {
      const weekDays = [0, 1, 2, 3, 4, 5, 6]
      const allowDays = Object.keys(response.data.days).map(Number)
      const weekdaysNotAllowed = weekDays.filter(day => !allowDays.includes(day))

      calendarOptions.hiddenDays = weekdaysNotAllowed
      calendarOptions.slotMinTime = response.data.hours.start
      calendarOptions.slotMaxTime = response.data.hours.end
      console.log(response.data)
    }).finally(() => {
      loading.value = false
    })
}

onMounted(() => {
  convertSchedule()
  getScheduleRange()
})
</script>

<template>
  <VCard
    style="position: relative;"
    title="Horario"
  >
    <VCardText>
      <div
        v-if="!loading"
        style="height: 25rem; overflow-y: auto;"
      >
        <FullCalendar
          ref="refCalendar"
          :options="calendarOptions"
        />
      </div>
    </VCardText>
    <div
      ref="tooltip"
      style="display: none;position:absolute; top: 10px; right: -4rem; width: 8rem;"
    >
      <!-- color="primary" -->
      <VCard
        variant="elevated"
        style="z-index: 10;"
      >
        <VCardText class="text-caption px-4 py-2">
          <VChip
            :color="selectedEvent.color"
            class="text-caption mb-2"
          >
            {{ selectedEvent.start }} - {{ selectedEvent.end }}
          </VChip>
          <!-- <div>{{ selectedEvent.start }} - {{ selectedEvent.end }} </div> -->
          <div>{{ selectedEvent.title }}</div>
          <div class="text-caption">
            {{ selectedEvent.cycle }} - {{ selectedEvent.section }}
          </div>
          <!--
            <div>{{ selectedEvent.cycle }}</div>
            <div>{{ selectedEvent.section }}</div>
          -->
        </VCardText>
      </VCard>
    </div>
  </VCard>
</template>

<style lang="scss">
@use "@core/scss/template/libs/full-calendar";

.calendars-checkbox {
  .v-label {
    color: rgba(var(--v-theme-on-surface), var(--v-high-emphasis-opacity));
    opacity: var(--v-high-emphasis-opacity);
  }
}

.calendar-add-event-drawer {
  &.v-navigation-drawer:not(.v-navigation-drawer--temporary) {
    border-end-start-radius: 0.375rem;
    border-start-start-radius: 0.375rem;
  }
}

.calendar-date-picker {
  display: none;

  +.flatpickr-input {
    +.flatpickr-calendar.inline {
      border: none;
      box-shadow: none;

      .flatpickr-months {
        border-block-end: none;
      }
    }
  }

  & ~ .flatpickr-calendar .flatpickr-weekdays {
    margin-block: 0 4px;
  }
}

.v-application .fc .fc-header-toolbar{
    margin: 0;
    margin-bottom: 10px;
}
</style>
