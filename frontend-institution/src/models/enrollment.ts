  export interface PersonalData {
    documentType: string;
    documentNumber: string;
    lastName: string;
    firstName: string;
    birthDate: string;
    gender: string;
    maritalStatus: string;
    country: string;
    department: string;
    province: string;
    district: string;
  }
  export interface searchPerson{
    person_id: number,
    gender: string,
    document_number: string,
    name: string,
    names: string
  }
  export interface Enrolls{
    id:number,
    registration_date: string,
    is_full_payment: boolean
    scale_authorization_document_number:number,
    scale_authorization_full_names:string,
    scale_authorization_document_type:number,
    observations:string,
    names:string,
    document_number:number,
    study_program:string,
    study_plan:string,
    cycle:string,
    shift:string,
    section:string,
    period:string,
    scale:string,
    scale_amount:number
  }
  export interface ContactData{
    actualAddress: string,
    permanentAddress: string,
    cellphone: number,
    telephone: number,
    email: string,
  }
  export interface AcademicData{
      admissionDate: String,
      previousSchool: String,
      modularCode: String,
      graduationYear: Number,
      schoolType: String,
      schoolCategory: String,
      studentCondition: String,
      observations: String,
      CEVA_certificate:String,
      studentPhoto: File,
      academicValidation: File
  }
  export interface FamiliarData{
      documentType:String,
      documentNumber:Number,
      fullName:String,
      phone:Number,
      mobile:Number,
      email:String,
      address:String,
      occupation:String,
      relationship:String,
  }
  export interface Enrollment{
      haveScale:Boolean,
      enrollmentDate:String,
      period:String,
      studyProgram:String,
      studyPlan:String,
      cycle:String,
      shift:String,
      section:String,
      fullPayment:Boolean,
      documentType:String,
      documentNumber:Number,
      fullName:String,
      scale:String,
      observations:String
  }
  export interface FinalEnrollment{
    haveScale:Boolean|null,
    enrollmentDate:String|null,
    period:Number|null,
    studyProgram:Number|null,
    studyPlan:Number|null,
    cycle:Number|null,
    shift:Number|null,
    section:Number|null,
    fullPayment:Boolean|null,
    documentType:String|null,
    documentNumber:Number|null,
    fullName:String|null,
    scale:Number|null,
    observations:String|null
}
export interface EnrollData{
  id: number,
  registration_date: string,
  is_full_payment: boolean,
  scale_authorization_document_number: number,
  scale_authorization_full_names: string,
  scale_authorization_document_type: string,
  observations: string,
  names: string,
  person_id:number,
  period_id:number,
  study_program_id:number,
  study_plan_id:number,
  cycle_id:number,
  shift_id:number,
  section_id:number,
  scale_id: number,
}

  export interface Period {
    id: number;
    name: string;
  }

  export interface StudyProgram {
    id: number;
    name: string;
    study_plans: StudyPlan[];
  }

  export interface StudyPlan {
    id: number;
    name: string;
  }

  export interface Cycle {
    id: number;
    name: string;
  }

  export interface Shift {
    id: number;
    name: string;
  }

  export interface Section {
    id: number;
    name: string;
  }

  export interface Scale {
    id: number;
    name: string;
    scale_amount: number;
  }

  export interface FormsData {
    period: Period[];
    study_program: StudyProgram[];
    study_plan: StudyPlan[];
    cycle: Cycle[];
    shift: Shift[];
    section: Section[];
    scale: Scale[];
  }

  export interface EnrollRegularStudent{
    personId: Number;
    enrollData: FinalEnrollment;
  }
  export interface EnrollNewStudent{
    enroll_data:FinalEnrollment;
    personal_data: PersonalData | null;
    contact_data: ContactData | null;
    academic_data: AcademicData | null;
    familiar_data: FamiliarData | null;
  }
  export interface ExistingStudentData{
    document_number:Number,
    names: String,
    phone:Number,
    email:String
  }