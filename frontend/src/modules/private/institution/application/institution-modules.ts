import http from '@/common/http'
import { ENDPOINT_ADMIN } from '@/common/domain/endpoint'
import { InstitutionModule } from '../domain/institution-modules'

class InstitutionModulesApplication {
  readonly #baseUrl = ENDPOINT_ADMIN + '/institution-modules'

  list(institutionId: number) {
    return http.get<InstitutionModule[]>(this.#baseUrl + '/list/' + institutionId)
  }

  async toggleActivation(body : {
    moduleKey: string, 
    isActive: boolean,
    institutionId : number
  }) {
    const { moduleKey, isActive, institutionId } = body
    return http.post<string>(this.#baseUrl + '/toggle/' + institutionId, {
      moduleKey,
      isActive
    })
  }

  async updateDates(body: {
    moduleKey: string,
    institutionId: number,
    startDate: string | null,
    endDate: string | null
  }) {
    const { moduleKey, institutionId, startDate, endDate } = body
    return http.post<string>(this.#baseUrl + '/update-dates/' + institutionId, {
      moduleKey,
      startDate,
      endDate
    })
  }

}

export default new InstitutionModulesApplication()
