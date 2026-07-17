import { SystemParameters } from '../private/parameters/dto/parameters.dto'

export interface SessionDTO {
  user: UserDTO | null
  token: string | null
  menu: MenuDTO[]
  current_role: number
  roles: RoleDTO[]
  system_parameters: SystemParameters | null
}

export interface MenuDTO {
  id: number
  name: string
  options: OptionDTO[]
}

export interface OptionDTO {
  id: number
  name: string
  name_url: null | string
  icon: string | null
  is_visible: boolean
  options?: OptionDTO[]
}

export interface RoleDTO {
  id: number
  name: string
  pivot: {
    user_id: number
    rol_id: number
  }
}

export type UserDTO = {
  email: string
  names: string
  photo: string | null
}

export type ChangePasswordFormDto = {
  email: string
  password: string
  token: string
}
