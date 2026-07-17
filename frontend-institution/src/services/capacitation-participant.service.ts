import http from '@/common/http'
import { GetEvaluationGroup } from '@/models/evaluation-group'
import type { GetParticipantsForStudent, GetParticipantsForTeacher } from '@/models/participants'

export class CapacitationParticipantsService {
  static async getParticipantsForStudent(classroom_id: number) {
    return await http.get<GetParticipantsForStudent>(`/tenant/training/participant/list/${classroom_id}`)
  }

  static async getParticipantsForTeacher(classroom_id: number) {
    return await http.get<{
      evaluationGroups : Array<GetEvaluationGroup>,
      result : Array<GetParticipantsForTeacher>
    }>(`/tenant/training/participant/list/${classroom_id}`)
  }
}
