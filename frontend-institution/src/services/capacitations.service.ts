import http from "@/common/http";
import { StudentsResponse, TeachersList } from "@/mocks/capacitations.mock";
import {
  AddStudentsBody,
  Capacitation,
  CapacitationForm,
  CapacitationsList,
  CapacitationsListRequest,
  CapacitationUserForm,
  EnableStudentsBody,
  Filters,
  ListStudentsBody,
  RemoveStudentsBody,
  ReponseReport,
  ReportBody,
  ReportFilterResponse,
  ResponseFilters,
  Student,
  StudentsList,
  Teacher,
} from "@/models/capacitations";
import { GroupTask } from "@/models/content";

export class CapacitationService {
  static async getFilters() {
    return await http.get<Filters>("/tenant/training/filters");
  }

  static async setFavorite(capacitationId: number) {
    return await http.put("/tenant/training/update/favorite/" + capacitationId);
  }
  static async getCapacitationsList(body: CapacitationsListRequest) {
    return await http.post<CapacitationsList>("/tenant/training/list", body);
  }

  static async changeFrontPage(file: File, training_id: number) {
    return await http.postFormData<{ file: File; training_id: number }>(
      "/tenant/training/update/image",
      {
        file,
        training_id,
      }
    );
  }

  static async deleteFrontPage(trainingId: number) {
    return await http.delete<string>(
      `/tenant/training/delete/image/${trainingId}`
    );
  }

  static async saveCapacitation(body: CapacitationForm) {
    return await http.post<number>("/tenant/training/set", body);
  }

  static async updateCapacitation(body: CapacitationForm) {
    return await http.post<string>("/tenant/training/set", body);
  }

  static async createPerson(body: CapacitationUserForm) {
    return await http.post<number>("/tenant/training/create/person", body);
  }

  static async updateTeacher(body: { person_id: number; training_id: number }) {
    return await http.post<string>(`/tenant/training/assign/teacher`, body);
  }

  static async deleteCapacitation(capacitationId: number) {
    return await http.delete<string>(
      `/tenant/training/delete/${capacitationId}`
    );
  }

  static async getPeopleList(search: string) {
    return await http.get<Array<Teacher | Student>>(
      `/tenant/training/find/person?search=${search}`
    );
  }

  static async addStudent(body: AddStudentsBody) {
    return await http.post<string>(`/tenant/training/assign/student`, body);
  }

  static async getCapacitationDetails(capacitationId: number) {
    return await http.get<CapacitationForm>(
      `/tenant/training/${capacitationId}`
    );
  }

  static async getCapacitationStudentsFilters() {
    return await http.get<ResponseFilters>(`/tenant/training/filters/students`);
  }

  static async getCapacitationStudents(body: ListStudentsBody) {
    return await http.post<StudentsList>(
      `/tenant/training/list/students`,
      body
    );
  }

  static async downloadCapacitationStudents(form: {
    training_id: number;
    search?: string;
    status?: string;
  }) {
    return await http.postBlob(`/tenant/training/list/students/download`, form);
  }

  static async removeStudent(body: RemoveStudentsBody) {
    return await http.put<string>(`/tenant/training/unassign/student`, body);
  }

  static async enableStudent(body: EnableStudentsBody) {
    return await http.put<string>(`/tenant/training/activate/student`, body);
  }

  static async reportFilters() {
    return await http.get<ReportFilterResponse>(
      `/tenant/training/report/filters`
    );
  }

  static async reportList(body: ReportBody) {
    return await http.post<ReponseReport>(`/tenant/training/report/list`, body);
  }

  static async reportDownload(body: {
    training_status_id: number | null;
    search: string;
  }) {
    return await http.postBlob(`/tenant/training/report/list/download`, body);
  }

  static async downloadCertificate(training_id: number, person_id: number) {
    const response = await http.postBlob(`/tenant/training/certificate/download`, {
      training_id,
      person_id,
    });

    const isJson = response.data.type.includes("application/json");
    if (isJson) {
      const text = await response.data.text();
      const json = JSON.parse(text);
      if (json.success === false) {
        throw new Error(json.message);
      }
    }
    return response;
  }

  static async saveCategory(body: { id: number; name: string }) {
    return await http.post<{
      id: number;
      name: string;
    }>(`/tenant/training/create-category`, body);
  }
  // methods from migration module clasroom
  static async getCapacitation(capacitationId: number) {
    return await http.get<Capacitation>(`/tenant/training/${capacitationId}`);
  }

  static async getStudentsTraining(trainingId: number) {
    return await http.get<Array<{ id: number; name: string }>>(
      `/tenant/training/content/task_group/participant/list/${trainingId}`
    );
  }

  static async getStudentsTask(taskId: number) {
    return await http.get<{ groups: Array<GroupTask>; participants: [] }>(
      `/tenant/training/content/task_group/list/${taskId}`
    );
  }

  static async deleteStudentsTask(userId: number) {
    return await http.delete(
      `/tenant/training/content/task_group/participant/delete/${userId}`
    );
  }

  static async addStudentsTask(
    training_task_group_id: number,
    training_participant_id: number
  ) {
    return await http.post<any>(
      `/tenant/training/content/task_group/participant/set`,
      {
        training_task_group_id,
        training_participant_id,
      }
    );
  }

  static async addGroupTask(training_content_id: number, name: string) {
    return await http.post<any>(`/tenant/training/content/task_group/set`, {
      training_content_id,
      name,
    });
  }

  static async deleteGroupTask(id: number) {
    return await http.delete(
      `/tenant/training/content/task_group/delete/${id}`
    );
  }

  static async downloadAllCertificates(trainingId: number) {
    const response = await http.getBlob(
      `/tenant/training/certificate/download/zip/${trainingId}`
    );

    const isJson = response.data.type.includes("application/json");
    if (isJson) {
      const text = await response.data.text();
      const json = JSON.parse(text);
      if (json.success === false) {
        throw new Error(json.message);
      }
    }
    return response;
  }
}
