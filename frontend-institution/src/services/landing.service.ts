import http from '@/common/http'
import type { GetLandingPage, LandingData } from '@/models/landing'

export class LandingService {
  static async getLandingData() {
    return await http.get<GetLandingPage>('/tenant/system_configuration/landing_page')
  }

  static async updateLandingData(data: string) {
    return await http.postFormData('/tenant/system_configuration/update/landing_page', { value: data })
  }

  static async uploadImage(file: File) {
    return await http.postFormData<string>('/tenant/system_configuration/upload/image', { file })
  }

  static async deleteImage(path: string) {
    return await http.delete(`/tenant/system_configuration/delete/image?path=${path}`)
  }

  static async getLandingDataStatic() {
    return await http.get<LandingData>('/tenant/system_configuration/landing_page')
  }
}
