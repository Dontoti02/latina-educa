import { FormCreatePaymentConcept } from "@/models/payment-concepts";

export class FormCreatePaymentConceptAdapter  {

  public static transformSnakeCase(form:FormCreatePaymentConcept) {
    const { name, denominationId, gross_amount,igv_amount,net_amount, maxQuotas, canBePaidInQuotas, includeInEnrollment } = form
    return {
      name:name,
      treasury_denomination_id: denominationId,
      gross_amount: gross_amount,
      igv_amount: igv_amount,
      net_amount: net_amount,
      max_quotas: maxQuotas,
      include_in_enrollment: includeInEnrollment,
      can_be_paid_in_quotas: canBePaidInQuotas,
      code : form.code
    }
  }
}
