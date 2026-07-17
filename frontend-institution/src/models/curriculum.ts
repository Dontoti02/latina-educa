import type { StudyProgram } from './schedules'

export interface GetCurriculum {
  id: number
  name: string
  courses: {
    id: number
    name: string
  }[]
}

export interface GetCurriculumFilters {
  study_programs: StudyProgram[]
}

export interface CurriculumFormSecretary {
  study_program_id: number
}
