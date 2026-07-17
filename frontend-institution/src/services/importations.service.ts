import http from '@/common/http'
import type { CurrentImport, ImportHistory, ImportResult, ImportationType } from '@/models/importations'

export class ImportationsService {
  static async getImportationTypes() {
    return await http.get<ImportationType[]>('/tenant/import/list')
  }

  static async uploadFile(file: File, type: string) {
    return await http.postFormData(`/tenant/import/execute/${type}`, { file })
  }

  static async getCurrentImport() {
    return await http.get<CurrentImport>('/tenant/import/currently')
  }
  static async finishImport(key:string){
    return await http.post<any>('/tenant/import/finish',{key:key})
  }
  static async finishAllImports(){
    return await http.post<any>('/tenant/import/finish/all',{})
  }
  static async getImportResult(id: number) {
    return await http.get<ImportResult>(`/tenant/import/get/${id}`)
  }

  static async getImportHistory(id: number) {
    return await http.get<ImportHistory>(`/tenant/import/history/${id}`)
  }

//   static async createPostsForumComment(body: PostComment) {
//     return await http.post<any>('/tenant/comment/create', body)
//   }
}
