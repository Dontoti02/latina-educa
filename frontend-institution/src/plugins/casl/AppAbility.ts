import type { AbilityClass } from "@casl/ability";
import { Ability } from "@casl/ability";

export type Actions = "create" | "read" | "update" | "delete" | "manage";

export type Subjects =

  | "Auth"

  | "Admin"

  | "AclDemo"

  | "all"

  | "Home"

  | "Preferences"

  | "Settings"

  | "Classroom"

  | "ArchivedCourses"

  | "CurrentCourses"

  | "ContentCourse"

  | "Board"

  | "Calendar"

  | "Storage"

  | "Importation"

  | "AdminCapacitationList"

  | "ManageCapacitation"

  | "CapacitationStudents"

  | "ReportCapacitation"

  | "Schedules"

  | "UsersList"

  | "LandingPage"

  | "AcademicPeriods"

  | "ListOfMerit"

  | "Enrollment"

  | "AcademicHistory"

  | "Curriculum"

  | "CurrentTraining"

  | "ListOfMerit"

  | "Offers"

  | "Companies"

  | "Applications"

  | "Candidate"

  | "JobMaintainers"

  | " scales"

  | "PaymentConcepts"

  | "payments"

  | "enrollStudent"

  | "enrollList";

export type AppAbility = Ability<[Actions, Subjects]>;

// eslint-disable-next-line @typescript-eslint/no-redeclare
export const AppAbility = Ability as AbilityClass<AppAbility>;

export interface UserAbility {
  action: Actions;
  subject: Subjects;
}
