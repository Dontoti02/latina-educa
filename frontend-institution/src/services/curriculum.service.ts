import http from "@/common/http";
import type {
  CurriculumFormSecretary,
  GetCurriculum,
  GetCurriculumFilters,
} from "@/models/curriculum";
import { StudyPlan } from "@/models/study-plan-form";

export class CurriculumService {
  static async getFilters() {
    return await http.get<GetCurriculumFilters>(
      "/tenant/study_program/filters",
    );
  }

  static async getCurriculumForSecretary(filters: CurriculumFormSecretary) {
    return await http.post<Array<GetCurriculum>>(
      "/tenant/study_program/list",
      filters,
    );
  }

  static async getCurriculumForStudent() {
    return await http.post<Array<GetCurriculum>>(
      "/tenant/study_program/list",
      {},
    );
  }
}
