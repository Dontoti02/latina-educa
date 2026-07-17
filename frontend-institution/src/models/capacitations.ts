export interface CapacitationsListRequest {
  page: number;
  size: number;
  search: string | null;
  only_completed: boolean;
  training_category_id: number | null;
}

export interface CapacitationsList {
  page: number;
  size: number;
  total: number;
  data: Capacitation[];
}

export interface Filters {
  categories: FilterModel[];
  is_admin: boolean;
}

export interface FilterModel {
  id: number;
  name: string;
}

export interface Status {
  id: number;
  name: string;
}
export interface CapacitationCategory {
  id: number;
  name: string;
}
export interface Capacitation {
  id: number;
  category: string;
  status: string;
  name: string;
  image: string;
  students: number;
  max_participants: number;
  short_description: string;
  minutes_remaining: number;
  total_minutes: number;
  is_favorite: number;
  is_student: boolean;
  is_teacher: boolean;
  end_date?: string;
  start_date?: string;
  status_id?: number;
}

export interface CapacitationCard {
  id: number;
  frontPage: string;
  category: string;
  status: string;
  studentsCount: number;
  maxStudents: number;
  name: string;
  description: string;
  leftTime: string;
  startDate: string;
  endDate: string;
  progress: number;
  isFinished: boolean;
}

export interface Teacher {
  id: number;
  names: string;
  email: string;
  document_number: string;
}

export interface Student {
  id: number;
  names: string;
  is_internal: number;
  document_number: string;
  absences: number;
}

export interface CapacitationForm {
  id?: number;
  image?: string;
  name: string | null;
  training_category_id: number | null;
  num_max_absences: number | null;
  start_date: string | null;
  end_date: string | null;
  min_participants: number | null;
  max_participants: number | null;
  short_description: string | null;
  long_description: string | null;
  teacher?: Teacher;
  teacher_document_number?: string;
  status_id?:number;
}

export interface CapacitationUserForm {
  id?: number;
  type: string;
  names: string | null;
  document_number: string | null;
  document_type: string | null;
  email: string | null;
  phone: string | null;
}

export interface CapacitationFilter {
  id: number;
  name: string;
}

export interface Users {
  id: number;
  user: string;
  email?:string;
  dni: string;
  createdAt: string;
  absences: number;
  status: string;
  role: string;
}

export interface Pagination {
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
  lastPage?: number;
}

export interface StudentsList {
  page: number;
  size: number;
  summary: StudentsSummary;
  total: number;
  data: any;
}

export interface StudentsSummary {
  internal_users: number;
  external_users: number;
  total_users: number;
}

export interface AddStudentsBody {
  person_id: number;
  training_id: number;
}

export interface RemoveStudentsBody {
  person_id: number;
  training_id: number;
}

export interface EnableStudentsBody {
  person_id: number;
  training_id: number;
  justification: string;
}

export interface ListStudentsBody {
  page: number;
  size: number;
  training_id: number;
  search: string;
  status?: null|string
}

export interface ListStudentsReportBody {
  page: number;
  size: number;
  search: string;
  training_status_id: number | null;
}

export interface ResponseFilters {
  roles: Array<{
    key: string;
    name: string;
  }>;
  status: Array<{
    key: string|null;
    name: string;
  }>;
}

export interface ReportBody {
  page: number;
  size: number;
  search: string;
  training_status_id: number | null;
}

export interface Summary {
  enrolled: number;
  certificates: number;
  failed: number;
  suspended: number;
}

export interface ReportRow {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
  enrolled: number;
  suspended: number;
  approved: number;
  failed: number;
  sessions: number;
  status_name: string;
}

export interface ReponseReport {
  page: number;
  size: number;
  summary: Summary;
  total: number;
  data: Array<ReportRow>;
}

export interface CapacitationContentList {
  syllabus: CapacitationSyllabus;
  content_groups: Array<CapacitationContentGroup>;
  hasCompetencies: boolean;
}

export interface CapacitationSyllabus {
  id: number;
  title: string;
  files: Array<CapacitationContentResource>;
}

export interface ReportFilterResponse {
  status: Array<CapacitationFilter>;
}

export interface CapacitationContentGroup {
  id: number;
  title: string;
  contents: Array<CapacitationContentItem>;
}

export interface CapacitationContentItem {
  id: number;
  title: string;
  date: string;
  type: "content" | "task" | "evaluation";
  is_visible: boolean;
  is_open: boolean;
  date_start?: string;
  date_limit?: string;
}

export interface CapacitationEvaluationScore {
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
  evaluations: Array<CapacitationEvaluationScore>;
}

export interface CapacitationCourseResult {
  id: number;
  sections: Array<SectionCourseSummary>;
  state: "approved" | "disapproved";
  finalScore: number;
}

export interface CapacitationUserForumComment {
  id: number;
  name: string;
  image: string;
}

export interface CapacitationContentResource {
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

export interface CapacitationClassComment {
  id: number;
  person: string;
  photo: string | null;
  date: string;
  value: string;
}
