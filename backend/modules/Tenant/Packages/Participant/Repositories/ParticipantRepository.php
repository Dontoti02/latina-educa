<?php

namespace Modules\Tenant\Packages\Participant\Repositories;

use Illuminate\Support\Facades\DB;
use Modules\Tenant\Models\Average;
use Modules\Tenant\Models\EvaluationGroup;
use Modules\Tenant\Models\Participant;
use Modules\Tenant\Models\Teacher;
use Modules\Tenant\Models\User;
use Modules\Tenant\Packages\User\Enums\RolTenant;

class ParticipantRepository
{
    public static function list(int $classroomId)
    {
        $user = User::authenticated();
        $isTeacher = $user->rol_id === RolTenant::TEACHER;

        if ($isTeacher) {
            $evaluationGroups = EvaluationGroup::select('id', 'title', 'weight')
                ->where('classroom_id', $classroomId)
                ->get();

            $result = Participant::select([
                'participant.id',
                'student.person_id',
                'person.names',
                'cycle.name as cycle',
                'participant.score',
                DB::raw("(
                    SELECT COUNT(*) 
                    FROM assistance
                    WHERE 
                        student_id = participant.student_id
                        AND classroom_id = participant.classroom_id
                        AND status = 'absence'
                ) as absences"),
            ])
                ->join('person', 'student.person_id', '=', 'person.id')
                ->join('classroom', 'participant.classroom_id', '=', 'classroom.id')
                ->join('study_plan_detail', 'classroom.study_plan_detail_id', '=', 'study_plan_detail.id')
                ->join('course', 'study_plan_detail.course_id', '=', 'course.id')
                ->join('cycle', 'study_plan_detail.cycle_id', '=', 'cycle.id')
                ->where('participant.classroom_id', $classroomId)
                ->orderBy('person.names', 'asc')
                ->get();

            $participantIds = $result->pluck('person_id');

            $averages = Average::whereIn('person_id', $participantIds)
                ->select('person_id', 'evaluation_group_id', 'score')
                ->get();

            $details = [];
            foreach ($averages as $average) {
                if (!isset($details[$average->person_id])) {
                    $details[$average->person_id] = [];
                }
                $details[$average->person_id][$average->evaluation_group_id] = $average->score;
            }

            $result->transform(function ($participant) use ($details, $evaluationGroups) {
                $participantDetails = isset($details[$participant->person_id]) ? $details[$participant->person_id] : [];

                foreach ($evaluationGroups as $group) {
                    $score = $participantDetails[$group->id] ?? 0;
                    $participant['evaluation_' . $group->id] = $score;
                }

                return $participant;
            });


            return [
                'result' => $result,
                'evaluationGroups' => $evaluationGroups
            ];
        }

        $teachers = Teacher::select([
            'teacher.id',
            'teacher.person_id',
            'person.names',
            'person.email',
            'user.last_login',
        ])
            ->join('person', 'teacher.person_id', '=', 'person.id')
            ->join('user', 'person.id', '=', 'user.person_id')
            ->where('classroom.teacher_id', $classroomId)
            ->orderBy('person.names', 'asc')
            ->get();

        $participants = Participant::select([
            'participant.id',
            'student.person_id',
            'person.names',
            'person.email',
            'user.last_login',
        ])
            ->join('person', 'student.person_id', '=', 'person.id')
            ->join('user', 'person.id', '=', 'user.person_id')
            ->where('participant.classroom_id', $classroomId)
            ->orderBy('person.names', 'asc')
            ->get();

        $result = [
            'teachers' => $teachers,
            'participants' => $participants,
        ];

        return $result;
    }
}
