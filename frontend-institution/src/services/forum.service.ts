import http from '@/common/http'
import type { ForumListBodyParams, ForumPost, ForumPostResponse, Post, PostComment } from '@/models/forum'

export class ForumService {
  static async getPostsForum(body: ForumListBodyParams) {
    return await http.post<ForumPostResponse>('/tenant/publication/list', body)
  }

  static async createPostsForum(body: Post) {
    return await http.post<ForumPost>('/tenant/publication/create', body)
  }

  static async createPostsForumComment(body: PostComment) {
    return await http.post<any>('/tenant/comment/create', body)
  }

  static async deletePostsForum(id: number) {
    return await http.delete<any>(`/tenant/publication/delete/${id}`)
  }

  static async updatePostsForum(id:number, body: {value: string}) {
    return await http.put('/tenant/publication/update/' + id, body)
  }
}
