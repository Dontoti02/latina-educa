export type InstitutionModule = {
  id: number;
  name : string;
  moduleKey :InstitutionModuleType,
  institutionId : number
  startDate : string;
  endDate : string;
  isActive : boolean;
}

export enum InstitutionModuleType {
  MODULE_JOB_OFFER = 'bolsa_laboral'
}