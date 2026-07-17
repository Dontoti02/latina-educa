<?php

namespace Modules\Tenant\Packages\Classroom\Repositories;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Modules\Tenant\Packages\Classroom\Helpers\ClassroomHelper;
use Modules\Tenant\Models\Classroom;
use Modules\Tenant\Models\Course;
use Modules\Tenant\Models\Cycle;
use Modules\Tenant\Models\Participant;
use Modules\Tenant\Models\Period;
use Modules\Tenant\Models\Section;
use Modules\Tenant\Models\Shift;
use Modules\Tenant\Models\StudyPlan;
use Modules\Tenant\Models\StudyPlanDetail;
use Modules\Tenant\Models\StudyProgram;
use Modules\Tenant\Packages\User\Enums\RolTenant;
use Modules\Tenant\Models\User;

class ClassroomRepository
{
    public static function params()
    {
        $periods = Period::select(['id', 'name'])
            ->orderBy('name', 'desc')
            ->get();

        $studyPrograms = StudyProgram::select(['id', 'name'])
            ->where('is_active', true)
            ->orderBy('name', 'asc')
            ->get();

        $studyPlans = StudyPlan::select(['id', 'name', 'study_program_id'])
            ->where('is_active', true)
            ->orderBy('name', 'asc')
            ->get();

        $cycles = Cycle::select(['id', 'name'])
            ->orderBy('name', 'asc')
            ->get();

        $shifts = Shift::select(['id', 'name'])
            ->orderBy('name', 'asc')
            ->get();

        $sections = Section::select(['id', 'name'])
            ->orderBy('name', 'asc')
            ->get();

        $result = [
            'periods' => $periods,
            'study_programs' => $studyPrograms,
            'study_plans' => $studyPlans,
            'cycles' => $cycles,
            'shifts' => $shifts,
            'sections' => $sections,
        ];

        return $result;
    }

    public static function list(Request $request)
    {
        $user = User::authenticated();

        $isTeacher = $user->rol_id === RolTenant::TEACHER;
        $isStudent = $user->rol_id === RolTenant::STUDENT;

        ClassroomHelper::validateListRequest($request);

        $page = $request->input('page');
        $size = $request->input('size');
        $search = $request->input('search');
        $periodId = $request->input('period_id');

        $select = [
            'classroom.id',
            'period.name as period',
            'course.name as course',
            'person.names as teacher',
            'cycle.name as cycle',
            DB::raw('(
                SELECT COUNT(*) 
                FROM participant 
                WHERE 
                    classroom_id = classroom.id
                    AND deleted_at IS NULL
            ) as students'),
            'classroom.avatar as image',
        ];

        if ($isStudent) {
            $select[] = 'participant.is_favorite';
        }

        $classrooms = Classroom::select($select)
            ->join('study_plan_detail', 'classroom.study_plan_detail_id', 'study_plan_detail.id')
            ->whereNull('study_plan_detail.deleted_at')
            ->join('course', 'study_plan_detail.course_id', 'course.id')
            ->whereNull('course.deleted_at')
            ->join('cycle', 'study_plan_detail.cycle_id', 'cycle.id')
            ->whereNull('cycle.deleted_at')
            ->join('period', 'classroom.period_id', 'period.id')
            ->whereNull('period.deleted_at')
            ->leftJoin('teacher', function ($join) {
                $join
                    ->on('classroom.teacher_id', 'teacher.id')
                    ->whereNull('teacher.deleted_at');
            })
            ->leftJoin('person', function ($join) {
                $join
                    ->on('teacher.person_id', 'person.id')
                    ->whereNull('person.deleted_at');
            })
            ->when($periodId, function ($query) use ($periodId) {
                $query->where('period.id', $periodId);
            }, function ($query) {
                $query->where('period.is_current', false);
            })
            ->when($isTeacher, function ($query) use ($user) {
                $query->where('teacher.person_id', $user->person_id);
            })
            ->when($search, function ($query) use ($search) {
                $query->where(function ($subquery) use ($search) {
                    $word =  trim($search);
                    $subquery
                        ->orWhere('course.code', 'like', "%$word%")
                        ->orWhere('course.name', 'like', "%$word%")
                        ->orWhere('course.year', 'like', "%$word%");
                });
            })
            ->when($isStudent, function ($query) use ($user) {
                $query
                    ->join('participant', 'classroom.id', 'participant.classroom_id')
                    ->whereNull('participant.deleted_at')
                    ->join('student', 'participant.student_id', 'student.id')
                    ->whereNull('student.deleted_at')
                    ->where('student.person_id', $user->person_id)
                    ->orderBy('participant.is_favorite', 'desc');
            })
            ->orderBy('period.name', 'desc')
            ->orderBy('cycle.name', 'asc')
            ->orderBy('course.name', 'asc')
            ->paginate($size, ['*'], 'page', $page);

        $result = [
            'page' => $page,
            'size' => $size,
            'total' => $classrooms->total(),
            'items' => $classrooms->items(),
        ];

        return $result;
    }

    public static function detail(int $id)
    {
        $classroom = Classroom::findOrFail($id);

        $classroomMap = [
            'id' => $classroom->id,
            'course' => $classroom->studyPlanDetail->course->name,
            'teacher' => $classroom->teacher ? $classroom->teacher->person->names : null,
            'cycle' => $classroom->studyPlanDetail->cycle->name,
            'students' => $classroom->participants()->count(),
            'image' => $classroom->avatar,
        ];

        return $classroomMap;
    }

    public static function listCourses(Request $request)
    {
        ClassroomHelper::validateListCoursesRequest($request);

        $periodId = $request->input('period_id');
        $studyPlanId = $request->input('study_plan_id');
        $cycleId = $request->input('cycle_id');
        $shiftId = $request->input('shift_id');
        $sectionId = $request->input('section_id');

        $coursesAvailable = Course::select(['id', 'name'])
            ->whereHas('studyPlanDetails', function ($studyPlanDetails) use ($periodId, $studyPlanId, $cycleId, $shiftId, $sectionId) {
                $studyPlanDetails
                    ->where('study_plan_id', $studyPlanId)
                    ->where('cycle_id', $cycleId)
                    ->whereDoesntHave('classrooms', function ($classrooms) use ($periodId, $shiftId, $sectionId) {
                        $classrooms
                            ->where('period_id', $periodId)
                            ->where('shift_id', $shiftId)
                            ->where('section_id', $sectionId);
                    });
            })
            ->orderBy('name', 'asc')
            ->get();

        $coursesAssigned = Course::select(['id', 'name'])
            ->whereHas('studyPlanDetails', function ($studyPlanDetails) use ($periodId, $studyPlanId, $cycleId, $shiftId, $sectionId) {
                $studyPlanDetails
                    ->where('study_plan_id', $studyPlanId)
                    ->where('cycle_id', $cycleId)
                    ->whereHas('classrooms', function ($classrooms) use ($periodId, $shiftId, $sectionId) {
                        $classrooms
                            ->where('period_id', $periodId)
                            ->where('shift_id', $shiftId)
                            ->where('section_id', $sectionId);
                    });
            })
            ->orderBy('name', 'asc')
            ->get();

        $result = [
            'courses_available' => $coursesAvailable,
            'courses_assigned' => $coursesAssigned,
        ];

        return $result;
    }

    public static function create(Request $request)
    {
        ClassroomHelper::validateCreateRequest($request);

        $periodId = $request->input('period_id');
        $studyPlanId = $request->input('study_plan_id');
        $cycleId = $request->input('cycle_id');
        $shiftId = $request->input('shift_id');
        $sectionId = $request->input('section_id');
        $courseIds = $request->input('course_ids');

        $studyPlanDetails = StudyPlanDetail::select()
            ->where('study_plan_id', $studyPlanId)
            ->where('cycle_id', $cycleId)
            ->whereIn('course_id', $courseIds)
            ->whereDoesntHave('classrooms', function ($classrooms) use ($periodId, $shiftId, $sectionId) {
                $classrooms
                    ->where('period_id', $periodId)
                    ->where('shift_id', $shiftId)
                    ->where('section_id', $sectionId);
            })
            ->get();

        $createdClassrooms = [];
        foreach ($studyPlanDetails as $studyPlanDetail) {
            $createdClassrooms[] = [
                'period_id' => $periodId,
                'study_plan_detail_id' => $studyPlanDetail->id,
                'shift_id' => $shiftId,
                'section_id' => $sectionId,
            ];
        }

        Classroom::insert($createdClassrooms);

        return "Clases creadas correctamente";
    }

    public static function delete(int $id)
    {
        $classroom = Classroom::findOrFail($id);

        if ($classroom->participants()->exists()) {
            throw new Exception("No se puede eliminar la clase porque tiene estudiantes inscritos");
        }

        $classroom->delete();

        return "Clase eliminada correctamente";
    }

    public static function updateImage(int $id, Request $request)
    {
        $user = User::authenticated(RolTenant::TEACHER);

        ClassroomHelper::validateUpdateImageRequest($request);

        $file = $request->file('file');

        $classroom = Classroom::findOrFail($id);

        ClassroomHelper::validatePeriod($classroom->id);
        ClassroomHelper::validateAccess($classroom->id, $user->person_id, 'teacher');

        if ($classroom->avatar) {
            $classroom->avatar = 'public/' . $classroom->avatar;

            if (Storage::exists($classroom->avatar)) {
                Storage::delete($classroom->avatar);
            }
        }

        $path = $file->store('public/classroom');
        $path = str_replace('public/', '', $path);

        $classroom->update([
            'avatar' => $path,
        ]);

        return $path;
    }

    public static function updateFavorite(int $id)
    {
        $user = User::authenticated(RolTenant::STUDENT);

        $classroom = Classroom::findOrFail($id);

        ClassroomHelper::validatePeriod($classroom->id);

        $participant = Participant::select()
            ->whereHas('student', function ($query) use ($user) {
                $query->where('person_id', $user->person_id);
            })
            ->where('classroom_id', $id)
            ->first();

        if (!$participant) {
            throw new Exception("No eres un estudiante de esta clase");
        }

        $isFavorite = !$participant->is_favorite;

        $participant->update([
            'is_favorite' => $isFavorite,
        ]);

        $message = $isFavorite ? 'marcada' : 'desmarcada';

        return "Clase $message como favorita correctamente.";
    }
}
