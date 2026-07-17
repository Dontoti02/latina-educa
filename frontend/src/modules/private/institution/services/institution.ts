import {
  SubscriptionForm,
  Institution,
  InstitutionForm,
  Resumen,
  ResumenCredentials
} from '../domain/Institution'
import application from '../application/institution'
import { tryDomainTask } from '@/common/domain/try'
import { Pagination, PaginationFilters } from '@/modules/app/domain/pagination'
import { CaseConverter } from '@/modules/app/utils/CaseConverter'
import { Ubigeo } from '../domain/ubigeo'

class InstitutionService {
  async config() {
    return tryDomainTask<{
      ubigeo: Ubigeo[]
      domain: string
    }>(async () => {
      const { success, message, data } = await application.config()

      const ubigeo = data.ubigeo.map((item) =>
        CaseConverter.snakeToCamel<typeof item, Ubigeo>(item)
      )
      const domain = data.domain
      return {
        success,
        message,
        data: {
          ubigeo,
          domain
        }
      }
    })
  }

  async all(filters: PaginationFilters) {
    return tryDomainTask<{
      items: Institution[]
      pagination: Pagination
    }>(async () => {
      const { success, message, data } = await application.all(filters)
      const { pagination, ...list } = data
      const items = list.items.map((item) =>
        CaseConverter.snakeToCamel<typeof item, Institution>(item)
      )
      return {
        success,
        message,
        data: {
          items,
          pagination
        }
      }
    })
  }

  async existSubdomain(subdomain: string, ignored = '') {
    return tryDomainTask<boolean>(async () => {
      return await application.existSubdomain(subdomain,ignored)
    })
  }

  async create(body: InstitutionForm) {
    return tryDomainTask<Institution>(async () => {
      const { success, message, data } = await application.create(body)

      return {
        success,
        message,
        data: CaseConverter.snakeToCamel<typeof data, Institution>(data)
      }
    })
  }

  async update(body: InstitutionForm) {
    return tryDomainTask<Institution>(async () => {
      const { success, message, data } = await application.update(body)

      return {
        success,
        message,
        data: CaseConverter.snakeToCamel<typeof data, Institution>(data)
      }
    })
  }

  async createUserDefault(data: { institutionId: number }) {
    return tryDomainTask<ResumenCredentials>(async () => {
      return await application.createUserDefault(data)
    })
  }

  async detail(institutionId: number) {
    return tryDomainTask<Resumen>(async () => {
      return await application.detail(institutionId)
    })
  }

  async resizeLimitStorage(data: { institutionId: number; size: number }) {
    return tryDomainTask<number>(async () => {
      return await application.resizeLimitStorage(data)
    })
  }

  async updateSubscription(form: SubscriptionForm, id: number) {
    return tryDomainTask<string>(async () => {
      const { success, message, data } = await application.updateSubscription(
        form,
        id
      )
      return {
        success,
        message,
        data
      }
    })
  }

  async toogleStatus(id: number) {
    return tryDomainTask<string>(async () => {
      const { success, message, data } = await application.toogleStatus(id)
      return {
        success,
        message,
        data
      }
    })
  }

  async updateSubdomain(value:{
    institutionId:number,
    subdomain:string
  }) {
    return tryDomainTask<{
      domain:string
      subdomain:string
      url : string
    }>(async () => {
      const { success, message, data } = await application.updateSubdomain(value)
      return {
        success,
        message,
        data
      }
    })
  }

  async delete(institutionId:number) {
    return tryDomainTask<string>(async () => {
      const { success, message, data } = await application.delete(institutionId)
      return {
        success,
        message,
        data
      }
    })
  }
}

export default new InstitutionService()
