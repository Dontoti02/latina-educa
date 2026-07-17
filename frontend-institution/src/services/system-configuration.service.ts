import http from '@/common/http'
import type { GeneralSystemConfiguration, SystemConfigurationItem } from '@/models/system-configurations'

export class SystemConfigurationService {
  static async getSystemConfiguration() {
    return await http.get<Array<SystemConfigurationItem>>('/tenant/system_configuration/list')
  }

  static async updateConfiguration(key: string, value: string | File | null) {
    return await http.postFormData<string>(`/tenant/system_configuration/update/${key}`, { value })
  }

  static async getGeneralSysConfig() {
    return await http.get<GeneralSystemConfiguration>('/tenant/system_configuration/general')
  }
}
