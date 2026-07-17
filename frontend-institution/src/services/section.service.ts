import http from "@/common/http";
import type {
  SectionItem,
  SectionListResponse,
  RequestParamsSection,
  SectionPayload,
} from "@/models/section";

export class SectionService {
  static async getList(body: RequestParamsSection) {
    return await http.post<SectionListResponse>("/tenant/section/list", body);
  }

  static async create(body: SectionPayload) {
    return await http.post<SectionItem>("/tenant/section/create", body);
  }

  static async update(id: number, body: SectionPayload) {
    return await http.put<SectionItem>(`/tenant/section/update/${id}`, body);
  }

  static async delete(id: number) {
    return await http.delete(`/tenant/section/delete/${id}`);
  }
}
