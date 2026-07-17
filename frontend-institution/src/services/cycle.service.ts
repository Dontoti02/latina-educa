import http from "@/common/http";
import type {
  CycleItem,
  CycleListResponse,
  RequestParamsCycle,
  CyclePayload,
} from "@/models/cycle";

export class CycleService {
  static async getList(body: RequestParamsCycle) {
    return await http.post<CycleListResponse>("/tenant/cycle/list", body);
  }

  static async create(body: CyclePayload) {
    return await http.post<CycleItem>("/tenant/cycle/create", body);
  }

  static async update(id: number, body: CyclePayload) {
    return await http.put<CycleItem>(`/tenant/cycle/update/${id}`, body);
  }

  static async delete(id: number) {
    return await http.delete(`/tenant/cycle/delete/${id}`);
  }

  static async sort(id: number, position: 1 | -1) {
    return await http.put(`/tenant/cycle/sort/${id}/${position}`);
  }
}
