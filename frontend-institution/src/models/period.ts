export interface PeriodItem {
  id: number;
  name: string;
  start_date: string | null;
  end_date: string | null;
  is_current: boolean;
  enrollment_start_date: string | null;
  enrollment_end_date: string | null;
  classroom_start_date: string | null;
  classroom_end_date: string | null;
  is_number_to_fail: 0 | 1 | 2;
  classroom_max_to_fail: number | null;
  is_required_enrollment_payment: boolean;
}

export interface PeriodPayload {
  name: string;
  start_date: string | null;
  end_date: string | null;
  enrollment_start_date: string | null;
  enrollment_end_date: string | null;
  classroom_start_date: string | null;
  classroom_end_date: string | null;
  is_number_to_fail: 0 | 1 | 2;
  classroom_max_to_fail: number | null;
  is_required_enrollment_payment: boolean;
}

export interface RequestParamsPeriod {
  page: number;
  size: number;
  search: string;
}

export interface PeriodListResponse {
  items: PeriodItem[];
  page: number;
  size: number;
  total: number;
}
