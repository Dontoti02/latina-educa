import http from '@/common/http'
import type { CapacitationForumListBodyParams, CapacitationPost, ForumPost, ForumPostResponse, Post, PostComment } from '@/models/forum'

export class CapacitationForumService {
  static async getPostsForum(body: CapacitationForumListBodyParams) {
    return await http.post<ForumPostResponse>('/tenant/training/publication/list', body)
  }

  static async createPostsForum(body: CapacitationPost) {
    return await http.post<ForumPost>('/tenant/training/publication/create', body)
  }

  static async createPostsForumComment(body: PostComment) {
    return await http.post<any>('/tenant/training/comment/create', body)
  }

  static async deletePostsForum(id: number) {
    return await http.delete<any>(`/tenant/training/publication/delete/${id}`)
  }

  static async updatePostsForum(id:number, body: {value: string}) {
    return await http.put('/tenant/training/publication/update/' + id, body)
  }
}
