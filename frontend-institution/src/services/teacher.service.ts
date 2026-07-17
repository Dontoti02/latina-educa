import http from "@/common/http";
import type {
  TeacherItem,
  TeacherListResponse,
  TeacherParams,
  RequestParamsTeacher,
  TeacherPayload,
  TeacherUpdatePayload,
} from "@/models/teacher";

export class TeacherService {
  static async getList(body: RequestParamsTeacher) {
    return await http.post<TeacherListResponse>("/tenant/teacher/list", body);
  }

  static async getParams() {
    return await http.get<TeacherParams>("/tenant/teacher/params");
  }

  static async create(body: TeacherPayload) {
    return await http.post<TeacherItem>("/tenant/teacher/create", body);
  }

  static async update(id: number, body: TeacherUpdatePayload) {
    return await http.put<TeacherItem>(`/tenant/teacher/update/${id}`, body);
  }

  static async delete(id: number) {
    return await http.delete(`/tenant/teacher/delete/${id}`);
  }
}
