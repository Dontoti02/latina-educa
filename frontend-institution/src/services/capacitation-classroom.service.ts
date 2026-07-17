import http from '@/common/http'
import type { Course, CoursesPerPeriod } from '@/models/courses'

export class CapacitationClassroomService {
  static async getClassrooms(period_id?: number) {
    return await http.post<
    Array<CoursesPerPeriod>
    >('/tenant/training/list', {
      period_id,
    })
  }

  static async getClassroom(classroom_id: number) {
    return await http.get<Course>(`/tenant/training/${classroom_id}`)
  }

  static async toggleFavorite(classroom_id: number) {
    return await http.put(`/tenant/training/update/favorite/${classroom_id}`, {})
  }

  static async uploadImage(data: { classroom_id: number; file: File }) {
    return await http.postFormData<string>('/tenant/training/update/image', data)
  }
}
