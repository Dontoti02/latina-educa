import http from "@/common/http"
import { ListOfMeritFilters, StudentForListOfMerit } from "@/models/list-of-merit"

export class ListOfMeritService {
  static async getFilters() {
    return await http.get<ListOfMeritFilters>('/tenant/merit_order/filters')
  }

  static async getStudents(form: {period_id: number, study_program_id: number}) {
    return await http.post<StudentForListOfMerit[]>('/tenant/merit_order/list', form)
  }
}
