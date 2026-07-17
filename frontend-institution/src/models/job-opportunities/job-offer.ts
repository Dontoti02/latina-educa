import { GlobalPagination } from "../global"

export type JobOfferFilterDate = 'today' | 'week' | 'month' | 'year'

export type JobOfferFiltersResponse = {
  categories : Array<{
    id : number
    name : string
  }>
  contractTypes : Array<{
    id : number
    name : string
  }>
  locations : Array<{
    id : number
    name : string
  }>
  schedules : Array<{
    id : number
    name : string
  }>
  companies : Array<{
    id : number
    name : string
  }>
  salaryRanges : Array<{
    id : number
    name : string
  }>
  dateFilters : Array<{
    name : string
    id : JobOfferFilterDate
  }>
  orderBy : Array<{
    name : string
    id : string
  }>
  departments : Array<{
    department : string
  }>
  provincies : Array<{
    province : string
  }>
  isAdmin : boolean
}

export type JobOfferFilters =  Omit<JobOfferFiltersResponse, 'provincies'| 'departments'> & {
  departments: { name: string; id: number }[]
  provincies: { name: string; id: number }[]
}

export type JobOffersFiltersForm = {
  orderBy : string | null
  categoryId : number | null
  dateFilter : string | null
  salary : string | null
  scheduleId : string | null
  locationId : string | null
  contractTypeId : string | null
  province : string | null
  companyId : number | null
  search : string | null
  perPage : number
  page : number
}

export type JobOfferCreateForm = {
  title : string
  description : string
  requirements : string
  benefits : string
  companyId : number | null
  categoryId : number | null
  locationId : number  | null
  contractTypeId : number | null
  scheduleId : number | null
  salary : number
  salaryCurrency : string
  address : string
  department : string
  province : string
  country : string
  publicationDate : string
  attachments : Array<File> | null
}

export type JobOfferListPagination = { 
  items : JobOfferListResponse
  pagination : GlobalPagination
}

export type JobOfferListResponse = Array<JobOffer>

export type JobOffer = {
  id : number
  title : string
  slug : string
  description : string
  requirements : string
  benefits : string
  companyId : number
  companyName : string
  categoryId : number
  categoryName : string
  locationId : number
  locationName : string
  contractTypeId : number
  contractTypeName : string
  scheduleId : number
  scheduleName : string
  salary : number
  salaryCurrency : string
  address : string
  department : string
  province : string
  country : string
  publicationDate : string
  deadline : string
  state : {
    id : number
    key : string
    name : string
  }
}

export type FindJobOffer = {
  id : number
  title : string
  description : string
  requirements : string
  benefits : string
  companyId : number
  categoryId : number
  locationId : number
  contractTypeId : number
  scheduleId : number
  salary : number
  salaryCurrency : string
  address : string
  department : string
  province : string
  country : string
  publicationDate : string
  deadline : string
  state : {
    id : number
    key : string
    name : string
  }
}


export type CheckApplicantResponse = {
  hasApplied: boolean;
  applicationId?: number;
  offerId: number;
  offerSlug: string;
  offerTitle: string;
  isActive : boolean;
  applicantName : string;
  cvs : [
    {
      version : string
      id : number;
      url : string
    }
  ]
}
