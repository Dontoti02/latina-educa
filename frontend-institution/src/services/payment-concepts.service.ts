import { FormCreatePaymentConceptAdapter } from '@/adapters/create-payment-concept.adapter'
import http from '@/common/http'
import { ConceptMovements, FiltersPaymetConcepts, FormCreatePaymentConcept, ListPaymentConcepts, PaymentConcept } from '@/models/payment-concepts'
import { toQueryParams } from '@/utils/query-params'

export class PaymentConceptsService {
  private static basePath = '/tenant/treasury/payment-concepts'

  static async all(form: FiltersPaymetConcepts) {
  const queryParams = toQueryParams(form)
    return await http.get<ListPaymentConcepts>(this.basePath + '/all?' + queryParams)
  }

  static async create(form: FormCreatePaymentConcept) {
    const adapter = FormCreatePaymentConceptAdapter.transformSnakeCase(form)
    return await http.post<PaymentConcept>(this.basePath + '/create', adapter)
  }

  static async update(id: number, form: FormCreatePaymentConcept) {
    const adapter = FormCreatePaymentConceptAdapter.transformSnakeCase(form)
    return await http.put<PaymentConcept>(this.basePath + `/update/${id}`, adapter)
  }

  static async toggleActivate(id: number) {
    return await http.put<PaymentConcept>(this.basePath + `/active/${id}`, {})
  }

  static async toggleInactivate(id: number) {
    return await http.put<PaymentConcept>(this.basePath + `/inactive/${id}`, {})
  }

  static async delete(id: number) {
    return await http.delete<PaymentConcept>(this.basePath + `/delete/${id}`)
  }
  static async movements(id:number){
    return await http.get<ConceptMovements[]>(this.basePath + `/movements/${id}`)
  }
  static async export(type: 'xlsx') {
    return await http.getBlob(`/tenant/export/execute/payment-concepts/${type}`)
  }

}
