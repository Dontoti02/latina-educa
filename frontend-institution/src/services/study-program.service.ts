import http from "@/common/http";
import type {
  StudyProgramItem,
  StudyProgramListResponse,
  RequestParamsStudyProgram,
  StudyProgramFormParamsResult,
} from "@/models/study-program";

type StudyProgramPayload = Pick<
  StudyProgramItem,
  "productive_family_id" | "name"
>;

export class StudyProgramService {
  static async getList(body: RequestParamsStudyProgram) {
    return await http.post<StudyProgramListResponse>(
      "/tenant/study_program/list",
      body,
    );
  }

  static async create(body: StudyProgramPayload) {
    return await http.post<StudyProgramItem>(
      "/tenant/study_program/create",
      body,
    );
  }

  static async update(id: number, body: StudyProgramPayload) {
    return await http.put<StudyProgramItem>(
      `/tenant/study_program/update/${id}`,
      body,
    );
  }

  static async delete(id: number) {
    return await http.delete(`/tenant/study_program/delete/${id}`);
  }

  static async toggle(id: number) {
    return await http.put<StudyProgramItem>(
      `/tenant/study_program/toggle/${id}`,
    );
  }

  static async getFormParams() {
    return await http.get<StudyProgramFormParamsResult>(
      "/tenant/study_program/params",
    );
  }
}
