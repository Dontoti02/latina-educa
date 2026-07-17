export interface StudyProgram {
  id: number
  name: string
}

export interface Cycle {
  id: number
  name: string
}

interface Days {
  [key: string]: string
}

interface Hours {
  start: string
  end: string
}

export interface ScheduleFilters {
  study_programs: StudyProgram[]
  cycles: Cycle[]
  days: Days
  hours: Hours
  cycles_by_study_program: Record<number, number[]>
}

export interface Schedule {
  id: number
  course: {
    id: number
    name: string
  }
  section: {
    id: number
    name: string
  }
  teacher: {
    id: number
    name: string
  } | null
  cycle: {
    id: number
    name: string
  }
  days: {
    id: number
    day: number
    hour_start: string
    hour_end: string
  }[]
  participants?: {
    id: number
    person_id: number
    names: string
    email: string
  }[]
}

export interface ScheduleUpdate {
  day: number
  hour_start: string
  hour_end: string
}

export interface ScheduleCreate {
  classroom_id: number
  day: number
  hour_start: string
  hour_end: string
}

export interface ScheduleFormByClassroom {
  period_id: number
  study_program_id: number
  cycle_id: number
}

export interface ClassroomForSchedule {
  id: number
  name: string
  sections: {
    id: number
    name: string
    classroom_id: number
    shift: 'MAÑANA' | 'TARDE' | 'NOCHE'
    hour_start: string
    hour_end: string
    teacher_id: number | null
  }[]
}

export interface TeacherForSchedule {
  id: number
  names: string
}

export interface AssignTeacherForm {
  person_id: number
  classroom_id: number
}

export interface AssignationSelected {
  courseId: number
  classroomId: number
  teacherId: number
}

export interface ScheduleFormByReportSecretary extends ScheduleFormByClassroom {
  person_id: number
  rol_id: number
}

export interface ScheduleFiltersForReport {
  id: number
  name: string
  persons: {
    id: number
    names: string
  }[]
}
