import type { CalendarApi, CalendarOptions, EventApi, EventSourceFunc } from '@fullcalendar/core'
import interactionPlugin from '@fullcalendar/interaction'
import timeGridPlugin from '@fullcalendar/timegrid'
import type { Store } from 'pinia'
import type { SessionStoreModel } from '@/common/store/model'
import { ToastService } from '@/common/util/toast.service'
import type { AssignationSelected, Schedule, ScheduleFormByClassroom } from '@/models/schedules'
import { ScheduleService } from '@/services/schedules.service'

export const blankSchedule: Schedule = {
  id: undefined,
  days: [{
    id: 0,
    day: 1,
    hour_start: '',
    hour_end: '',
  }],
  course: {
    id: 0,
    name: '',
  },
  teacher: null,
  cycle: {
    id: 0,
    name: '',
  },
  section: {
    id: undefined,
    name: '',
  },
}

const allDays = [0, 1, 2, 3, 4, 5, 6]

export const useScheduleCalendar = (
  schedule: Ref<Schedule>,
  openModalEvent: Ref<boolean>,
  openAssignTeacherModal: Ref<boolean>,
  formByClassroom: Ref<ScheduleFormByClassroom>,
  notCurrentPeriod: ComputedRef<boolean>,
  daysAvailable: Ref<number[]>,
  startTime: string,
  endTime: string,
  assignationSelected: Ref<AssignationSelected | null>,
  session: Store<'session', SessionStoreModel>,
) => {
  // 👉 Calendar template ref
  const refCalendar = ref()

  // Schedule Colors
  const scheduleClasses = [
    'primary',
    'success',
    'error',
    'warning',
    'info',
    'blue-light',
    'blue-dark',
    'green-light',
    'green-dark',
    'red-light',
    'red-dark',
    'orange-light',
    'orange-dark',
    'cyan-light',
    'cyan-dark',
    'purple-light',
    'purple-dark',
    'yellow-light',
    'yellow-dark',
    'pink-light',
    'pink-dark',
    'brown-light',
    'brown-dark',
    'gray-light',
    'gray-dark',
  ]

  let classroomsWithColors: Array<{ id: number; color: string }> = []

  // 👉 Calendar data
  const loadingCalendarData = ref<boolean>(false)
  const hiddenDays = allDays.filter(day => !daysAvailable.value.includes(day))

  // ℹ️ Extract event data from event API
  const extractEventDataFromEventApi = (eventApi: EventApi): Schedule => {
    const {
      id,
      start,
      end,
      extendedProps: { course, cycle, section, classroomId, participants, teacher },
    } = eventApi

    return {
      id: classroomId,
      days: [{
        id: +id,
        day: start?.getDay() ?? 0,
        hour_start: start?.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) ?? '',
        hour_end: end?.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) ?? '',
      }],
      course,
      cycle,
      section,
      participants,
      teacher,
    }
  }

  // 👉 Fetch events
  const fetchEvents: EventSourceFunc = (info, successCallback) => {
    // If there's no info => Don't make useless API call
    if (!info)
      return

    loadingCalendarData.value = true
    ScheduleService.getSchedules(formByClassroom.value)
      .then(r => {
        classroomsWithColors = []
        successCallback((r.data || []).flatMap((e: Schedule) =>
          (e.days || []).map(day => ({
            id: day.id.toString(),
            daysOfWeek: [day.day],
            startTime: `${day.hour_start}`,
            endTime: `${day.hour_end}`,
            title: e.course.name,
            extendedProps: {
              classroomId: e.id,
              course: e.course,
              cycle: e.cycle,
              section: e.section,
              participants: e.participants,
              teacher: e.teacher,
            },
          })),
        ))
      })
      .catch(e => {
        console.error('Error occurred while fetching calendar events', e)
        ToastService.error('Ocurrió un error al cargar los eventos del calendario. Intente nuevamente.')
      }).finally(() => {
        loadingCalendarData.value = false
      })
  }

  // 👉 Calendar API
  const calendarApi = ref<null | CalendarApi>(null)

  // 👉 refetch events
  const refetchEvents = () => {
    calendarApi.value?.refetchEvents()
  }

  // 👉 Calendar options
  const calendarOptions = {
    plugins: [timeGridPlugin, interactionPlugin],

    // height: '35rem',

    height: 'auto',
    initialView: 'timeGridWeek',
    headerToolbar: false,
    allDaySlot: false,
    locale: 'es',
    weekNumbers: false,
    fixedWeekCount: false,
    dayHeaderFormat: { weekday: 'long' },
    slotLabelFormat: {
      hour: 'numeric',
      omitZeroMinute: false,
      hour12: true,
      hourCycle: 'h12',
      omitCommas: true,
      meridiem: 'lowercase',
    },
    slotMinTime: `${startTime}:00`,
    slotMaxTime: `${endTime}:00`,
    hiddenDays,
    events: fetchEvents,
    eventOverlap: false,
    slotEventOverlap: false,

    eventContent(arg) {
      const { timeText, event: { title, extendedProps: { section, teacher, course, classroomId } } } = arg

      const html = `
      <div class="fc-event-main-frame">
        <div class="fc-event-time">${timeText}</div>
        <div class="fc-event-title-container">
      <div class="fc-event-title fc-sticky">${title}</div>
      <div>Sección ${section.name}</div>
      ${teacher
        ? `<div style="text-transform: capitalize;">
            Profesor: ${teacher.name.toLowerCase()}
          </div>
          ${session.isSecretary()
          ? `
          <button 
            class="btn btn-sm btn-primary assign-teacher" 
            data-course-id="${course.id}"
            data-section-id="${section.id}"
            data-classroom-id="${classroomId}"
            data-teacher-id="${teacher.id}"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              xmlns:xlink="http://www.w3.org/1999/xlink" 
              aria-hidden="true" 
              role="img" 
              tag="i" 
              class="v-icon notranslate v-theme--light v-icon--size-default iconify iconify--tabler" 
              width="1em" 
              height="1em" 
              viewBox="0 0 24 24"
            >
              <g fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5">
                <path d="M7 7H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2v-1"></path>
                <path d="M20.385 6.585a2.1 2.1 0 0 0-2.97-2.97L9 12v3h3l8.385-8.415zM16 5l3 3"></path>
              </g>
            </svg>  
          </button>
          `
          : ''}`
        : session.isSecretary()
          ? `<button 
            class="btn btn-sm btn-primary assign-teacher" 
            data-course-id="${course.id}"
            data-section-id="${section.id}"
            data-classroom-id="${classroomId}"
            data-teacher-id="-1"
          >Asignar profesor</button>`
          : ''}
        </div>
      </div>
      `

      return { html }
    },
    eventDidMount(info) {
      const assignTeacherButtons = info.el.querySelectorAll('.assign-teacher')

      assignTeacherButtons.forEach(button => {
        button.addEventListener('click', event => {
          event.stopPropagation()

          if (notCurrentPeriod.value || loadingCalendarData.value)
            return

          if (button) {
            const courseId = parseInt(button.getAttribute('data-course-id'))

            // const sectioassignationSelectednId = parseInt(button.getAttribute('data-section-id'))
            const classroomId = parseInt(button.getAttribute('data-classroom-id'))
            const teacherId = parseInt(button.getAttribute('data-teacher-id'))

            assignationSelected.value = {
              courseId,
              classroomId,
              teacherId,
            }
            openAssignTeacherModal.value = true
          }

        // Ahora puedes usar teacherId para hacer acciones con él
        })
      })
    },

    dateClick(info) {
      if (notCurrentPeriod.value || loadingCalendarData.value)
        return

      const end = new Date(info.date)

      end.setHours(end.getHours() + 2)

      schedule.value = {
        ...blankSchedule,
        days: [{
          id: 1,
          day: info.date.getDay(),
          hour_start: info.date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
          hour_end: end.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }),
        }],
      }

      openModalEvent.value = true
    },

    eventClassNames({ event: calendarEvent }) {
      const id = calendarEvent._def.extendedProps.classroomId
      let color

      // Check if the classroom already has a color assigned
      const existingClassroom = classroomsWithColors.find(classroom => classroom.id === id)
      if (existingClassroom) {
        color = existingClassroom.color
      }
      else {
        // Find a color class that is not being used
        const unusedcolor = scheduleClasses.find(colorClass => !classroomsWithColors.some(classroom => classroom.color === colorClass))
        if (unusedcolor) {
          color = unusedcolor
        }
        else {
          // If all color classes are being used, find the one that is being used the least
          const colorUsage = scheduleClasses.map(colorClass => ({
            color: colorClass,
            usage: classroomsWithColors.filter(classroom => classroom.color === colorClass).length,
          }))

          colorUsage.sort((a, b) => a.usage - b.usage)
          color = colorUsage[0].color
        }

        // Assign the color class to the classroom
        classroomsWithColors.push({ id, color })
      }

      return [
        // Background Color
        'custom-event-overflow',
        `schedule-color-${color}`,
      ]
    },

    eventClick({ event: clickedEvent }) {
      if (notCurrentPeriod.value || loadingCalendarData.value)
        return

      schedule.value = extractEventDataFromEventApi(clickedEvent)
      openModalEvent.value = true
    },
  } as CalendarOptions

  // 👉 onMounted
  // onMounted(() => {
  // calendarApi.value = refCalendar.value.getApi()
  // })

  return {
    refCalendar,
    refetchEvents,
    calendarOptions,
    calendarApi,
    loadingCalendarData,
  }
}
