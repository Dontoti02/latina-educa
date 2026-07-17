import { tryDomainTask } from '@/common/domain/try'
import { CaseConverter } from '@/modules/app/utils/CaseConverter'
import ParametersRepository from '@/modules/private/parameters/repository/parameters.repository'
import { ParameterDto, SystemParameters } from '../dto/parameters.dto'
import { SessionStore } from '@/common/store'
import { applyConfig } from '@/common/util/global'

class ParametersService {
  private session

  async getSystemParameters() {
    return tryDomainTask<Array<ParameterDto>>(async () => {
      const { success, message, data } =
        await ParametersRepository.getSystemParameters()

      return {
        success,
        message,
        data: CaseConverter.snakeToCamel<typeof data, Array<ParameterDto>>(data)
      }
    })
  }

  async updateParameters(key: string, value: string | File | null) {
    return tryDomainTask<string>(async () => {
      const { success, message, data } =
        await ParametersRepository.updateParameters(key, value)

      return {
        success,
        message,
        data: CaseConverter.snakeToCamel<typeof data, string>(data)
      }
    })
  }

  async getGeneralSysParams() {
    this.session = SessionStore()
    return tryDomainTask<SystemParameters>(async () => {
      const { success, message, data } =
        await ParametersRepository.getGeneralSysParams()

      if (
        this.session.system_parameters === null ||
        new Date(this.session.system_parameters.last_date) <
          new Date(data.last_date)
      ) {
        this.session.set({
          ...this.session,
          system_parameters: data
        })

        applyConfig()
      }

      return {
        success,
        message,
        data: CaseConverter.snakeToCamel<typeof data, SystemParameters>(data)
      }
    })
  }
}

export default new ParametersService()
