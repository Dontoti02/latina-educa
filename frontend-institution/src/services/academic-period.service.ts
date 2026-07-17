import http from "@/common/http";
import type {
  AcademicPeriod,
  AcademicPeriodItem,
  CreateAcademicPeriodBody,
} from "@/models/academic-periods";
import { PeriodForm } from "@/models/period-form";

export class AcademicPeriodService {
  static async getCurrent() {
    return await http.get<AcademicPeriod>("/tenant/period/current");
  }

  static async getList() {
    return await http.get<Array<AcademicPeriodItem>>("/tenant/period/list");
  }

  static async toggleStatus(id: number) {
    return await http.put(`/tenant/period/disable/${id}`);
  }

  static async updateDates(
    period_id: number,
    start_date: string,
    end_date: string,
  ) {
    return await http.put(`/tenant/period/updateDate`, {
      period_id,
      start_date,
      end_date,
    });
  }

  static async createPeriod(formObject: CreateAcademicPeriodBody) {
    return await http.post(`tenant/period/create`, formObject);
  }

  static async updatePeriod(
    formObject: CreateAcademicPeriodBody & { id: number },
  ) {
    return await http.put(`/tenant/period/update/${formObject.id}`, formObject);
  }

  static async closePeriod(id: number) {
    return await http.put(`/tenant/period/${id}/close`);
  }
}
