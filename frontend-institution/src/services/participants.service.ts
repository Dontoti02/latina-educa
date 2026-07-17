import http from '@/common/http'
import { GetEvaluationGroup } from '@/models/evaluation-group'
import type { GetParticipantsForStudent, GetParticipantsForTeacher } from '@/models/participants'

export class ParticipantsService {
  static async getParticipantsForStudent(classroom_id: number) {
    return await http.get<GetParticipantsForStudent>(`/tenant/participant/list/${classroom_id}`)
  }

  static async getParticipantsForTeacher(classroom_id: number) {
    return await http.get<{
      evaluationGroups : Array<GetEvaluationGroup>,
      result : Array<GetParticipantsForTeacher>
    }>(`/tenant/participant/list/${classroom_id}`)
  }
}
