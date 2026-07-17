import http from '@/common/http'
import type { SecretaryDashboard, StudentDashboard } from '@/models/dashboard'

export class DashboardService {
  static async getStudentDashboard() {
    return await http.get<StudentDashboard | SecretaryDashboard>('/tenant/home')
  }
}
