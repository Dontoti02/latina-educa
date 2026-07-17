export interface GetContentGroup {
  id: number
  title: string
}

export interface CreateContentGroupResponse {
  id: number
  title: string
  classroom_id: number
  created_at: string
  updated_at: string
}
