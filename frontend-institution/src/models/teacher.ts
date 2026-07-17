export interface TeacherItem {
  id: number;
  names: string;
  document_number: string;
  email: string;
  phone: string | null;
  birth_date: string | null;
  native_language: string | null;
  registration_date: string | null;
  resolution_number: string | null;
  sex: string | null;
  study_program_id: number | null;
  study_program_name: string | null;
  working_condition_id: number | null;
  working_condition_name: string | null;
}

export interface TeacherPayload {
  names: string;
  document_number: string;
  email: string;
  phone: string | null;
  sex?: string | null;
  birth_date?: string | null;
  native_language?: string | null;
  working_condition_id: number | null;
  study_program_id?: number | null;
  registration_date: string | null;
  resolution_number?: string | null;
}

export interface TeacherUpdatePayload {
  working_condition_id: number | null;
  study_program_id?: number | null;
  registration_date: string | null;
  resolution_number?: string | null;
}

export interface TeacherParamOption {
  id: number;
  name: string;
}

export interface TeacherParams {
  working_conditions: TeacherParamOption[];
  study_programs: TeacherParamOption[];
}

export interface RequestParamsTeacher {
  page: number;
  size: number;
  search: string;
}

export interface TeacherListResponse {
  items: TeacherItem[];
  page: number;
  size: number;
  total: number;
}
