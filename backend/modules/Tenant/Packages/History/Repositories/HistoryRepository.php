<?php

namespace Modules\Tenant\Packages\History\Repositories;

use Illuminate\Http\Request;
use Modules\Tenant\Models\Student;
use Modules\Tenant\Packages\History\Helpers\HistoryHelper;
use Modules\Tenant\Models\Period;
use Modules\Tenant\Packages\User\Enums\RolTenant;
use Modules\Tenant\Models\Person;
use Modules\Tenant\Models\StudyProgram;
use Modules\Tenant\Models\User;

class HistoryRepository
{
    public static function filters()
    {
        $study_programs = StudyProgram::select('id', 'name')
            ->orderBy('name', 'asc')
            ->get();

        $result = [
            'study_programs' => $study_programs,
        ];

        return $result;
    }

    public static function listStudents(Request $request)
    {
        HistoryHelper::validateListStudentsRequest($request);

        $students = Student::select([
            'person.id',
            'person.document_number',
            'person.names',
        ])
            ->join('person', 'student.person_id', 'person.id')
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

        HistoryHelper::validateListRequest($request, $is_student);

        $person_id = $is_student ? $user->person_id : $request->person_id;

        $person = Person::findOrFail($person_id);

        $result = Period::select('id', 'name')
            ->orderBy('period.name', 'desc')
            ->get();

        $accumulated_average = 0;
        foreach ($result as $index => $period) {
            $courses = $period->classrooms()
                ->selectRaw("
                        course.id,
                        course.name,
                        CAST(participant.score AS FLOAT) AS score
                    ")
                ->join('study_plan_detail', 'classroom.study_plan_detail_id', 'study_plan_detail.id')
                ->join('course', 'study_plan_detail.course_id', 'course.id')
                ->join('participant', 'classroom.id', 'participant.classroom_id')
                ->join('student', 'participant.student_id', 'student.id')
                ->where('student.person_id', $person_id)
                ->orderBy('course.name', 'asc')
                ->get();

            $score_sum = $courses->sum('score');
            $score_count = $courses->count();

            $semester_average = $score_count > 0 ? $score_sum / $score_count : 0;
            $accumulated_average = ($accumulated_average + $semester_average) / ($index + 1);

            $period->semester_average = round($semester_average, 2);
            $period->accumulated_average = round($accumulated_average, 2);
            $period->courses = $courses;
        }

        return [$result, $person];
    }
}
