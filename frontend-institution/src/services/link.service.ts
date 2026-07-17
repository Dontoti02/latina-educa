import http from '@/common/http'
import type { CourseContentLink } from '@/models/content'
import type { UploadFileDto } from '@/models/file'

export class LinkService {
  static async createLink(args: {
    model: UploadFileDto['model']
    model_id: number
    link: string
  }) {
    return await http.post<Array<CourseContentLink>>('/tenant/link/create', args)
  }

  static async deleteLink(model: UploadFileDto['model'], linkId: number) {
    return await http.delete(`/tenant/link/delete/${linkId}/${model}`)
  }
}
