import http from "@/common/http";
import type { GetCurriculumFilters } from "@/models/curriculum";
import {
  CourseFilterValues,
  CourseItem,
  CreateStudyPlanResponse,
  FormParamsResponse,
  StudyPlan,
  StudyPlanPreview,
} from "@/models/study-plan-form";
import type {
  StudyPlanTypeItem,
  StudyPlanTypeListResponse,
  RequestParamsStudyPlanType,
  StudyPlanItem,
  StudyPlanListResponse,
  RequestParamsStudyPlan,
  StudyPlanPayload,
  StudyPlanTypePayload,
  StudyPlanFormParamsResponse,
  AssignedCourseRaw,
  StudyProgramParamsResult,
} from "@/models/study-plan";

export class StudyPlanService {
  static async getList(body: RequestParamsStudyPlan) {
    return await http.post<StudyPlanListResponse>(
      "/tenant/study_plan/list",
      body,
    );
  }

  static async getFormParams() {
    return await http.get<FormParamsResponse>("/tenant/study_plan/params");
  }

  static async createStudyPlan(formObject: StudyPlanPayload) {
    return await http.post<StudyPlanItem>(
      "/tenant/study_plan/create",
      formObject,
    );
  }

  static async updateStudyPlan(id: number, formObject: StudyPlanPayload) {
    return await http.put<StudyPlanItem>(
      `/tenant/study_plan/update/${id}`,
      formObject,
    );
  }

  static async deleteStudyPlan(id: number) {
    return await http.delete(`/tenant/study_plan/delete/${id}`);
  }

  static async toggleStudyPlan(id: number) {
    return await http.put<StudyPlanItem>(`/tenant/study_plan/toggle/${id}`);
  }

  static async getCourses(bodyRequestFilters: CourseFilterValues) {
    return await http.post<CourseItem[]>(
      `tenant/course/list`,
      bodyRequestFilters,
    );
  }

  static async createCourse(formObject: CourseItem) {
    return await http.post<CourseItem>("/tenant/course/create", formObject);
  }

  static async updateCourse(formObject: CourseItem) {
    return await http.put<CourseItem>(
      `/tenant/course/update/${formObject.id}`,
      formObject,
    );
  }

  static async toggleCourseActiveStatus(courseId: number) {
    return await http.put(`/tenant/course/toggle-status/${courseId}`);
  }

  static async saveCycleCourses(payload: {
    study_plan_id: number;
    cycle_id: number;
    courses: number[];
  }) {
    return await http.post(
      `/tenant/study_plan/${payload.study_plan_id}/cycles/courses`,
      payload,
    );
  }

  static async getStudyPlanPreview(studyPlanId: number) {
    return await http.get<StudyPlanPreview>(
      `/tenant/study_plan/${studyPlanId}/mesh-preview `,
    );
  }

  static async getStudyPlanFormParams() {
    return await http.get<StudyPlanFormParamsResponse>(
      `/tenant/study_plan/params`,
    );
  }

  static async getStudyProgramDetail(id: number) {
    return await http.get<Array<AssignedCourseRaw>>(
      `/tenant/study_plan_detail/detail/${id}`,
    );
  }

  static async getStudyProgramDetailParams(id: number) {
    return await http.get<StudyProgramParamsResult>(
      `/tenant/study_plan_detail/params/${id}`,
    );
  }

  static async assignCourse(body: {
    study_plan_id: number;
    cycle_id: number;
    course_id: number;
  }) {
    return await http.post<{ id: number }>(
      "/tenant/study_plan_detail/assign",
      body,
    );
  }

  static async unassignCourse(id: number) {
    return await http.put(`/tenant/study_plan_detail/unassign/${id}`);
  }
}

export class StudyPlanTypeService {
  static async getList(body: RequestParamsStudyPlanType) {
    return await http.post<StudyPlanTypeListResponse>(
      "/tenant/study_plan_type/list",
      body,
    );
  }

  static async create(body: StudyPlanTypePayload) {
    return await http.post<StudyPlanTypeItem>(
      "/tenant/study_plan_type/create",
      body,
    );
  }

  static async update(id: number, body: StudyPlanTypePayload) {
    return await http.put<StudyPlanTypeItem>(
      `/tenant/study_plan_type/update/${id}`,
      body,
    );
  }

  static async delete(id: number) {
    return await http.delete(`/tenant/study_plan_type/delete/${id}`);
  }
}
