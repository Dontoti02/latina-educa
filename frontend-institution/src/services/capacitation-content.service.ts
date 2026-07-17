import http from '@/common/http'
import type { CapacitationContentDetailForStudent, CapacitationContentDetailForTeacher, CapacitationContentCreate } from '@/models/content'
import type { ContentList } from '@/models/courses'
import { CapacitationFormEvaluationBuild } from '@/models/evalution-form'

export class CapacitationContentService {
  static async getContentList(training_id: number) {
    return await http.get<ContentList>(`/tenant/training/content/list/${training_id}`)
  }

  static async getContentDetailForStudent(content_id: number) {
    return await http.get<CapacitationContentDetailForStudent>(`/tenant/training/content/detail/${content_id}`)
  }

  static async getContentDetailForTeacher(content_id: number) {
    return await http.get<CapacitationContentDetailForTeacher>(`/tenant/training/content/detail/${content_id}`)
  }

  static async createContent(args: CapacitationContentCreate) {
    return await http.post<CapacitationContentDetailForTeacher>('/tenant/training/content/create', args)
  }

  static async updateContent(content_id: number, args: CapacitationContentCreate) {
    return await http.put<CapacitationContentDetailForTeacher>(`/tenant/training/content/update/${content_id}`, args)
  }

  static async deleteContent(content_id: number) {
    return await http.delete(`/tenant/training/content/delete/${content_id}`)
  }

  static async downloadContentList(type: 'xlsx' | 'pdf', training_id: number) {
    return await http.getBlob(`/tenant/export/execute/capacitation-content-list/${type}?training_id=${training_id}`)
  }

  static async downloadConsolidatedNotes(type: 'xlsx' | 'pdf', training_id: number) {
    return await http.getBlob(`/tenant/export/execute/capacitation-consolidated-notes/${type}?training_id=${training_id}`)
  }

  static async toggleOpenContent(content_id: number) {
    return await http.put<boolean>(`/tenant/training/content/update/status/${content_id}`)
  }

  static async toggleVisibleContent(content_id: number) {
    return await http.put<boolean>(`/tenant/training/content/update/visibility/${content_id}`)
  }

  static async createEvaluationForm(args: CapacitationFormEvaluationBuild) {
    return await http.post<CapacitationFormEvaluationBuild>(`/tenant/training/evaluation_form/create`, args)
  }

  static async updateEvaluationForm(form_id: number, args: CapacitationFormEvaluationBuild) {
    return await http.put<CapacitationFormEvaluationBuild>(`/tenant/training/evaluation_form/update/${form_id}`, args)
  }
}
