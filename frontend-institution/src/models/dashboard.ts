import { ContentItem } from "./courses"

export interface StudentDashboard {
  alerts: StudentAlerts
  summary: Summary[]
  courses: Course[]
  tasks: Assignments
  assistants: Attendance[]
  publications: Post[]
  schedule: Schedule[]
}

export interface StudentAlerts {
  classrooms: {
    id: number
    course: string
    absences: number
    total: number
  }[]
}

export interface Summary {
  title: string
  value: number | string
}

export interface Course {
  id: number
  name: string
  teacher?: string
  students?: number
  period?: string
}

export interface Assignments {
  pending: Assigment[]
  evaluated: Assigment[]
}

export interface Assigment {
  id: number
  content_id: number
  classroom_id: number
  course: string
  type: ContentItem['type']
  title: string
  date_start: string | null
  date_limit: string | null
}

export interface Course2 {
  id: number
  name: string
}

export interface Course3 {
  id: number
  name: string
}

export interface Attendance {
  course: string
  total: number
  attended: Attendance2
  late: Late
  absence: Missed
}

export interface Attendance2 {
  value: number
  percentage: number
}

export interface Late {
  value: number
  percentage: number
}

export interface Missed {
  value: number
  percentage: number
}

export interface Post {
  id: number
  person: string
  photo: string | null
  date: string
  course: string
  value: string
  files: File[]
}

export interface User {
  name: string
  avatar: string | any
}

export interface File {
  name: string
  url: string
}

export interface Schedule {
  id: number
  course: Course2
  cycle: Cycle
  section: Section
  days: Day[]
}

export interface Cycle {
  id: number
  name: string
}

export interface Section {
  id: number
  name: string
}

export interface Day {
  id: number
  day: number
  hour_start: string
  hour_end: string
}

export interface SecretaryAlerts {
  imports?: string
}

export interface SecretaryDashboard {
  summary: SummarySecretary[]
  study_programs: StudyProgram[]
  alerts: SecretaryAlerts
}

export interface SummarySecretary {
  title: string
  value: any
}

export interface StudyProgram {
  id: number
  name: string
  total_classrooms: number
  top_classrooms: TopClassroom[]
}

export interface TopClassroom {
  id: number
  name: string
  teacher?: string
  students: number
  assistants: any[]
}

// Secretary dashboard
// export interface SecretaryDashboard {
//   summary: Summary[]
//   career: Career[]
// }

// export interface SummarySecretary {
//   key: string
//   value: any
// }

// export interface Career {
//   id: number
//   name: string
//   activeCourses: number
//   topCourses: TopCourse[]
// }

// export interface TopCourse {
//   id: number
//   name: string
//   teacher: string
//   period: string
//   students: number
//   attendance: Attendance[]
// }

// export interface AttendanceSecretary {
//   label: string
//   value: number
// }
