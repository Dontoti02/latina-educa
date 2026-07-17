export interface PeriodForm {
  id: number | null;
  name: string | null;
  period: {
    start: Date | null;
    end: Date | null;
  };
  enrollment: {
    start: Date | null;
    end: Date | null;
  };
  sections: {
    start: Date | null;
    end: Date | null;
  };
  failedStudents: {
    maxAmount: string;
    requiresPayment: boolean;
    isNumbertoFail: number | string | null;
  };
}

export interface Period extends PeriodForm {
  allowed_actions: {
    can_update_period: {
      start: boolean;
      end: boolean;
    };
    can_update_enrollments: {
      start: boolean;
      end: boolean;
    };
    can_update_sections: {
      start: boolean;
      end: boolean;
    };
    can_update_failed_students: {
      maxAmount: boolean;
      requiresPayment: boolean;
      considerBlock: boolean;
    };
  };
}
