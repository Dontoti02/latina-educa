export interface Movements {
    data:         Movement[];
    total:        number;
    per_page:     string;
    current_page: string;
    last_page:    number;
}

export interface Movement {
    payment_date:       string;
    concept:            string;
    amount:             string;
    remaining_payments: string;
    due_date:           string;
    total_amount:       string;
    status:             string;
    type:               string;
    details:            MovementDetails[];
    movement_id: number;
    periods:        Periods[];
}
export interface Periods {
id:         number;
name:       string;
status:     string;
start_date: string;
end_date:   string;
}

export interface MovementDetails{
    id:                             number;
    treasury_movement_id:           number;
    treasury_payment_concept_id:    number;
    person_registration_payment_id: number;
    person_created_schedule_by:     number;
    amount:                         string;
    is_paid:                        boolean;
    due_date:                       string;
    emission_date:                  string;
    payment_date:                   string;
    index:                          number;
}
export interface MovementsDetails {
    nextMovements:  MovementDetails[];
    payedMovements: MovementDetails[];
}

export interface MovementByConcept {
    id:                          number;
    code:                        string;
    treasury_movement_type_id:   number;
    treasury_payment_concept_id: number;
    period_id:                   number;
    person_id:                   number;
    person_registration_id:      number;
    amount:                      number;
    initial_amount:              number;
    amount_to_divide:            number;
    quotas:                      number;
    is_paid:                     boolean;
    remaining_amount:            number;
    due_date:                    string;
    payment_date:                string;
    isSelected:                  boolean;
}

export interface ConceptHistory {
    id:                          number;
    code:                        string;
    name:                        string;
    treasury_payment_concept_id: number;
    treasury_denomination_id:    number;
    person_change_id:            number;
    amount:                      string;
    max_quotas:                  number;
    is_active:                   number;
    can_be_paid_in_quotas:       number;
    include_in_enrollment:       number;
    created_at:                  string;
    updated_at:                  string;
    deleted_at:                  null;
    person_change:               PersonChange;
    denomination:                Denomination;
    payment_concept:             PaymentConcept;
}

export interface Denomination {
    id:          number;
    name:        string;
    description: string;
    created_at:  Date;
    updated_at:  Date;
    deleted_at:  null;
}

export interface PaymentConcept {
    id:                       number;
    code:                     string;
    name:                     string;
    treasury_denomination_id: number;
    amount:                   string;
    max_quotas:               number;
    is_active:                boolean;
    can_be_paid_in_quotas:    boolean;
    include_in_enrollment:    boolean;
    created_at:               string;
    updated_at:               string;
    deleted_at:               null;
}

export interface PersonChange {
    id:              number;
    document_type:   string;
    document_number: string;
    names:           string;
    phone:           string;
    email:           string;
    sex:             null;
    birth_date:      null;
    native_language: null;
    created_at:      Date;
    updated_at:      Date;
    deleted_at:      null;
}

export interface Concept{
  id:                       number;
  code:                     string;
  name:                     string;
  treasury_denomination_id: number;
  gross_amount:                   string;
  igv_amount:                   string;
  net_amount:                   string;
  max_quotas:               number;
  is_active:                boolean;
  can_be_paid_in_quotas:    boolean;
  include_in_enrollment:    boolean;
  created_at:               string;
  updated_at:               string;
  deleted_at:               null;
}

export type ActionsPaymentTable =  'generate_invoice'

export type EventPaymentTable = {
  [key in ActionsPaymentTable]: (item: MovementDetails) => void
}

