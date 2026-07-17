export interface StudyPlanTypeItem {
  id: number;
  name: string;
  is_active: boolean;
}

export interface RequestParamsStudyPlanType {
  page: number;
  size: number;
  search: string;
}

export interface StudyPlanTypeListResponse {
  items: StudyPlanTypeItem[];
  page: number;
  size: number;
  total: number;
}

export interface StudyPlanItem {
  id: number;
  is_active: boolean;
  is_current: boolean;
  name: string;
  study_program_id: number;
  study_program_name: string;
  type_id: number;
  type_name: string;
  year: number | null;
  score_min_to_pass_number: number;
}

export interface RequestParamsStudyPlan {
  page: number;
  size: number;
  search: string;
  study_program_id: number | null;
}

export interface StudyPlanListResponse {
  items: StudyPlanItem[];
  page: number;
  size: number;
  total: number;
}

export interface StudyPlanPayload {
  study_program_id: number;
  type_id: number;
  name: string;
  year: string;
}

export interface StudyPlanTypePayload {
  name: string;
}

export interface StudyPlanFormParamItem {
  id: number;
  name: string;
}

export interface StudyPlanFormParamsResponse {
  study_programs: StudyPlanFormParamItem[];
  types: StudyPlanFormParamItem[];
}

export interface AssignedCourseRaw {
  id: number;
  cycle_id: number;
  cycle_name: string;
  course_id: number;
  course_name: string;
}

export interface StudyProgramParamCycle {
  id: number;
  name: string;
  order: number;
}

export interface StudyProgramParamCourse {
  id: number;
  name: string;
  is_active: boolean;
}

export interface StudyProgramParamsResult {
  cycles: StudyProgramParamCycle[];
  courses: StudyProgramParamCourse[];
}

export interface StudyProgramDraggableCourse {
  course_id: number;
  name: string;
  assignment_id?: number;
}

export interface StudyProgramCycleTabEntry {
  cycle_id: number;
  name: string;
  available: StudyProgramDraggableCourse[];
  assigned: StudyProgramDraggableCourse[];
}
