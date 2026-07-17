import { FormCreatePaymentConceptAdapter } from '@/adapters/create-payment-concept.adapter'
import http from '@/common/http'
import {  FiltersPaymetConcepts, FormCreateScale, ListScales, Scale } from '@/models/payment-concepts'
import { toQueryParams } from '@/utils/query-params'

export class ScaleService {
  private static basePath = '/tenant/treasury/scales'


  static async create(form: FormCreateScale) {
    return await http.post<Scale>(this.basePath + '/create', form)
  }

  static async update(id: number, form: FormCreateScale) {
    return await http.put<Scale>(this.basePath + '/update/' + id, form)
  }

    static async all(form: FiltersPaymetConcepts) {
    const queryParams = toQueryParams(form)
      return await http.get<ListScales>(this.basePath + '/all?' + queryParams)
    }

    static async enrollments(id: number) {
      return await http.get<String[]>(this.basePath + '/enrollments/' + id)
    }

    static async delete(id: number) {
      return await http.delete<Scale>(this.basePath + '/delete/' + id)
    }


}
