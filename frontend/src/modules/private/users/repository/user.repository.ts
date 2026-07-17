import http from '@/common/http'
import {
  CreateUserFormDto,
  CreationParamsDto,
  PasswordUserFormDto,
  UpdateUserFormDto,
  UsersDto,
  UsersFormDto
} from '@/modules/private/users/dto/user.dto'

class UserRepository {
  async getUsers(form: UsersFormDto) {
    return await http.post<UsersDto>('/admin/user/list', form)
  }

  async getFilters() {
    return await http.get<CreationParamsDto>('/admin/user/params')
  }

  async createUser(form: CreateUserFormDto) {
    return await http.post('/admin/user/create', form)
  }

  async updateUser(id: number, form: UpdateUserFormDto) {
    return await http.put(`/admin/user/update/${id}`, form)
  }

  async updatePassword(id: number, form: PasswordUserFormDto) {
    return await http.put(`/admin/user/change/password/${id}`, form)
  }

  async toggleActivate(id: number) {
    return await http.put(`/admin/user/disable/${id}`, {})
  }

  async delete(id: number) {
    return await http.delete(`/admin/user/delete/${id}`)
  }
}

export default new UserRepository()
