import type { CourseContentResource } from './courses'

export interface ForumPostResponse {
  page: number
  size: number
  total: number
  publications: ForumPost[]
}

export interface ForumPost {
  id: number
  user_id: number
  person: string
  photo: string | null
  date: string
  value: string
  showComments?: number
  files: CourseContentResource[]
  comments: ForumPostComment[]
}

export interface ForumPostComment {
  id: number
  user_id: number
  person: string
  photo: string | null
  date: string
  value: string
}

export interface ForumPostFile {
  id: number
  url: string
  title: string
  type: string
}

export interface Post {
  id?: number
  classroom_id: number
  value: string
}
export interface CapacitationPost {
  id?: number
  training_id: number
  value: string
}

export interface PostComment {
  model: string
  model_id: number
  comment: string
}

export interface ForumListBodyParams {
  page: number
  size: number
  classroom_id: number
}
export interface CapacitationForumListBodyParams {
  page: number
  size: number
  training_id: number
}

export interface FileResource {
  metaData: CourseContentResource
  file: File
}
