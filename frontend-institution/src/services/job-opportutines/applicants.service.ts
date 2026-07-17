import http from "@/common/http"
import { ApplicationsByOffer, CV, FiltersAplications, MyApplications } from "@/models/job-opportunities/applicant"

export class JobOpportunitiesApplicantService {
  static async myApplications(page = 1) {
    return await http.get<MyApplications>(`/tenant/job-opportunities/applicants/my-applications?page=${page}`)
  }

  static async cancelApplication(applicantId: number) {
    return await http.delete<void>(`/tenant/job-opportunities/applicants/cancel/${applicantId}`)
  }

  static async myCVs() {
    return await http.get<CV[]>(`/tenant/job-opportunities/applicants/my-cvs`);
  }

  static async deleteMyCV(cvId: number) {
    return await http.delete<void>(`/tenant/job-opportunities/applicants/my-cvs/${cvId}`);
  }

  static async byOfferFilters(params: {
    offerId: number | null;
    companyId: number | null;
  }) {
    const toQueryString = (params: Record<string, any>) => {
      return Object.entries(params)
        .filter(([_, value]) => value !== null && value !== undefined)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
    }
    return await http.get<FiltersAplications>(`/tenant/job-opportunities/applicants/by-offer/filters?${toQueryString(params)}`);
  }

  static async byOffer(params: {
    offerId: number;
    companyId: number | null;
  }) {
    const toQueryString = (params: Record<string, any>) => {
      return Object.entries(params)
        .filter(([_, value]) => value !== null && value !== undefined)
        .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
        .join('&');
    }
    return await http.get<ApplicationsByOffer>(`/tenant/job-opportunities/applicants/by-offer?${toQueryString(params)}`);
  }

  static async setState(body : {
    applicantId: number, state: string,feedback: string| null
  }) {
    return await http.put<void>(`/tenant/job-opportunities/applicants/set-state/${body.applicantId}`,
      {
        state: body.state,
        feedback: body.feedback || null
      }
    );
  }
}
