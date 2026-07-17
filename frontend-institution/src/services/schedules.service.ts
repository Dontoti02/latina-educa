import http from '@/common/http'
import type { AssignTeacherForm, ClassroomForSchedule, Schedule, ScheduleCreate, ScheduleFilters, ScheduleFiltersForReport, ScheduleFormByClassroom, ScheduleFormByReportSecretary, ScheduleUpdate, TeacherForSchedule } from '@/models/schedules'

export class ScheduleService {
  static async getFilters() {
    return http.get<ScheduleFilters>('/tenant/schedule/filters')
  }

  static async getSchedules(form: ScheduleFormByClassroom) {
    return http.post<Array<Schedule>>('/tenant/schedule/list', form)
  }

  static async getClassroomsForSchedule(form: ScheduleFormByClassroom) {
    return http.post<Array<ClassroomForSchedule>>('/tenant/schedule/list/classrooms', form)
  }

  static async getClassroomsExistingForSchedule(form: ScheduleFormByClassroom) {
    return http.post<Array<ClassroomForSchedule>>('/tenant/schedule/list/classrooms-existing', form)
  }

  static async createSchedule(form: ScheduleCreate) {
    return http.post('/tenant/schedule/create', form)
  }

  static async updateSchedule(id: number, form: ScheduleUpdate) {
    return http.put(`/tenant/schedule/update/${id}`, form)
  }

  static async deleteSchedule(id: number) {
    return http.delete(`/tenant/schedule/delete/${id}`)
  }

  static async getTeachersForSchedule(args: { period_id: number }) {
    return http.post<Array<TeacherForSchedule>>('/tenant/schedule/list/teachers', args)
  }

  static async assignTeacher(args: AssignTeacherForm) {
    return http.post('/tenant/schedule/assign/teacher', args)
  }

  static async downloadSchedule(type: 'xlsx' | 'pdf', form: ScheduleFormByClassroom) {
    return await http.getBlob(`/tenant/export/execute/schedule/${type}?period_id=${form.period_id}`)
  }

  static async downloadScheduleForSecretary(type: 'xlsx' | 'pdf', form: ScheduleFormByReportSecretary) {
    return await http.getBlob(`/tenant/export/execute/schedule/${type}?period_id=${form.period_id}&person_id=${form.person_id}&rol_id=${form.rol_id}`)
  }

  static async getFiltersForReport(formFilters: ScheduleFormByClassroom) {
    return http.post<Array<ScheduleFiltersForReport>>('/tenant/schedule/filters/export', formFilters)
  }
}
