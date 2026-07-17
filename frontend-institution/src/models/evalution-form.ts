export type TrainingFormEvaluationBuild = {
  id: number | null;
  content_id: number | null;
  uuid: string;
  title: string;
  description: string | null;
  score: number | null;
  score_max: number;
  questions: TrainingFormQuestion[];
};

export type TrainingFormQuestion = {
  id: number | null;
  form_id: number | null;
  label: string;
  key: string;
  training_question_type_key: string;
  order_number: number;
  score: number | null;
  score_max: number;
  options: QuestionOption[];
};

export type FormEvaluationBuild = {
  id: number | null;
  content_id: number | null;
  uuid: string;
  title: string;
  description: string | null;
  score: number | null;
  score_max: number;
  questions: FormQuestion[];
};

export type StudentCapacitationFormEvaluationBuild = {
  id: number | null;
  training_content_id: number | null;
  uuid: string;
  title: string;
  description: string | null;
  score: number | null;
  score_max: number;
  questions: CapacitationFormQuestion[];
};

export type FormQuestion = {
  id: number | null;
  form_id: number | null;
  label: string;
  key: string;
  question_type_key: string;
  order_number: number;
  score: number | null;
  score_max: number;
  options: QuestionOption[];
};

export type CapacitationFormQuestion = {
  id: number | null;
  training_form_id: number | null;
  label: string;
  key: string;
  training_question_type_key: string;
  order_number: number;
  score: number | null;
  score_max: number;
  options: QuestionOption[];
};

export type QuestionOption = {
  key: string; // uuid
  label: string;
  is_correct: boolean | null;
  is_selected: boolean | null;
  is_valid: boolean | null;
};

export type QuestionCreated = {
  label: string;
  score: number;
  options: QuestionOption[];
  correct_option_key: string;
  question_type_key: string;
  form_id: number;
};

export type QuestionType = {
  key: string;
  name: string;
  data_type: string;
  order_number: number;
  options: any;
};

export interface AnsweredFormEvaluation extends FormEvaluationBuild {
  is_pending: boolean;
  is_open: boolean;
}

export interface CapacitationAnsweredFormEvaluation extends StudentCapacitationFormEvaluationBuild {
  is_pending: boolean;
  is_open: boolean;
}

export type CapacitationFormEvaluationBuild = Omit<FormEvaluationBuild, 'content_id'> & {
  training_content_id: number;
}
