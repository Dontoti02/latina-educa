export interface ParticipantForStudent {
  id: number
  names: string
  email: string
  last_connection: string
}

export interface GetParticipantsForStudent {
  teachers: Array<ParticipantForStudent>
  participants: Array<ParticipantForStudent>
}

export interface GetParticipantsForTeacherBase {
  id: number
  person_id: number
  names: string
  cycle: string
  score: number
  absences: number
  // scorePerEvaluationGroup? :Record<number, number>;
}

export type GetParticipantsForTeacherDynamic = {
  evaluation_5: number;
  evaluation_6: number;
  evaluation_7: number;
  evaluation_8: number;

}

export type GetParticipantsForTeacher = GetParticipantsForTeacherBase & GetParticipantsForTeacherDynamic;
