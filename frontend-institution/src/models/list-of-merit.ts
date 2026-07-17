export interface ListOfMeritFilters {
  periods: Period[]
  study_programs: StudyProgram[]
}
export interface Period {
  id: number
  name: string
}

export interface StudyProgram {
  id: number
  name: string
}

export interface StudentForListOfMerit {
  id: number
  names: string
  semester_average: string
  order: number
}
