import http from "@/common/http";
import type { Course, CoursesPerPeriod } from "@/models/courses";
import type {
  ClassroomItem,
  ClassroomListResponse,
  RequestParamsClassroom,
  ClassroomPayload,
  ClassroomParams,
  ClassroomCourseFilter,
  ClassroomCoursesResponse,
  ClassroomAssignPayload,
  ClassroomDetail,
} from "@/models/classroom";

export class ClassroomService {
  static async getClassrooms(period_id?: number) {
    return await http.post<Array<CoursesPerPeriod>>("/tenant/classroom/list", {
      period_id,
    });
  }

  static async getClassroom(classroom_id: number) {
    return await http.get<Course>(`/tenant/classroom/${classroom_id}`);
  }

  static async toggleFavorite(classroom_id: number) {
    return await http.put(
      `/tenant/classroom/update/favorite/${classroom_id}`,
      {},
    );
  }

  static async uploadImage(id: number, file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return await http.postFormData<string>(
      `/tenant/classroom/update/image/${id}`,
      formData,
    );
  }

  static async getList(body: RequestParamsClassroom) {
    return await http.post<ClassroomListResponse>(
      "/tenant/classroom/list",
      body,
    );
  }

  static async create(body: ClassroomPayload) {
    return await http.post<ClassroomItem>("/tenant/classroom/create", body);
  }

  static async update(id: number, body: ClassroomPayload) {
    return await http.put<ClassroomItem>(
      `/tenant/classroom/update/${id}`,
      body,
    );
  }

  static async delete(id: number) {
    return await http.delete(`/tenant/classroom/delete/${id}`);
  }

  static async getParams() {
    return await http.get<ClassroomParams>("/tenant/classroom/params");
  }

  static async listCourses(body: ClassroomCourseFilter) {
    return await http.post<ClassroomCoursesResponse>(
      "/tenant/classroom/list/courses",
      body,
    );
  }

  static async createAssignment(body: ClassroomAssignPayload) {
    return await http.post<void>("/tenant/classroom/create", body);
  }

  static async getDetail(id: number) {
    return await http.get<ClassroomDetail>(`/tenant/classroom/detail/${id}`);
  }
}
