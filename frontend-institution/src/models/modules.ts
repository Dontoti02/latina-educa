export interface ModuleTypeItem {
  id: number;
  name: string;
}

export interface RequestParamsModuleType {
  page: number;
  size: number;
  search: string;
}

export interface ModuleTypeListResponse {
  items: ModuleTypeItem[];
  page: number;
  size: number;
  total: number;
}

export type ModuleTypePayload = Pick<ModuleTypeItem, "name">;

// Modules
export interface ModuleFormParamItem {
  id: number;
  name: string;
}

export interface ModuleFormParamsResponse {
  study_programs: ModuleFormParamItem[];
  types: ModuleFormParamItem[];
}

export interface ModuleItem {
  id: number;
  name: string;
  study_program_id: number;
  study_program_name: string;
  type_id: number;
  type_name: string;
  year: string;
}

export interface RequestParamsModule {
  page: number;
  size: number;
  search: string;
}

export interface ModuleListResponse {
  items: ModuleItem[];
  page: number;
  size: number;
  total: number;
}

export interface ModulePayload {
  study_program_id: number;
  type_id: number;
  name: string;
  year: string;
}
