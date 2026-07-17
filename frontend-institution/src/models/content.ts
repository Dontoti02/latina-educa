import type {
  ClassComment,
  ContentItem,
  CourseContentResource,
} from "./courses";
import {
  FormEvaluationBuild,
  TrainingFormEvaluationBuild,
} from "./evalution-form";

export interface CourseContentCreate {
  content_group_id: number | null;
  evaluation_group_id?: number | null;
  title: string;
  description: string;
  type: ContentItem["type"];
  is_active: number;
  date_start?: ContentDetailForStudent["date_start"];
  date_limit?: ContentDetailForStudent["date_limit"];
  score?: ContentDetailForStudent["score"];
  has_evaluation_form: boolean;
  form?: FormEvaluationBuild | null;
}
export interface CapacitationCourseContentCreate {
  content_group_id: number | null;
  training_evaluation_group_id?: number | null;
  title: string;
  description: string;
  type: ContentItem["type"];
  is_active: number;
  date_start?: ContentDetailForStudent["date_start"];
  date_limit?: ContentDetailForStudent["date_limit"];
  score?: ContentDetailForStudent["score"];
  has_evaluation_form: boolean;
  form?: TrainingFormEvaluationBuild | null;
}

export interface CourseContentLink {
  id: number;
  url: string;
}

export interface ContentDetailForStudent {
  id: number;
  content_group_id: number;
  evaluation_group_id: number;
  title: string;
  description: string;
  date: string;
  type: ContentItem["type"];
  is_visible: number;
  date_activation: string | null;
  is_open: boolean;
  date_start: string | null;
  date_limit: string | null;
  score: number | null;
  files: Array<CourseContentResource>;
  comments: Array<ClassComment>;
  answer: {
    id: number;
    status: "pending" | "delivered" | "overdue" | "evaluated";
    score: number | null;
    files: Array<CourseContentResource>;
    date?: string;
    links: Array<CourseContentLink>;
  };
  links: Array<CourseContentLink>;
  form_uuid?: string | null;
}
export interface TrainingContentDetailForStudent {
  id: number;
  content_group_id: number;
  training_evaluation_group_id: number;
  title: string;
  description: string;
  date: string;
  type: ContentItem["type"];
  is_visible: number;
  date_activation: string | null;
  is_open: boolean;
  date_start: string | null;
  date_limit: string | null;
  score: number | null;
  files: Array<CourseContentResource>;
  comments: Array<ClassComment>;
  answer: {
    id: number;
    status: "pending" | "delivered" | "overdue" | "evaluated";
    score: number | null;
    files: Array<CourseContentResource>;
    date?: string;
    links: Array<CourseContentLink>;
  };
  links: Array<CourseContentLink>;
  form_uuid?: string | null;
}

export interface ContentDetailForTeacher {
  id: number;
  content_group_id: number;
  evaluation_group_id: number;
  title: string;
  description: string;
  date: string;
  type: ContentItem["type"];
  is_visible: number;
  date_activation: string | null;
  is_open: boolean;
  date_start: string | null;
  date_limit: string | null;
  score: number | null;
  hasCompetencies: boolean;
  files: Array<CourseContentResource>;
  comments: Array<ClassComment>;
  links: Array<CourseContentLink>;
  has_evaluation_form: boolean;
  form: FormEvaluationBuild | null;
}
export interface TrainingContentDetailForTeacher {
  id: number;
  content_group_id: number;
  training_evaluation_group_id: number;
  title: string;
  description: string;
  date: string;
  type: ContentItem["type"];
  is_visible: number;
  date_activation: string | null;
  is_open: boolean;
  date_start: string | null;
  date_limit: string | null;
  score: number | null;
  hasCompetencies: boolean;
  files: Array<CourseContentResource>;
  comments: Array<ClassComment>;
  links: Array<CourseContentLink>;
  has_evaluation_form: boolean;
  form: TrainingFormEvaluationBuild | null;
}

export interface LoadingsContentForm {
  uploadContent: boolean;
  uploadFiles: boolean;
  deleteFiles: boolean;
  uploadLinks: boolean;
  deleteLinks: boolean;
}

export interface DateContentForm {
  date: string;
  time: string;
}

export type CapacitationContentCreate = Omit<
  CapacitationCourseContentCreate,
  "content_group_id"
> & {
  training_content_group_id: number | null;
  is_group_task?: boolean;
  groups?: Array<{ name: string; participants: number[] }>;
};

export type CapacitationContentDetailForStudent = Omit<
  TrainingContentDetailForStudent,
  "content_group_id" | "evaluation_group_id"
> & {
  training_content_group_id: number;
  training_evaluation_group_id: number;
};

export type CapacitationContentDetailForTeacher = Omit<
  TrainingContentDetailForTeacher,
  "content_group_id" | "evaluation_group_id"
> & {
  training_content_group_id: number;
  training_evaluation_group_id: number;
  is_group_task?: boolean;
};

export interface GroupTask {
  id?: number;
  name: string;
  participants: Array<{
    id: number;
    name: string;
    training_participant_id?: number;
  }>;
}
