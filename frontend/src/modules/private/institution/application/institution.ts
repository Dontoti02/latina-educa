import http from '@/common/http'
import {
  InstitutionDto,
  InstitutionPaginationDto
} from '../dto/institution.dto'
import { ENDPOINT_ADMIN } from '@/common/domain/endpoint'
import { PaginationFilters } from '@/modules/app/domain/pagination'
import { UbigeoDto } from '../dto/ubigeo.dto'
import {
  SubscriptionForm,
  InstitutionForm,
  Resumen,
  ResumenCredentials
} from '../domain/Institution'

class InstitutionApplication {
  readonly #baseUrl = ENDPOINT_ADMIN + '/institution'

  config() {
    return http.get<{
      ubigeo: UbigeoDto[]
      domain: string
    }>(this.#baseUrl + '/config')
  }

  all(filters: PaginationFilters) {
    return http.post<InstitutionPaginationDto>(this.#baseUrl + '/list', filters)
  }

  existSubdomain(subdomain: string,ignored = '') {
    return http.get<boolean>(this.#baseUrl + '/exists_subdomain/' + subdomain + '?ignore=' + ignored)
  }

  create(body: InstitutionForm) {
    const data = {
      modular_code: body.modularCode,
      ruc: body.ruc,
      name: body.name,
      type_management: body.typeManagement,
      department: body.department,
      province: body.province,
      district: body.district,
      address: body.address,
      subdomain: body.subdomain
    }
    return http.post<InstitutionDto>(this.#baseUrl + '/create', data)
  }

  update(body: InstitutionForm) {
    const data = {
      modular_code: body.modularCode,
      ruc: body.ruc,
      name: body.name,
      type_management: body.typeManagement,
      department: body.department,
      province: body.province,
      district: body.district,
      address: body.address,
      subdomain: body.subdomain
    }
    return http.put<InstitutionDto>(this.#baseUrl + '/update/' + body.id, data)
  }

  createUserDefault(data: { institutionId: number }) {
    return http.post<ResumenCredentials>(this.#baseUrl + '/create_user', data)
  }

  detail(institutionId: number) {
    return http.get<Resumen>(this.#baseUrl + '/detail/' + institutionId)
  }

  resizeLimitStorage(data: { institutionId: number; size: number }) {
    return http.post<number>(this.#baseUrl + '/resize_storage', data)
  }

  updateSubscription(data: SubscriptionForm, id: number) {
    return http.put<string>(this.#baseUrl + '/subscription/' + id, data)
  }

  toogleStatus(id: number) {
    return http.put<string>(this.#baseUrl + '/disable/' + id, {})
  }

  updateSubdomain( data:{
    institutionId:number,
    subdomain:string
  }) {
    return http.post<{
      domain:string
      subdomain:string
      url : string
    }>(this.#baseUrl + '/update_subdomain', data )
  }

  delete(institutionId:number) {
    return http.delete<string>(this.#baseUrl + '/delete/' + institutionId )
  }

}

export default new InstitutionApplication()
