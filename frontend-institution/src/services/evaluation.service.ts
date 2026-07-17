import http from '@/common/http'

export class EvaluationService {
  static async evaluate(args: { answer_id: number; score: number }) {
    return http.put<{ final_note: number }>('/tenant/evaluation/evaluate', args)
  }
}
