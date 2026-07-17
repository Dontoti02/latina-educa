import http from '@/common/http'
import type { UserRole } from '@/models/role'

export class RoleService {
  static async getList() {
    return await http.get<UserRole[]>('/tenant/rol/list')
  }
  
}
