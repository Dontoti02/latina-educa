export interface ShiftItem {
  id: number;
  name: string;
}

export type ShiftPayload = Pick<ShiftItem, "name">;

export interface RequestParamsShift {
  page: number;
  size: number;
  search: string;
}

export interface ShiftListResponse {
  items: ShiftItem[];
  page: number;
  size: number;
  total: number;
}
