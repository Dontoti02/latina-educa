import http from "@/common/http";
import type {
  PeriodItem,
  PeriodListResponse,
  RequestParamsPeriod,
  PeriodPayload,
} from "@/models/period";

export class PeriodService {
  static async getList(body: RequestParamsPeriod) {
    return await http.post<PeriodListResponse>("/tenant/period/list", body);
  }

  static async create(body: PeriodPayload) {
    return await http.post<PeriodItem>("/tenant/period/create", body);
  }

  static async update(id: number, body: PeriodPayload) {
    return await http.put<PeriodItem>(`/tenant/period/update/${id}`, body);
  }

  static async delete(id: number) {
    return await http.delete(`/tenant/period/delete/${id}`);
  }

  static async toggle(id: number) {
    return await http.put(`/tenant/period/toggle/${id}`);
  }
}
