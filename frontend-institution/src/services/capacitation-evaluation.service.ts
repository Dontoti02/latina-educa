import http from '@/common/http'

export class CapacitationEvaluationService {
  static async evaluate(args: { training_answer_id: number; score: number }) {
    return http.put<{ final_note: number }>('/tenant/training/evaluation/evaluate', args)
  }
}
