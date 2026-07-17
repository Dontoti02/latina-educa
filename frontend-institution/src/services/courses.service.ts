import http from "@/common/http";
import type {
  CourseAdminItem,
  CourseAdminListResponse,
  RequestParamsCourseAdmin,
  CourseAdminPayload,
  CourseFormParamsResponse,
  CourseTypeItem,
  CourseTypeListResponse,
  RequestParamsCourseType,
  CourseTypePayload,
} from "@/models/courses";

export class CourseService {
  static async getList(body: RequestParamsCourseAdmin) {
    return await http.post<CourseAdminListResponse>(
      "/tenant/course/list",
      body,
    );
  }

  static async getFormParams() {
    return await http.get<CourseFormParamsResponse>("/tenant/course/params");
  }

  static async create(body: CourseAdminPayload) {
    return await http.post<CourseAdminItem>("/tenant/course/create", body);
  }

  static async update(id: number, body: CourseAdminPayload) {
    return await http.put<CourseAdminItem>(`/tenant/course/update/${id}`, body);
  }

  static async delete(id: number) {
    return await http.delete(`/tenant/course/delete/${id}`);
  }

  static async toggle(id: number) {
    return await http.put(`/tenant/course/toggle/${id}`);
  }
}

export class CourseTypeService {
  static async getList(body: RequestParamsCourseType) {
    return await http.post<CourseTypeListResponse>(
      "/tenant/course_type/list",
      body,
    );
  }

  static async create(body: CourseTypePayload) {
    return await http.post<CourseTypeItem>("/tenant/course_type/create", body);
  }

  static async update(id: number, body: CourseTypePayload) {
    return await http.put<CourseTypeItem>(
      `/tenant/course_type/update/${id}`,
      body,
    );
  }

  static async delete(id: number) {
    return await http.delete(`/tenant/course_type/delete/${id}`);
  }
}
