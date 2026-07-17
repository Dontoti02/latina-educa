import application from '../application/institution-modules'
import { tryDomainTask } from '@/common/domain/try'
import { CaseConverter } from '@/modules/app/utils/CaseConverter'
import { InstitutionModule } from '../domain/institution-modules'

class InstitutionModulesService {

  async list(institutionId:number) {
    return tryDomainTask<InstitutionModule[]>(async () => {
      const { success, message, data } = await application.list(institutionId)
      const items = data.map((item) =>
        CaseConverter.snakeToCamel<typeof item, InstitutionModule>(item)
      )
      return {
        success,
        message,
        data: items
      }
    })
  }

  async toggleActivation(body:{
    moduleKey: string, 
    isActive: boolean, 
    institutionId: number
  }) {
    return tryDomainTask<string>(async () => {
      const { moduleKey, isActive, institutionId } = body
      const {success,message,data } = await application.toggleActivation({
        moduleKey,
        isActive,
        institutionId
      })
      return {
        success,
        message,
        data
      }
    })  
  }

  async updateDates(body: {
    moduleKey: string, 
    institutionId: number
    startDate : string | null,
    endDate : string | null
  }) {
    return tryDomainTask<string>(async () => {
      const { moduleKey, institutionId, startDate, endDate } = body
      const { success, message, data } = await application.updateDates({
        moduleKey,
        institutionId,
        startDate,
        endDate
      })
      return {
        success,
        message,
        data
      }
    })
  }
 
}

export default new InstitutionModulesService()
