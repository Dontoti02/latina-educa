import type { ContentDetailForStudent } from './content'

export interface GetAnswer {
  id: number
  person_id: number
  person: string
  photo: string | null
  date: string
  status: ContentDetailForStudent['answer']['status']
  score: number
  final_note: number
  files: ContentDetailForStudent['files']
  links: ContentDetailForStudent['links']
}
export interface GetAnswerList {
  id: number
  title: string
  score: number
  answers: Array<GetAnswer>
  has_evaluation_form: boolean
  form_uuid: string | null
}
