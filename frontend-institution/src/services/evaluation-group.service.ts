import http from '@/common/http'
import type { EvaluationGroupCreate, GetEvaluationGroup } from '@/models/evaluation-group'

export class EvaluationGroupService {
  static async getEvaluationGroupList(classroom_id: number) {
    return await http.get<
    Array<GetEvaluationGroup>
    >(`/tenant/evaluation-group/list/${classroom_id}`)
  }

  static async updateEvaluationGroup(args: EvaluationGroupCreate) {
    return await http.post<Array<GetEvaluationGroup>>('/tenant/evaluation-group/set', args)
  }
}
