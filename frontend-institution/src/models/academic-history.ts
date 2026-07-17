import type { StudyProgram } from './schedules'

export interface AcademicHistory {
  id: number
  name: string
  semester_average: number
  accumulated_average: number
  courses: {
    id: number
    name: string
    score: number
  }[]
}

export interface AcademicHistoryFormSecretary {
  person_id: number
}

export interface AcademicHistoryStudentsForm {
  study_program_id: number
}

export interface AcademicHistoryStudents {
  id: number
  names: string
  document_number: string
}

export interface AcademicHistoryFilters {
  study_programs: StudyProgram[]
}
