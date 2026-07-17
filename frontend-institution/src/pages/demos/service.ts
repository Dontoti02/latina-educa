import { tryDomainTask } from '@/common/domain/try'
import http from '@/common/http'

class TestFileService {
  readonly #baseUrl = '/tenant/public'

  test() {
    return tryDomainTask(() => http.get(`${this.#baseUrl}/test`))
  }

  classroomUpdateImage(data: {
    classroomId: number
    files: File[]
  }) {
    return tryDomainTask(() => http.postFormData('/tenant/classroom/update/image', data))
  }
}

export default new TestFileService()
