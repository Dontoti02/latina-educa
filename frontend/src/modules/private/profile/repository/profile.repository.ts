import http from '@/common/http'
import { ProfileFormDto } from '../dto/profile.dto'

class ProfileRepository {
  async updateInfo(body: ProfileFormDto, userId: number, roleId: number) {
    return await http.put(`/admin/user/update/${userId}`, {
      ...body,
      rol_ids: [roleId]
    })
  }

  async changePassword(password: string, userId: number) {
    return await http.put(`/admin/user/change/password/${userId}`, { password })
  }

  async changePhoto(photo: { file: File }, userId: number) {
    return await http.postFormData<{file:File},string>(
      `/admin/user/change/photo/${userId}`,
      {file:photo.file}
    )
  }

  async deletePhoto(userId: number) {
    return await http.delete(`/admin/user/delete/photo/${userId}`)
  }
}

export default new ProfileRepository()
