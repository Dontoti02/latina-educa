import http from '@/common/http'
import type { GetAnswerList } from '@/models/answers'
import type { ContentDetailForStudent } from '@/models/content'

export class AnswerService {
  static async changeStatus(answerId: number) {
    return await http.put<ContentDetailForStudent['answer']['status']>(`/tenant/answer/delivered/${answerId}`, {})
  }

  static async list(content_id: number) {
    return await http.get<GetAnswerList>(`/tenant/answer/list/${content_id}`)
  }
}
