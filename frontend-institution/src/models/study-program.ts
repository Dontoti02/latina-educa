export interface StudyProgramItem {
  id: number;
  productive_family_id: number;
  name: string;
  is_active: boolean;
  score_min_to_pass_number: any;
  score_min_to_pass_letter: any;
}

export interface RequestParamsStudyProgram {
  page: number;
  size: number;
  search: string;
}

export interface StudyProgramListResponse {
  items: StudyProgramItem[];
  page: number;
  size: number;
  total: number;
}

export interface StudyProgramFormParamsResult {
  productive_families: Array<{ id: number; name: string }>;
}
