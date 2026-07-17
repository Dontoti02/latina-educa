import http from "@/common/http"
import { CheckApplicantResponse, FindJobOffer, JobOfferCreateForm, JobOfferFiltersResponse, JobOfferListPagination, JobOffersFiltersForm } from "@/models/job-opportunities/job-offer"
import { JobOfferDetailPublic, JobOfferFiltersPublic, JobOfferListPublicPagination } from "@/models/job-opportunities/public-job-offer"

type FindOfferKey = 'slug' | 'id'

export class JobOpportunitiesJobOfferService {
  static async filters() {
    return await http.get<JobOfferFiltersResponse>(`/tenant/job-opportunities/offers/filters`)
  }

  static async list(filters: JobOffersFiltersForm) {
    return await http.post<JobOfferListPagination>('/tenant/job-opportunities/offers/list', filters)
  }

  static async create(form:JobOfferCreateForm) {
    return await http.post<void>('/tenant/job-opportunities/offers/create', form)
  }
  

  static async find(key :FindOfferKey ,value: string) {
    return await http.get<FindJobOffer>(`/tenant/job-opportunities/offers/find?${key}=${value}`)
  }

  static async update(id: number, form: JobOfferCreateForm) {
    return await http.put<void>(`/tenant/job-opportunities/offers/update/${id}`, form)
  }

  static async delete(id: number) {
    return await http.delete<void>(`/tenant/job-opportunities/offers/delete/${id}`)
  }
  
  static async changeState(id: number, state: string) {
    return await http.put<void>(`/tenant/job-opportunities/offers/change-state`, { new_status:state,id })
  }

  static async checkApplicant(slug: string) {
    return await http.get<CheckApplicantResponse>(`/tenant/job-opportunities/applicants/check-offer/${slug}`)
  }

  static async uploadCV(file: File) {
    return await http.postImage<{
      id: number
      name: string
      url: string
    } | null>(`/tenant/job-opportunities/applicants/upload-cv`, {file}, {
      headers: {
      'Content-Type': 'multipart/form-data'
      }
    })
  }

  static async applyToOffer(data : {
    fullname: string
    cvId: number,
    message: string,
    offerId: number
  }) {
    return await http.post<CheckApplicantResponse>(`/tenant/job-opportunities/applicants/apply-offer`, data)
  }
  // public 
  static async publicfilters() {
    return await http.get<JobOfferFiltersPublic>(`/tenant/job-opportunities/public/offers/filters`)
  }

  static async publicList(filters: JobOffersFiltersForm) {
    return await http.post<JobOfferListPublicPagination>('/tenant/job-opportunities/public/offers/list', filters)
  }

  static async publicDetail(slug: string) {
    return await http.get<JobOfferDetailPublic>(`/tenant/job-opportunities/public/offers/slug/${slug}`)
  }
}
