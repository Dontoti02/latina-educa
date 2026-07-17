import http from "@/common/http";
import type {
  WorkingConditionItem,
  WorkingConditionListResponse,
  RequestParamsWorkingCondition,
  WorkingConditionPayload,
} from "@/models/working-condition";

export class WorkingConditionService {
  static async getList(body: RequestParamsWorkingCondition) {
    return await http.post<WorkingConditionListResponse>(
      "/tenant/working_condition/list",
      body,
    );
  }

  static async create(body: WorkingConditionPayload) {
    return await http.post<WorkingConditionItem>(
      "/tenant/working_condition/create",
      body,
    );
  }

  static async update(id: number, body: WorkingConditionPayload) {
    return await http.put<WorkingConditionItem>(
      `/tenant/working_condition/update/${id}`,
      body,
    );
  }

  static async delete(id: number) {
    return await http.delete(`/tenant/working_condition/delete/${id}`);
  }
}
