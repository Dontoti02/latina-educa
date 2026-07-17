export interface SectionItem {
  id: number;
  name: string;
}

export type SectionPayload = Pick<SectionItem, "name">;

export interface RequestParamsSection {
  page: number;
  size: number;
  search: string;
}

export interface SectionListResponse {
  items: SectionItem[];
  page: number;
  size: number;
  total: number;
}
