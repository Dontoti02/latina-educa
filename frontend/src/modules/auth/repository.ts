import http from '@/common/http'
import { SessionDTO } from './dto'

class AuthRepository {
  readonly #baseUrl = '/admin/auth'

  login(data: { email: string; password: string; remember: boolean }) {
    return http.post<SessionDTO>(this.#baseUrl + '/login', data)
  }

  resetPassword(email: string) {
    return http.put(this.#baseUrl + '/reset/password', {
      email
    })
  }

  verifyResetToken(token: string) {
    return http.get<{ success: boolean; message: string }>(
      this.#baseUrl + '/check/reset/password?token=' + token
    )
  }

  changePassword(form: { email: string; password: string; token: string }) {
    return http.put(this.#baseUrl + '/change/password', form)
  }
}

export default new AuthRepository()
