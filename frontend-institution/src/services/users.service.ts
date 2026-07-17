import http from '@/common/http'
import type { FormCreateUser, FormGetUsers, FormPasswordUser, FormUpdateUser, FormUpdateUserAdmin, ParamsForCreation, UserList } from '@/models/users'

export class UsersService {
  static async getUsers(form: FormGetUsers) {
    return await http.post<UserList>('/tenant/user/list', form)
  }

  static async updateUser(id: number, form: FormUpdateUser | FormUpdateUserAdmin) {
    return await http.put(`/tenant/user/update/${id}`, form)
  }

  static async updatePassword(id: number, form: FormPasswordUser) {
    return await http.put(`/tenant/user/change/password/${id}`, form)
  }

  static async resetPassword(id: number) {
    return await http.put(`/tenant/user/reset/password/${id}`, {})
  }

  static async toggleActivate(id: number) {
    return await http.put(`/tenant/user/disable/${id}`, {})
  }

  static async delete(id: number) {
    return await http.delete(`/tenant/user/delete/${id}`)
  }

  static async changePhoto(id: number, photo: { file: File }) {
    return await http.postFormData<string>(`/tenant/user/change/photo/${id}`, photo)
  }

  static async deletePhoto(id: number) {
    return await http.delete(`/tenant/user/delete/photo/${id}`)
  }

  static async createUser(form: FormCreateUser) {
    return await http.post('/tenant/user/create', form)
  }

  static async getParamsForCreation() {
    return await http.get<ParamsForCreation>('/tenant/user/params')
  }
}
