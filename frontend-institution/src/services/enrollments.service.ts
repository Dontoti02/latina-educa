import http from '@/common/http'
import { EnrollRegularStudent, FormsData,Enrolls, searchPerson, EnrollData } from '@/models/enrollment'
import type { Enrollment, EnrollmentFilters, EnrollmentFormSecretary, EnrollmentFormStudent, EnrollmentStudents, EnrollmentStudentsForm } from '@/models/enrollments'

export class EnrollmentService {
  static async getEnrollments(
    params: { personId: Number|undefined; periodId: Number|undefined; programId: Number|undefined }
  ) {
    return await http.post<Enrolls[]>('/tenant/enrollment/list',params);
  }
  static async getEnrollData(id: number) {
    return await http.get<EnrollData>(`/tenant/enrollment/get/${id}`);
  }
  static async deleteEnrollment(id: number) {
    return await http.delete(`/tenant/enrollment/deleteEnroll/${id}`);
  }
  static async updateEnrollment(id: number, data: any) {
    return await http.put(`/tenant/enrollment/updateEnroll/${id}`, data);
  }
  static async getFormsData(){
    return await http.get<FormsData>('/tenant/enrollment/getFormsData')
  }
  static async searchStudent(search: string){
    return await http.post<searchPerson[]>('/tenant/enrollment/searchStudent', {search})
  }
  static async isEnrolled(personId: number){
    return await http.post('/tenant/enrollment/validateEnrollment', {personId})
  }
  static async validateDNI(dni: string){
    return await http.post('/tenant/enrollment/validateDNI', {dni});
  }
  static async validateFamilyDNI(dni: string){
    return await http.post('/tenant/enrollment/validateFamilyDNI', {dni});
  }
  static async enrollRegularStudent(data: EnrollRegularStudent) {
    return await http.post('/tenant/enrollment/enrollRegularStudent', data)
  }
  static async enrollNewStudent(data: any){
    const options = {
      headers: {
      'Content-Type': 'multipart/form-data'
      }
    };
    return await http.postImage('/tenant/enrollment/enrollNewStudent', data, options)
  }
  static async getFilters() {
    return await http.get<EnrollmentFilters>('/tenant/registration/filters')
  }

  static async getEnrollmentStudents(form: EnrollmentStudentsForm) {
    return await http.post<Array<EnrollmentStudents>>('/tenant/registration/list/students', form)
  }

  static async getEnrollmentForStudent(form: EnrollmentFormStudent) {
    return await http.post<Array<Enrollment>>('/tenant/registration/list', form)
  }

  static async getEnrollmentForSecretary(form: EnrollmentFormSecretary) {
    return await http.post<Array<Enrollment>>('/tenant/registration/list', form)
  }

  static async downloadEnrollmentForSecretary(type: 'xlsx' | 'pdf', period_id: number, person_id: number) {
    return await http.getBlob(`/tenant/export/execute/registration/${type}?period_id=${period_id}&person_id=${person_id}`)
  }

  static async downloadEnrollmentForStudent(type: 'xlsx' | 'pdf', period_id: number) {
    return await http.getBlob(`/tenant/export/execute/registration/${type}?period_id=${period_id}`)
  }

  static async downloadConsolidatedForSecretary(type: 'xlsx' | 'pdf', period_id: number, person_id: number) {
    return await http.getBlob(`/tenant/export/execute/consolidated-registration/${type}?period_id=${period_id}&person_id=${person_id}`)
  }

  static async downloadConsolidatedForStudent(type: 'xlsx' | 'pdf', period_id: number) {
    return await http.getBlob(`/tenant/export/execute/consolidated-registration/${type}?period_id=${period_id}`)
  }

  static async getValidationsEnrollment() {
    return await http.get<{
      hasCurrentPeriod: boolean;
      hasPeriodDates: boolean;
      hasPaymentConceptEnrollment: boolean;
      hasPaymentConceptPension: boolean;
      maxMonthsPeriod: number;
      errors : {
        title : string
        caption : string
      }[];
    }>('/tenant/enrollment/validations')
  }
}
