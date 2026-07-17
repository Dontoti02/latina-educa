export interface StudyPlan {
  id: number | null;
  studyProgramId: number | null;
  typeId: number | null;
  name: string;
  year: number;
  numberOfCycles: number | null;
  isActive: boolean;
  scoreMinToPassNumber: number | null;
  scoreMinToPassLetter: number | null;
}

export interface CreateStudyPlanResponse {
  id: number;
  study_program_id: any;
  type_id: any;
  name: string;
  year: number;
  number_of_cycles: any;
  is_active: any;
  score_min_to_pass_number: any;
  score_min_to_pass_letter: any;
  created_at: string;
  updated_at: string;
  deleted_at: any;
}

export interface CourseItem {
  id: number | null;
  study_program_id: number | null;
  type_id: number | null;
  code: string | null;
  name: string | null;
  year: number | null;
  credits: number | null;
  hours: number | null;
  description: string | null;
  is_active: boolean | null;
}

export interface FormParamsResponse {
  study_programs: FormParamsItem[];
  types: FormParamsItem[];
}

export interface FormParamsItem {
  id: number | string;
  name: string;
}

export interface CourseFilterValues {
  name: string | null;
  year: number | null;
  active: boolean;
}

export interface StudyPlanPreview {
  study_plan_id: string;
  study_plan_name: string;
  name: string;
  study_program_id: number;
  study_program_name: string;
  year: number;
  cycles: CyclePreview[];
}

export interface CyclePreview {
  cycle: string;
  courses: CoursePreview[];
}

export interface CoursePreview {
  course_id: number;
  course_type_id: number;
  course_type: string;
  course_name: string;
  prerequisites: PrerequisitePreview[];
}

export interface PrerequisitePreview {
  course_id: number;
  course_name: string;
}
