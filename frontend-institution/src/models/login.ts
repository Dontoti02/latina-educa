import type { UserAbility } from '@/plugins/casl/AppAbility'
import type { AcademicPeriod } from './academic-periods'

export interface LoginBody {
  email: string
  password: string
  remember: boolean
}

export interface LoginResponse {
  success: boolean
  message: string
  data: UserInfo
}

export interface UserInfo {
  user: User
  token: string
  menu: Menu[]
  current_role: number
  roles: Role[]
  period: AcademicPeriod
  maximum_file_size_to_upload: number
  extensions_allowed_to_upload: string[]
}

export interface Profile {
  user: User
  current_role: number
  roles: Role[]
  period: AcademicPeriod
  maximum_file_size_to_upload: number
  extensions_allowed_to_upload: string[]
}

export interface User {
  email: string
  names: string
  photo: string | null
  phone: string | null
  document_type: string
  document_number: string
}

export interface Menu {
  id: number
  name: string
  url?: string
  options: Option[]
}

export interface Option {
  id: number
  name: string
  icon: string | null
  name_url: string
  show: string | null
  order: string | null
  menuId: number
  optionId?: number
  options: Option[]
}

// export interface Suboption {
//   id: number
//   name: string
//   icon: string | null
//   url: string
//   show: string | null
//   order: string | null
//   menuId: number
//   optionId: number
// }

export interface Role {
  id: number
  name: string
  pivot: Pivot
  level?: number
}

export interface Pivot {
  user_id: number
  rol_id: number
}

export interface Login {
  accessToken: string
  userData: UserData
  userAbilities: UserAbility[]
}

export interface UserData {
  id: number
  fullName: string
  username: string
  avatar: string
  email: string
  role: string
}

export interface SessionDTO {
  id: number
  email: string
  names: string
  photo: string | null
  phone: string | null
  role: Role
  maximumFileSizeToUpload: number
  extensionsAllowedToUpload: string[]
  document_type: string
  document_number: string
}

export interface ChangePasswordForm {
  email: string
  password: string
  token: string
}
