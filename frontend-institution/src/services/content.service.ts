import http from '@/common/http'
import type { ContentDetailForStudent, ContentDetailForTeacher, CourseContentCreate } from '@/models/content'
import type { ContentList } from '@/models/courses'
import { FormEvaluationBuild } from '@/models/evalution-form'

export class ContentService {
  static async getContentList(classroom_id: number) {
    return await http.get<ContentList>(`/tenant/content/list/${classroom_id}`)
  }

  static async getContentDetailForStudent(content_id: number) {
    return await http.get<ContentDetailForStudent>(`/tenant/content/detail/${content_id}`)
  }

  static async getContentDetailForTeacher(content_id: number) {
    return await http.get<ContentDetailForTeacher>(`/tenant/content/detail/${content_id}`)
  }

  static async createContent(args: CourseContentCreate) {
    return await http.post<ContentDetailForTeacher>('/tenant/content/create', args)
  }

  static async updateContent(content_id: number, args: CourseContentCreate) {
    return await http.put<ContentDetailForTeacher>(`/tenant/content/update/${content_id}`, args)
  }

  static async deleteContent(content_id: number) {
    return await http.delete(`/tenant/content/delete/${content_id}`)
  }

  static async downloadContentList(type: 'xlsx' | 'pdf', classroom_id: number) {
    return await http.getBlob(`/tenant/export/execute/content-list/${type}?classroom_id=${classroom_id}`)
  }

  static async downloadConsolidatedNotes(type: 'xlsx' | 'pdf', classroom_id: number) {
    return await http.getBlob(`/tenant/export/execute/consolidated-notes/${type}?classroom_id=${classroom_id}`)
  }

  static async toggleOpenContent(content_id: number) {
    return await http.put<boolean>(`/tenant/content/update/status/${content_id}`)
  }

  static async toggleVisibleContent(content_id: number) {
    return await http.put<boolean>(`/tenant/content/update/visibility/${content_id}`)
  }

  static async createEvaluationForm(args: FormEvaluationBuild) {
    return await http.post<FormEvaluationBuild>(`/tenant/evaluation_form/create`, args)
  }

  static async updateEvaluationForm(form_id: number, args: FormEvaluationBuild) {
    return await http.put<FormEvaluationBuild>(`/tenant/evaluation_form/update/${form_id}`, args)
  }
}
