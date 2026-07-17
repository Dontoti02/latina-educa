export interface ProductiveFamilyItem {
  id: number;
  name: string;
}

export interface RequestParamsProductiveFamily {
  page: number;
  size: number;
  search: string;
}

export interface ProductiveFamilyListResponse {
  items: ProductiveFamilyItem[];
  page: number;
  size: number;
  total: number;
}
