
export type FiltersPaymetConcepts = {
  page: number
  limit: number
  search?: string
  order?: string
}

export type ListScales = {
  items : Scale[],
  pagination : {
    page: number
    pages: number
    total: number
  },
  igv_amount: number,
}
export type Scale={
  id: number
  name: string
  scale_amount: number
}

export type ListPaymentConcepts = {
  items : PaymentConcept[],
  pagination : {
    page: number
    pages: number
    total: number
  },
  igv_amount: number,
}
export type ActionsPaymentConceptTable =  'edit' | 'toggle' | 'detail'
export type ActionsScaleTable =  'edit' | 'delete'

export type EventPaymentConceptTable = {
  [key in ActionsPaymentConceptTable]: (item: PaymentConcept) => void
}
export type EventScaleTable = {
  [key in ActionsScaleTable]: (item: Scale) => void
}

export type PaymentConcept = {
  id: number,
  code: string,
  name: string,
  denomination: string,
  denominationId: number,
  gross_amount: number,
  net_amount: number,
  igv_amount: number,
  maxQuotas: number,
  isActive: boolean,
  canBePaidInQuotas: boolean,
  includeInEnrollment: boolean,
  createdAt: string,
  updatedAt: string | null
  isEnrollmment: boolean
  isPension: boolean
}

export interface FormCreateScale {
  name: string | null
  scale_amount: number
}

export interface FormCreatePaymentConcept {
  name: string | null
  denominationId: number
  gross_amount: number
  igv_amount: number
  net_amount: number
  maxQuotas: number
  canBePaidInQuotas: boolean,
  includeInEnrollment: boolean
  code?:string | null
}
export interface ConceptMovements {
  id:                          number;
  code:                        string;
  treasury_movement_type_id:   number;
  treasury_payment_concept_id: number;
  period_id:                   number;
  person_id:                   number;
  person_registration_id:      number;
  amount:                      string;
  initial_amount:              string;
  amount_to_divide:            string;
  quotas:                      number;
  is_paid:                     boolean;
  remaining_amount:            string;
  due_date:                    Date;
  payment_date:                null;
  created_at:                  Date;
  updated_at:                  Date;
  deleted_at:                  null;
  refund_movement_id:          null;
  person:                      Person;
}

export interface Person {
  id:              number;
  document_type:   string;
  document_number: string;
  names:           string;
  phone:           string;
  email:           string;
  sex:             string;
  birth_date:      Date;
  native_language: null;
  created_at:      Date;
  updated_at:      Date;
  deleted_at:      null;
}

