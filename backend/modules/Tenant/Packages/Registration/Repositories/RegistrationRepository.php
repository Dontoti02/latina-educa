<?php

namespace Modules\Tenant\Packages\Registration\Repositories;

use Illuminate\Http\Request;

use Modules\Tenant\Models\Classroom;
use Modules\Tenant\Models\Student;
use Modules\Tenant\Models\Period;
use Modules\Tenant\Packages\User\Enums\RolTenant;
use Modules\Tenant\Models\Person;
use Modules\Tenant\Models\StudyProgram;
use Modules\Tenant\Models\User;
use Modules\Tenant\Packages\Registration\Helpers\RegistrationHelper;

class RegistrationRepository
{
    public static function filters()
    {
        $periods = Period::select(['id', 'name'])
            ->orderBy('name', 'desc')
            ->get();

        $study_programs = StudyProgram::select(['id', 'name'])
            ->orderBy('name', 'asc')
            ->get();

        $result = [
            'periods' => $periods,
            'study_programs' => $study_programs,
        ];

        return $result;
    }

    public static function listStudents(Request $request)
    {
        RegistrationHelper::validateListStudentsRequest($request);

        $students = Student::select([
            'person.id',
            'person.document_number',
            'person.names',
        ])
            ->join('person', 'student.person_id', 'person.id')
            ->where('student.period_id', $request->period_id)
            ->where('student.study_program_id', $request->study_program_id)
            ->orderBy('person.names', 'asc')
            ->distinct()
            ->get();

        return $students;
    }

    public static function list(Request $request)
    {
        $user = User::authenticated();
        $is_student = $user->rol_id == RolTenant::STUDENT;

        RegistrationHelper::validateListRequest($request, $is_student);

        $person_id = $is_student ? $user->person_id : $request->person_id;

        $person = Person::findOrFail($person_id);
        $period = Period::findOrFail($request->period_id);

        $result = Classroom::select([
            'classroom.id',
            'course.name as course',
            'person.names as teacher',
            'shift.name as shift',
            'student.status',
            'student.registration_date',
        ])
            ->join('participant', 'classroom.id', 'participant.classroom_id')
            ->join('shift', 'classroom.shift_id', 'shift.id')
            ->join('study_plan_detail', 'classroom.study_plan_detail_id', 'study_plan_detail.id')
            ->join('course', 'study_plan_detail.course_id', 'course.id')
            ->join('study_program', 'course.study_program_id', 'study_program.id')
            ->leftJoin('teacher', 'classroom.teacher_id', 'teacher.id')
            ->leftJoin('person', 'teacher.person_id', 'person.id')
            ->leftJoin('student', function ($join) use ($request, $person_id) {
                $join->on('study_program.id', 'student.study_program_id')
                    ->where('student.period_id', $request->period_id)
                    ->where('student.person_id', $person_id);
            })
            ->where('classroom.period_id', $request->period_id)
            ->where('student.person_id', $person_id)
            ->orderBy('course.name', 'asc')
            ->distinct()
            ->get();

        return [$result, $person, $period];
    }

    public static function consolidated(Request $request)
    {
        $user = User::authenticated();
        $is_student = $user->rol_id == RolTenant::STUDENT;

        RegistrationHelper::validateConsolidatedRequest($request, $is_student);

        $person_id = $is_student ? $user->person_id : $request->person_id;

        $person = Person::findOrFail($person_id);

        $result = Student::selectRaw("
            student.id,
            period.name as period,
            cycle.name as cycle,
            student.registration_date,
            student.status,
            COUNT(participant.id) as total_courses
        ")
            ->join('period', 'student.period_id', 'period.id')
            ->join('cycle', 'student.cycle_id', 'cycle.id')
            ->join('study_program', 'student.study_program_id', 'study_program.id')
            ->join('course', 'study_program.id', 'course.study_program_id')
            ->join('study_plan_detail', 'course.id', 'study_plan_detail.course_id')
            ->join('classroom', 'study_plan_detail.id', 'classroom.study_plan_detail_id')
            ->join('participant', 'classroom.id', 'participant.classroom_id')
            ->where('student.person_id', $person_id)
            ->where('student.person_id', $person_id)
            ->whereColumn('classroom.period_id', 'student.period_id')
            ->groupBy('student.id', 'period.name', 'cycle.name', 'student.registration_date')
            ->orderBy('period.name', 'asc')
            ->distinct()
            ->get();

        return [$result, $person];
    }
}
