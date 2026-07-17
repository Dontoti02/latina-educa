import http from '@/common/http'
import type { CreateContentGroupResponse, GetContentGroup } from '@/models/content-group'

export class CapacitationContentGroupService {
  static async getContentGroupList(classroom_id: number) {
    return await http.get<GetContentGroup>(`/tenant/training/content-group/list/${classroom_id}`)
  }

  static async createContentGroup(args: { training_id: number; title: string }) {
    return await http.post<CreateContentGroupResponse>('/tenant/training/content-group/create', args)
  }

  static async updateContentGroup(content_group_id: number, args: { title: string }) {
    return await http.put<CreateContentGroupResponse>(`/tenant/training/content-group/update/${content_group_id}`, args)
  }

  static async deleteContentGroup(content_group_id: number) {
    return await http.delete(`/tenant/training/content-group/delete/${content_group_id}`)
  }
}
