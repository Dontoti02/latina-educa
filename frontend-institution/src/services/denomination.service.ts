import http from '@/common/http'
import { Denomination } from '@/models/denomination'

export class DenominationService {
  private static basePath = '/tenant/treasury/denomination'

  static async all() {
    return await http.get<Array<Denomination>>(this.basePath + '/all')
  }

}
