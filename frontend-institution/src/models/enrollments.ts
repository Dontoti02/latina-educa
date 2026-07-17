import type { AcademicPeriod } from './academic-periods'
import type { StudyProgram } from './schedules'

export interface Enrollment {
  id: number
  course: string
  teacher: string | null
  shift: string
  status: string
  registration_date: string
}

export interface EnrollmentFormStudent {
  period_id: number
}

export interface EnrollmentFormSecretary {
  period_id: number | null
  person_id: number | null
}
export interface EnrollmentStudentsForm {
  period_id: number | null
  study_program_id: number | null
}

export interface EnrollmentStudents {
  id: number
  names: string
  document_number: string
}

export interface EnrollmentFilters {
  periods: AcademicPeriod[]
  study_programs: StudyProgram[]
}
