import http from '@/common/http'
import type { StudentScore } from '@/models/student-scores'

export class CapacitationStudentScoresService {
  static async getStudentScores(classroom: number) {
    return await http.get<StudentScore>(`/tenant/training/evaluation/list/${classroom}`)
  }

  static async getStudentScoresForTeacher(classroomId: number, personId: number) {
    return await http.get<StudentScore>(`/tenant/training/evaluation/list/${classroomId}/${personId}`)
  }
}
