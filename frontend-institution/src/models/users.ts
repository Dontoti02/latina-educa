import type { Role } from './login'

export interface UserModel {
  id: number
  rol_id: number
  photo: string | null
  names: string
  phone: string
  email: string
  is_active: boolean
  last_login: string
  document_number: string
  document_type: string
}

export interface UserList {
  page: number
  size: number
  total: number
  users: UserModel[]
}

export interface FormGetUsers {
  page: number
  size: number
  rol_ids: number[]
  search: string
}

export interface FormUpdateUser {
  phone: string
  email: string
}

export interface FormUpdateUserAdmin {
  names: string
  phone: string
  email: string
  document_number: string
  document_type: string
}

export interface FormPasswordUser {
  password: string
}

export interface FormCreateUser {
  document_type: string
  document_number: string
  names: string
  email: string
  phone: string
  rol_ids: number[]
}

export interface ParamsForCreation {
  documents: string[]
  roles: Role[]
}

export type UserSubset = Pick<UserModel, 'id' | 'names' | 'email' | 'phone' | 'rol_id' | 'document_type' | 'document_number'>
