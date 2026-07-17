import http from '@/common/http'
import type { Attendance, AttendanceListItem, AttendanceListRequest, AttendanceMark, CapacitationAttendanceCreateRequest, CapacitationAttendanceListRequest } from '@/models/attendance'

export class CapacitationAttendanceService {
  static async getAttendanceDates(classroomId: number) {
    return await http.get<AttendanceListItem[]>(`/tenant/training/assistance/dates/${classroomId}`)
  }

  static async getAttendanceList(body: CapacitationAttendanceListRequest) {
    return await http.post<Attendance[]>('/tenant/training/assistance/list', body)
  }

  static async createAttendance(body: CapacitationAttendanceCreateRequest) {
    return await http.post<Attendance[]>('/tenant/training/assistance/create', body)
  }

  static async markAttendance(studentId: number, body: AttendanceMark) {
    return await http.put(`/tenant/training/assistance/mark/${studentId}`, body)
  }

  static async downloadAttendanceConsolidated(type: 'xlsx' | 'pdf', training_id: number) {
    return await http.getBlob(`/tenant/export/execute/capacitation-attendance-consolidated/${type}?training_id=${training_id}`)
  }

  static async downloadAttendanceReport(type: 'xlsx' | 'pdf', body: CapacitationAttendanceListRequest) {
    return await http.getBlob(`/tenant/export/execute/capacitation-absences/${type}?training_id=${body.training_id}&date=${body.date}`)
  }
  static async deleteAttendanceList(body: CapacitationAttendanceListRequest) {
    return await http.post<Attendance[]>('/tenant/training/assistance/delete', body)
  }
}
