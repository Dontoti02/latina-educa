import http from '@/common/http'
import { Concept, ConceptHistory, Movement, MovementByConcept, MovementsDetails } from '@/models/treasury'

export class treasuryService {
  static async getMovements(id:number,is_paid:number,page?:number,itemsPerPage?:number,type?:string,period?:string) {
    return await http.get<Movement[]>('/tenant/treasury/payments/get/'+id+'/'+is_paid+`?itemsPerPage=${itemsPerPage}`+`&page=${page}`+`&type=${type}`+`&period=${period}`)
  }
  static async searchStudent(search:string) {
    return await http.post('/tenant/treasury/payments/search/student', { search })
  }
  static async searchConcept(search:string) {
    return await http.post('/tenant/treasury/payment-concepts/search/concept', { search })
  }
  static async savePayment(data:any) {
    return await http.post('/tenant/treasury/payments/create', data)
  }
  static async getDetails(id:number) {
    return await http.get<MovementsDetails>('/tenant/treasury/payments/detail/'+id)
  }
  static async registerPayment(id:number) {
    return await http.post('/tenant/treasury/payments/payNextDetail/'+id,{})
  }
  static async getMovementsByConcept(conceptId:number,personId:number){
    return await http.get<MovementByConcept[]>('/tenant/treasury/payments/movementsByConcept/'+conceptId+'?personId='+personId)
  }
  static async saveRefund(data:any) {
    return await http.post('/tenant/treasury/payments/refund', data)
  }

  static async getTicket(paymentDetail:number) {
    return await http.getBlob('/tenant/treasury/payments/ticket/export/'+paymentDetail)
  }

  static async getMovementTicket(paymentDetail:number) {
    return await http.getBlob('/tenant/treasury/payments/ticket/export/movement/'+paymentDetail)
  }

  static async getEnrollmentConceptsData(){
    return await http.get<Concept[]>('/tenant/treasury/payment-concepts/enrollmentConceptsData')
  }
  static async payEnrollment(data:any,enrollId:number){
     const options = {
      headers: {
      'Content-Type': 'multipart/form-data'
      }
    };
    return await http.postImage('/tenant/treasury/payments/payEnrollment/'+ enrollId, data, options)
  }

  static async getPaymentHistory(id:number){
    return await http.get<ConceptHistory[]>('/tenant/treasury/payment-concepts/history/'+id)
  }
}
