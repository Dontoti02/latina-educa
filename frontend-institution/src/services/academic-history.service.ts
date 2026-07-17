import http from '@/common/http'
import type { AcademicHistory, AcademicHistoryFilters, AcademicHistoryFormSecretary, AcademicHistoryStudents, AcademicHistoryStudentsForm } from '@/models/academic-history'

export class AcademicHistoryService {
  static async getFilters() {
    return await http.get<AcademicHistoryFilters>('/tenant/history/filters')
  }

  static async getAcademicHistoryStudents(form: AcademicHistoryStudentsForm) {
    return await http.post<Array<AcademicHistoryStudents>>('/tenant/history/list/students', form)
  }

  static async getAcademicHistoryForStudent() {
    return await http.post<Array<AcademicHistory>>('/tenant/history/list', {})
  }

  static async getAcademicHistoryForSecretary(form: AcademicHistoryFormSecretary) {
    return await http.post<Array<AcademicHistory>>('/tenant/history/list', form)
  }

  static async downloadHistoryForSecretary(type: 'xlsx' | 'pdf', form: AcademicHistoryFormSecretary) {
    return await http.getBlob(`/tenant/export/execute/history/${type}?person_id=${form.person_id}`)
  }

  static async downloadHistoryForStudent(type: 'xlsx' | 'pdf') {
    return await http.getBlob(`/tenant/export/execute/history/${type}`)
  }
}
