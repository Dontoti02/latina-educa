import type { CourseContentResource } from './courses'

export interface GetEvaluationPerStudent {
  name: string
  score: number
  students: Array<{
    id: number
    name: string
    score: number | null
    files: Array<CourseContentResource>
  }>
}
