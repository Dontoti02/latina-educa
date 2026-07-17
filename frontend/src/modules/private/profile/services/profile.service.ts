import { ProfileFormDto } from '../dto/profile.dto'
import { tryDomainTask } from '@/common/domain/try'
import { CaseConverter } from '@/modules/app/utils/CaseConverter'
import ProfileRepository from '@/modules/private/profile/repository/profile.repository'
import { ToastService } from '@/common/util/toast.service'
import { SessionStore } from '@/common/store'

class ProfileService {
  private sessionStore = SessionStore()

  constructor() {
    this.sessionStore = SessionStore()
  }

  async updateInfo(body: ProfileFormDto) {
    return tryDomainTask<string>(async () => {
      const { success, message, data } = await ProfileRepository.updateInfo(
        body,
        this.sessionStore.roles[0].pivot.user_id,
        this.sessionStore.current_role
      )

      this.sessionStore.set({
        ...this.sessionStore.get(),
        user: {
          email: body.email,
          names: body.names,
          photo: this.sessionStore.get().user?.photo ?? null
        }
      })

      ToastService.success('Datos actualizados correctamente')
      return {
        success,
        message,
        data: CaseConverter.snakeToCamel<typeof data, string>(data)
      }
    })
  }

  async changePassword(password: string) {
    return tryDomainTask<string>(async () => {
      const { success, message, data } = await ProfileRepository.changePassword(
        password,
        this.sessionStore.roles[0].pivot.user_id
      )

      ToastService.success('Contraseña actualizada correctamente')
      return {
        success,
        message,
        data: CaseConverter.snakeToCamel<typeof data, string>(data)
      }
    })
  }

  async changePhoto(photo: File) {
    return tryDomainTask<string>(async () => {
      const { success, message, data } = await ProfileRepository.changePhoto(
        { file: photo },
        this.sessionStore.roles[0].pivot.user_id
      )

      this.sessionStore.set({
        ...this.sessionStore.get(),
        user: {
          email: this.sessionStore.get().user?.email ?? '',
          names: this.sessionStore.get().user?.names ?? '',
          photo: data
        }
      })

      ToastService.success('Foto actualizada correctamente')
      return {
        success,
        message,
        data: CaseConverter.snakeToCamel<typeof data, string>(data)
      }
    })
  }

  async deletePhoto() {
    return tryDomainTask<string>(async () => {
      const { success, message, data } = await ProfileRepository.deletePhoto(
        this.sessionStore.roles[0].pivot.user_id
      )

      this.sessionStore.set({
        ...this.sessionStore.get(),
        user: {
          email: this.sessionStore.get().user?.email ?? '',
          names: this.sessionStore.get().user?.names ?? '',
          photo: null
        }
      })

      ToastService.success('Foto eliminada correctamente')
      return {
        success,
        message,
        data: CaseConverter.snakeToCamel<typeof data, string>(data)
      }
    })
  }
}

export default new ProfileService()
