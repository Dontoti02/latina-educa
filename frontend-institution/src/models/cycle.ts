export interface CycleItem {
  id: number;
  name: string;
}

export interface RequestParamsCycle {
  page: number;
  size: number;
  search: string;
}

export interface CycleListResponse {
  items: CycleItem[];
  page: number;
  size: number;
  total: number;
}

export type CyclePayload = Pick<CycleItem, "name">;
