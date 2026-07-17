import academicProcesses from "./academic-processes";
import classroom from "./classroom";
import classroomConfiguration from "./classroom-configuration";
import enrollment from "./enrollment";
import settings from "./settings";
import treasury from "./treasury";
import welcome from "./welcome";
import training from "./training";
import type { VerticalNavItems } from "@/@layouts/types";
import jobOpportunities from "./job-opportunities";

export default [
  ...welcome,
  ...classroom,
  ...training,
  ...classroomConfiguration,
  ...enrollment,
  ...treasury,
  ...academicProcesses,
  ...settings,
  ...jobOpportunities,
] as VerticalNavItems;
