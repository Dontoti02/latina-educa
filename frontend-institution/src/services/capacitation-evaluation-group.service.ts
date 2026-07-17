import http from '@/common/http'
import type { CapacitationEvaluationGroupCreate, GetEvaluationGroup } from '@/models/evaluation-group'

export class CapacitationEvaluationGroupService {
  static async getEvaluationGroupList(capacitation_id: number) {
    return await http.get<
    Array<GetEvaluationGroup>
    >(`/tenant/training/evaluation-group/list/${capacitation_id}`)
  }

  static async updateEvaluationGroup(args: CapacitationEvaluationGroupCreate) {
    return await http.post<Array<GetEvaluationGroup>>('/tenant/training/evaluation-group/set', args)
  }
}
