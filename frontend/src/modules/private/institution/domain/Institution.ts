import { InstitutionType } from '../enum/enums'

export type Institution = {
  id: number
  subdomain: string
  ruc: string
  name: string
  typeManagement: string
  department: string
  province: string
  district: string
  address: string
  logo: string | null
  isActive: boolean
  startDate: string
  endDate: string | null
  createdAt: string
  modularCode: string
}

export type InstitutionForm = {
  id?: number
  modularCode: string
  ruc: string
  name: string
  typeManagement: InstitutionType
  department: string | null
  province: string | null
  district: string | null
  address: string
  subdomain: string
}

export type ResumenCredentials = {
  institutionId: number
  subdomain: string
  url: string
  domain:string
  tenatSubdomain:string
  user: {
    email: string
    name: string
    password: string
  } | null
}
export type ResumenInstitution = {
  name: string
  icon: string
  url: string
  resumen: {
    totalStudents: number
    totalTeachers: number
    totalCourses: number
  }
}
export type ResumenStorage = {
  chart: {
    total: number
    used: number
    free: number
  }
  detail: {
    name: string
    count: number
    icon: string
    sizeMb: number
  }[]
}
export type Resumen = {
  institution: ResumenInstitution
  storage: ResumenStorage
  credentials: ResumenCredentials
}

export type SubscriptionForm = {
  start_date: string
  end_date: string | null
}
