export interface Course {
  id: number;
  course: string;
  name?: string;
  teacher: string | null;
  cycle: string;
  students: number;
  image: string | null;
  is_favorite: boolean;
}

export interface CoursesPerPeriod {
  id: number;
  name: string;
  classrooms: Array<Course>;
}

export interface ContentList {
  syllabus: Syllabus;
  content_groups: Array<CourseContentGroup>;
  hasCompetencies: boolean;
}

export interface Syllabus {
  id: number;
  title: string;
  files: Array<CourseContentResource>;
}

export interface CourseContentGroup {
  id: number;
  title: string;
  contents: Array<ContentItem>;
}

export interface ContentItem {
  id: number;
  title: string;
  date: string;
  type: "content" | "task" | "evaluation";
  is_visible: boolean;
  is_open: boolean;
  date_start?: string;
  date_limit?: string;
}

export interface EvaluationScore {
  id: number;
  name: string;
  date: string;
  registerDate: string;
  score: number;
  competence: string;
}

export interface SectionCourseSummary {
  id: number;
  name: string;
  score: number;
  weight: number;
  evaluations: Array<EvaluationScore>;
}

export interface CourseResult {
  id: number;
  sections: Array<SectionCourseSummary>;
  state: "approved" | "disapproved";
  finalScore: number;
}

export interface UserForumComment {
  id: number;
  name: string;
  image: string;
}

export interface CourseContentResource {
  id: number;
  uuid: string;
  url: string;
  metadata: Metadata;
}

export interface Metadata {
  size: number;
  type: string;
  unit: string;
  extension: string;
  originalName: string;
}

export interface ClassComment {
  id: number;
  person: string;
  photo: string | null;
  date: string;
  value: string;
}

// Admin Course Management
export interface CourseFormParamItem {
  id: number;
  name: string;
  study_program_id?: number | null;
}

export interface CourseFormParamsResponse {
  study_programs: CourseFormParamItem[];
  modules: CourseFormParamItem[];
  types: CourseFormParamItem[];
}

export interface CourseAdminItem {
  id: number;
  study_program_id: number;
  study_program_name: string;
  module_id: number | null;
  module_name: string | null;
  type_id: number;
  type_name: string;
  code: string;
  name: string;
  year: string;
  credits: number;
  hours: number;
  description: string | null;
  is_active: boolean;
}

export interface RequestParamsCourseAdmin {
  page: number;
  size: number;
  search: string;
  study_program_id: number | null;
  module_id: number | null;
  type_id: number | null;
}

export interface CourseAdminListResponse {
  items: CourseAdminItem[];
  page: number;
  size: number;
  total: number;
}

export interface CourseAdminPayload {
  study_program_id: number;
  module_id: number | null;
  type_id: number;
  code: string;
  name: string;
  year: string;
  credits: number;
  hours: number;
  description: string | null;
}

// Course Types
export interface CourseTypeItem {
  id: number;
  name: string;
}

export interface RequestParamsCourseType {
  page: number;
  size: number;
  search: string;
}

export interface CourseTypeListResponse {
  items: CourseTypeItem[];
  page: number;
  size: number;
  total: number;
}

export type CourseTypePayload = Pick<CourseTypeItem, "name">;
