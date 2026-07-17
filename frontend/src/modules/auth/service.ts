import { tryDomainTask } from '@/common/domain/try'
import repository from './repository'
import { SessionStore } from '@/common/store'

class AuthService {
  async login(form: { email: string; password: string; remember: boolean }) {
    return tryDomainTask<void>(async () => {
      const { data } = await repository.login(form)
      const sessionStore = SessionStore()
      sessionStore.set({
        user: data.user,
        token: data.token,
        menu: data.menu,
        current_role: data.current_role,
        roles: data.roles,
        system_parameters: null
      })
    })
  }

  logout() {
    return tryDomainTask<void>(async () => {
      const sessionStore = SessionStore()
      sessionStore.remove()
    })
  }

  resetPassword(email: string) {
    return tryDomainTask(() => repository.resetPassword(email))
  }

  verifyResetToken(resetToken: string) {
    return tryDomainTask(() => repository.verifyResetToken(resetToken))
  }

  changePassword(form: { email: string; password: string; token: string }) {
    return tryDomainTask(() => repository.changePassword(form))
  }
}

export default new AuthService()
