import type { AcademicPeriod } from '@/models/academic-periods'
import type { Role, SessionDTO } from '@/models/login'
import type { GeneralSystemConfiguration } from '@/models/system-configurations'
import { UserAbility } from '@/plugins/casl/AppAbility'

export interface SessionStoreModel {
  token: string | null
  user: SessionDTO | null
  modules: string[]
  roles: Role[]
  academicPeriod: AcademicPeriod | null
  changingRole: boolean
  systemConfiguration: GeneralSystemConfiguration | null
  userAbilities : UserAbility[] | null
}

export enum RoleTrainingEnum {
  COORDINATOR = 5,
  TEACHER = 6,
  STUDENT = 7
}
