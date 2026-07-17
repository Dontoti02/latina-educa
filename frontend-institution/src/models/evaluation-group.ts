export interface GetEvaluationGroup {
  id: number
  title: string
  weight: number
}

export interface EvaluationGroupCreate {
  classroom_id: number
  create: Array<{
    title: string
    weight: number
  }>
  update: Array<GetEvaluationGroup>
  delete: Array<number>
}
export interface CapacitationEvaluationGroupCreate {
  training_id: number
  create: Array<{
    title: string
    weight: number
  }>
  update: Array<GetEvaluationGroup>
  delete: Array<number>
}
