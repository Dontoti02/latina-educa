import http from '@/common/http'
import { ParameterDto, ParameterType, SystemParameters } from '../dto/parameters.dto'

class ParametersRepository {
  async getSystemParameters() {
    return await http.get<Array<ParameterDto>>(
      '/admin/system_configuration/list'
    )
  }

  async updateParameters(key: string, value:ParameterType) {
    if (value instanceof File) {
      return await http.postFormData<{value:File},string>(
        `/admin/system_configuration/update/${key}`,
        {value} 
      )
    }
    
    return await http.post<string>(
      `/admin/system_configuration/update/${key}`,
      { value }
    )
  }

  async getGeneralSysParams() {
    return await http.get<SystemParameters>(
      '/admin/system_configuration/general'
    )
  }
}

export default new ParametersRepository()
