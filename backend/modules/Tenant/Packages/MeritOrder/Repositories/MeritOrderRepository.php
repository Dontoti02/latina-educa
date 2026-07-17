<?php

namespace Modules\Tenant\Packages\MeritOrder\Repositories;

use Illuminate\Http\Request;
use Modules\Tenant\Models\Participant;
use Modules\Tenant\Models\Period;
use Modules\Tenant\Models\StudyProgram;
use Modules\Tenant\Models\User;
use Modules\Tenant\Packages\MeritOrder\Helpers\MeritOrderHelper;
use Modules\Tenant\Packages\User\Enums\RolTenant;

class MeritOrderRepository
{
    public static function filters()
    {
        $periods = Period::select()
            ->orderBy('name', 'desc')
            ->get();

        $study_programs = StudyProgram::select('id', 'name')
            ->orderBy('name', 'asc')
            ->get();

        $result = [
            'periods' => $periods,
            'study_programs' => $study_programs,
        ];

        return $result;
    }

    public static function list(Request $request)
    {
        User::authenticated([RolTenant::SECRETARY, RolTenant::ADMINISTRADOR]);

        MeritOrderHelper::validateListRequest($request);

        $select = Participant::selectRaw("
            person.id,
            person.names,
            CAST((ROUND(SUM(participant.score) / COUNT(participant.id), 2)) AS FLOAT) AS semester_average
            ")
            ->join('student', 'participant.student_id', 'student.id')
            ->join('person', 'student.person_id', 'person.id')
            ->join('classroom', 'participant.classroom_id', 'classroom.id')
            ->join('study_plan_detail', 'classroom.study_plan_detail_id', 'study_plan_detail.id')
            ->join('course', 'study_plan_detail.course_id', 'course.id')
            ->where('course.study_program_id', $request->study_program_id)
            ->where('classroom.period_id', $request->period_id)
            ->groupBy('person.id', 'person.names')
            ->orderBy('semester_average', 'desc')
            ->get();

        $select->each(function ($item, $key) {
            $item->order = $key + 1;
        });

        return $select;
    }
}
