import http from '@/common/http'
import { Company, FormRegisterCompany } from '@/models/job-opportunities/company'

export class JobOpportunitiesCompanyService {
  static async register(form : FormRegisterCompany) {
    return await http.post<void>(`/tenant/job-opportunities/public/companies/register`, form)
  }
  static async getCompanies() {
    return await http.get<Array<Company>>(`/tenant/job-opportunities/public/companies`)
  }

  //private
  static async profile() {
    return await http.get<Company>(`/tenant/job-opportunities/companies/profile`)
  }

  static async updateProfile(form: FormRegisterCompany) {
    return await http.put<void>(`/tenant/job-opportunities/companies/profile`, form)
  }

  static async uploadLogo(file: File) {
    return await http.postImage<string>(`/tenant/job-opportunities/companies/upload-logo`, { file }, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  static async deleteLogo() {
    return await http.delete<void>(`/tenant/job-opportunities/companies/delete-logo`)
  }

  static async verifyCompany(id: number) {
    return await http.put<void>(`/tenant/job-opportunities/companies/verify/${id}`)
  }
  static async unverifyCompany(id: number) {
    return await http.put<void>(`/tenant/job-opportunities/companies/unverify/${id}`)
  }
  static async deleteCompany(id: number) {
    return await http.delete<void>(`/tenant/job-opportunities/companies/delete/${id}`)
  }

}
