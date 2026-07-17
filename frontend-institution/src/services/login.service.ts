import http from '@/common/http'
import type { ChangePasswordForm, LoginBody, Menu, Profile, UserInfo } from '@/models/login'

export class LoginService {
  static async login(body: LoginBody) {
    return await http.post<UserInfo>('/tenant/auth/login', body)
  }

  static async changeRole(role_id: number) {
    return await http.put<number>(`/tenant/rol/change/${role_id}`, {})
  }

  static async resetPassword(email: string) {
    return await http.put('/tenant/auth/reset/password', { email })
  }

  static async checkResetToken(token: string) {
    return await http.get(`/tenant/auth/check/reset/password?token=${token}`)
  }

  static async changePassword(form: ChangePasswordForm) {
    return await http.put('/tenant/auth/change/password', form)
  }

  static async menu() {
    return await http.get<Menu[]>('/tenant/menu')
  }

  static async profile() {
    return await http.get<Profile>('/tenant/profile')
  }

}
