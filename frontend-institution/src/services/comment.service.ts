import http from '@/common/http'
import type { ClassComment } from '@/models/courses'

export class CommentService {
  static async addComment(args: { 
    model: 'publication' | 'content' 
    model_id: number; comment: string 
  }) {
    return await http.post<ClassComment>('/tenant/comment/create', args)
  }

  static async addCapacitationComment(args: {
    model: 'training_publication' | 'training_content'
    model_id: number; comment: string 
  }) {
    return await http.post<ClassComment>('/tenant/training/comment/create', args)
  }
}
