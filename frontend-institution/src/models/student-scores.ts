export interface StudentScore {
  status: string
  final_note: number
  next_evaluation: NextEvaluation | null
  content_groups: ContentGroup[]
}

export interface NextEvaluation {
  id: number
  title: string
  date_start: string
  date_limit: string
}

export interface ContentGroup {
  id: number
  title: string
  evaluations: Evaluation[]
  evaluation_groups: EvaluationGroup[]
}

export interface Evaluation {
  id: number
  title: string
  type: string
  date: string
  date_start: string
  date_limit: string
  evaluation_group: string
  score: number
}

export interface EvaluationGroup {
  id: number
  title: string
  weight: number
  score: number
}
