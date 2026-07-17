export type FormRegisterCompany = {
  name: string
  email: string
  ruc: string
  phone: string
  address: string
  mailbox : string | null
  website: string | null
  description: string | null
}

export type Company = {
  id: number
  name: string
  email: string
  ruc: string
  phone: string
  address: string
  mailbox : string | null
  website: string | null
  description: string | null
  logo : string | null
  isVerified: boolean
  totalOffers: number
}


export type ProfileCompanyForm = {
  name: string
  email: string
  ruc: string
  phone: string
  address: string
  mailbox : string | null
  website: string | null
  description: string | null
  logo : string | null
}
