export interface WorkingConditionItem {
  id: number;
  name: string;
}

export type WorkingConditionPayload = Pick<WorkingConditionItem, "name">;

export interface RequestParamsWorkingCondition {
  page: number;
  size: number;
  search: string;
}

export interface WorkingConditionListResponse {
  items: WorkingConditionItem[];
  page: number;
  size: number;
  total: number;
}
