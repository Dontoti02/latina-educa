import { RoleDTO } from '@/modules/auth/dto'

export type UsersFormDto = {
  page: number
  size: number
  rol_ids: number[]
  search: string
}

export type UserModel = {
  id: number
  rol_id: number
  rol_ids: number[]
  photo: string | null
  names: string
  email: string
  is_active: boolean
  last_login: string
}

export type UsersDto = {
  page: number
  size: number
  total: number
  users: UserModel[]
}

export type CreationParamsDto = {
  roles: RoleDTO[]
}

export type CreateUserFormDto = {
  names: string
  email: string
  password: string
  rol_ids: number[]
}

export type UpdateUserFormDto = {
  names: string
  email: string
  rol_ids: number[]
}

export type PasswordUserFormDto = {
  password: string
}
