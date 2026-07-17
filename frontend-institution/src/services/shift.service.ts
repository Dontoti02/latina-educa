import http from "@/common/http";
import type {
  ShiftItem,
  ShiftListResponse,
  RequestParamsShift,
  ShiftPayload,
} from "@/models/shift";

export class ShiftService {
  static async getList(body: RequestParamsShift) {
    return await http.post<ShiftListResponse>("/tenant/shift/list", body);
  }

  static async create(body: ShiftPayload) {
    return await http.post<ShiftItem>("/tenant/shift/create", body);
  }

  static async update(id: number, body: ShiftPayload) {
    return await http.put<ShiftItem>(`/tenant/shift/update/${id}`, body);
  }

  static async delete(id: number) {
    return await http.delete(`/tenant/shift/delete/${id}`);
  }
}
