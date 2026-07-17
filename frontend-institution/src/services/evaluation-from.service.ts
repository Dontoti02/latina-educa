import http from '@/common/http'
import { AnsweredFormEvaluation, FormQuestion, QuestionType } from '@/models/evalution-form'

export class EvaluationFormService {
  static async getInputTypes() {
    return await http.get<
    Array<QuestionType>
    >(`/tenant/evaluation_form/question/types`)
  }

  static async getEvaluationForm(uuid: string, person_id?: number) {
    return await http.get<AnsweredFormEvaluation>(`/tenant/evaluation_form/${uuid}${person_id ? `/${person_id}` : ''}`)
  }

  static async sendEvaluationForm(uuid: string, questions: FormQuestion[]) {
    return await http.post(`/tenant/evaluation_form/delivered`, {uuid, questions})
  }
}
