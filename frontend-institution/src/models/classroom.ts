export interface ClassroomItem {
  id: number;
  name: string;
}

export type ClassroomPayload = Pick<ClassroomItem, "name">;

export interface RequestParamsClassroom {
  page: number;
  size: number;
  search: string;
}

export interface ClassroomListItem {
  id: number;
  period: string;
  course: string;
  teacher: string | null;
  cycle: string;
  students: number;
  image: string | null;
}

export interface ClassroomListResponse {
  page: number;
  size: number;
  total: number;
  items: ClassroomListItem[];
}

export interface ClassroomParamOption {
  id: number;
  name: string;
}

export interface ClassroomStudyPlanOption {
  id: number;
  name: string;
  study_program_id: number;
}

export interface ClassroomParams {
  periods: ClassroomParamOption[];
  study_programs: ClassroomParamOption[];
  study_plans: ClassroomStudyPlanOption[];
  cycles: ClassroomParamOption[];
  shifts: ClassroomParamOption[];
  sections: ClassroomParamOption[];
}

export interface ClassroomCourseFilter {
  period_id: number;
  study_program_id: number;
  study_plan_id: number;
  cycle_id: number;
  shift_id: number;
  section_id: number;
}

export interface ClassroomCourseListItem {
  id: number;
  name: string;
}

export interface ClassroomCoursesResponse {
  courses_available: ClassroomCourseListItem[];
  courses_assigned: ClassroomCourseListItem[];
}

export interface ClassroomAssignPayload extends ClassroomCourseFilter {
  course_ids: number[];
}

export interface ClassroomDetail {
  id: number;
  course: string;
  teacher: string | null;
  cycle: string;
  students: number;
  image: string | null;
}
