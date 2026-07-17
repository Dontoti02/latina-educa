import http from '@/common/http'
import type { StudentScore } from '@/models/student-scores'

export class StudentScoresService {
  static async getStudentScores(classroom: number) {
    return await http.get<StudentScore>(`/tenant/evaluation/list/${classroom}`)
  }

  static async getStudentScoresForTeacher(classroomId: number, personId: number) {
    return await http.get<StudentScore>(`/tenant/evaluation/list/${classroomId}/${personId}`)
  }
}
