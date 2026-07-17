import { GlobalPagination } from "../global";
import { JobOfferFiltersResponse } from "./job-offer";

export type JobOfferFiltersPublic = Omit<JobOfferFiltersResponse,'departments' | 'provincies' |'isAdmin'|'companies'> 


export type JobOfferPublic = {
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
}

export type JobOfferListPublicPagination = { 
  items : Array<JobOfferPublic>
  pagination : GlobalPagination
}

export type JobOfferDetailPublic = {
  company: {
    name: string
    description : string | null
    logo: string
    address: string
    about: string | null
    website : string | null
    isVerified: boolean
  }
  slug: string
  categoryName : string
  locationName : string
  contractTypeName : string
  scheduleName : string
  title : string
  description : string | null
  requirements : string | null
  benefits : string | null
  salary : number | null
  salaryCurrency : string | null
  publicationDate : string
  isLoggedIn : boolean
  alreadyPostulated : boolean
  isActive : boolean
}
