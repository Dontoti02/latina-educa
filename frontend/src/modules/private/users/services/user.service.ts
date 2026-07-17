import { tryDomainTask } from '@/common/domain/try'
import { CaseConverter } from '@/modules/app/utils/CaseConverter'
import UserRepository from '@/modules/private/users/repository/user.repository'
import {
  CreateUserFormDto,
  CreationParamsDto,
  PasswordUserFormDto,
  UpdateUserFormDto,
  UsersDto,
  UsersFormDto
} from '../dto/user.dto'
import { ToastService } from '@/common/util/toast.service'

class UserService {
  async getFilters() {
    return tryDomainTask<CreationParamsDto>(async () => {
      const { success, message, data } = await UserRepository.getFilters()

      return {
        success,
        message,
        data: CaseConverter.snakeToCamel<typeof data, CreationParamsDto>(data)
      }
    })
  }

  async getUsers(form: UsersFormDto) {
    return tryDomainTask<UsersDto>(async () => {
      const { success, message, data } = await UserRepository.getUsers(form)

      return {
        success,
        message,
        data: CaseConverter.snakeToCamel<typeof data, UsersDto>(data)
      }
    })
  }

  async toggleActivate(id: number) {
    return tryDomainTask<string>(async () => {
      const { success, message, data } = await UserRepository.toggleActivate(id)

      return {
        success,
        message,
        data: CaseConverter.snakeToCamel<typeof data, string>(data)
      }
    })
  }

  async delete(id: number) {
    return tryDomainTask<string>(async () => {
      const { success, message, data } = await UserRepository.delete(id)

      return {
        success,
        message,
        data: CaseConverter.snakeToCamel<typeof data, string>(data)
      }
    })
  }

  async createUser(form: CreateUserFormDto) {
    return tryDomainTask<string>(async () => {
      const { success, message, data } = await UserRepository.createUser(form)

      ToastService.success('Usuario creado exitosamente')
      return {
        success,
        message,
        data: CaseConverter.snakeToCamel<typeof data, string>(data)
      }
    })
  }

  async updateUser(id: number, form: UpdateUserFormDto) {
    return tryDomainTask<string>(async () => {
      const { success, message, data } = await UserRepository.updateUser(
        id,
        form
      )

      ToastService.success('Usuario actualizado exitosamente')
      return {
        success,
        message,
        data: CaseConverter.snakeToCamel<typeof data, string>(data)
      }
    })
  }

  async updatePassword(id: number, form: PasswordUserFormDto) {
    return tryDomainTask<string>(async () => {
      const { success, message, data } = await UserRepository.updatePassword(
        id,
        form
      )

      ToastService.success('Contraseña actualizada exitosamente')
      return {
        success,
        message,
        data: CaseConverter.snakeToCamel<typeof data, string>(data)
      }
    })
  }
}

export default new UserService()
