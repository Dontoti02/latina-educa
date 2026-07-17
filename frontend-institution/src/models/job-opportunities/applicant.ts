import { GlobalPagination } from "../global";

export type LastOffers = {
  id : number;
  title : string;
  slug : string;
  publicationDate : string;
}

export type MyApplicant = {
  id: number;
  offerId: number;
  offerTitle: string;
  offerSlug: string;
  applicationDate: string;
  status: string;
  totalApplications: number;
}
export type MyApplications = {
  applications  : MyApplicant[];
  pagination : GlobalPagination;
  lastOffers : LastOffers[];
}

export type CV = {
  id: number;
  version : string;
  url : string;
  createdAt : string;
}

export type FiltersAplications = {
   permission : {
    state : boolean;
    message: string;
  },
  filters : {
    companies : Array<{ id: number; name: string }>;
    offers: Array<{ id: number; title: string; companyId : number }>;
  }
}

export type ApplicationsByOffer = {
  applicants: Applicant[];
  offer: {
    id : number;
    title : string;
    slug : string;
  };
}
export type Applicant = {
   id : number,
  fullname : string,
  message : string,
  status : string,
  appliedAt :string,
  userId :number,
  email : string,
  phone : string,
  cvUrl : string
}


export enum ApplicationStateEnum {
  POSTULATED = 'postulated',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
}
