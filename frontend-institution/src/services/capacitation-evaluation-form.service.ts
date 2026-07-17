import http from '@/common/http'
import { CapacitationAnsweredFormEvaluation, CapacitationFormQuestion, QuestionType } from '@/models/evalution-form'

export class CapacitationEvaluationFormService {
  static async getInputTypes() {
    return await http.get<
    Array<QuestionType>
    >(`/tenant/training/evaluation_form/question/types`)
  }

  static async getEvaluationForm(uuid: string, person_id?: number) {
    return await http.get<CapacitationAnsweredFormEvaluation>(`/tenant/training/evaluation_form/${uuid}${person_id ? `/${person_id}` : ''}`)
  }

  static async sendEvaluationForm(uuid: string, questions: CapacitationFormQuestion[]) {
    return await http.post(`/tenant/training/evaluation_form/delivered`, {uuid, questions})
  }
}
