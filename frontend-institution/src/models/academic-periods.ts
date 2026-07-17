export interface AcademicPeriod {
  id: number;
  name: string;
  status: "SIN TERMINO" | "TERMINADO";
  classrooms: number;
  students: number;
  start_date: string;
  end_date: string;
}

export interface AcademicPeriodItem {
  id: AcademicPeriodItemNumberProperty;
  name: AcademicPeriodItemStringProperty;
  is_current: AcademicPeriodItemBooleanProperty;
  start_date: AcademicPeriodItemStringProperty;
  end_date: AcademicPeriodItemStringProperty;
  enrollment_start_date: AcademicPeriodItemStringProperty;
  enrollment_end_date: AcademicPeriodItemStringProperty;
  section_start_date: AcademicPeriodItemStringProperty;
  section_end_date: AcademicPeriodItemStringProperty;
  is_number_to_fail: AcademicPeriodItemNumberProperty;
  section_max_to_fail: AcademicPeriodItemNumberProperty;
  is_required_enrollment_payment: AcademicPeriodItemBooleanProperty;
  students: AcademicPeriodItemNumberProperty;
  classrooms: AcademicPeriodItemNumberProperty;
  status: AcademicPeriodItemStringProperty;
}

export interface AcademicPeriodItemProperty {
  is_editable: boolean;
}

export interface AcademicPeriodItemNumberProperty extends AcademicPeriodItemProperty {
  value: number;
}

export interface AcademicPeriodItemStringProperty extends AcademicPeriodItemProperty {
  value: string;
}

export interface AcademicPeriodItemBooleanProperty extends AcademicPeriodItemProperty {
  value: boolean;
}

export interface CreateAcademicPeriodBody {
  name: string;
  start_date: string;
  end_date: string;
  enrollment_start_date: string;
  enrollment_end_date: string;
  section_start_date: string;
  section_end_date: string;
  is_number_to_fail: number;
  section_max_to_fail: number;
  is_required_enrollment_payment: boolean;
}
