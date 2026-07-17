import http from '@/common/http'
import type { Attendance, AttendanceListItem, AttendanceListRequest, AttendanceMark, AttendanceCreateRequest } from '@/models/attendance'

export class AttendanceService {
  static async getAttendanceDates(classroomId: number) {
    return await http.get<AttendanceListItem[]>(`/tenant/assistance/dates/${classroomId}`)
  }

  static async getAttendanceList(body: AttendanceListRequest) {
    return await http.post<Attendance[]>('/tenant/assistance/list', body)
  }

  static async createAttendance(body: AttendanceCreateRequest) {
    return await http.post<Attendance[]>('/tenant/assistance/create', body)
  }

  static async markAttendance(studentId: number, body: AttendanceMark) {
    return await http.put(`/tenant/assistance/mark/${studentId}`, body)
  }

  static async downloadAttendanceConsolidated(type: 'xlsx' | 'pdf', classroom_id: number) {
    return await http.getBlob(`/tenant/export/execute/attendance-consolidated/${type}?classroom_id=${classroom_id}`)
  }

  static async downloadAttendanceReport(type: 'xlsx' | 'pdf', body: AttendanceListRequest) {
    return await http.getBlob(`/tenant/export/execute/absences/${type}?classroom_id=${body.classroom_id}&date=${body.date}`)
  }
  static async deleteAttendanceList(body: AttendanceListRequest) {
    return await http.post<Attendance[]>('/tenant/assistance/delete', body)
  }
}
