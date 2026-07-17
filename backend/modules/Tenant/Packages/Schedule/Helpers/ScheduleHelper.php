<?php

namespace Modules\Tenant\Packages\Schedule\Helpers;

use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Modules\Shared\Enum\DaysOfWeek;
use Modules\Tenant\Models\Classroom;
use Modules\Tenant\Models\Schedule;
use Modules\Tenant\Packages\SystemConfiguration\Helpers\SystemConfigurationHelper;

class ScheduleHelper
{
    public static function validateListRequest(Request $request, $is_secretary)
    {
        $required = $is_secretary ? "required" : "nullable";

        $validator = Validator::make($request->all(), [
            "period_id"         => "required|numeric|exists:period,id",
            "study_program_id"  => "$required|numeric|exists:study_program,id",
            "cycle_id"          => "$required|numeric|exists:cycle,id",
        ]);

        if ($validator->fails()) {
            throw new Exception($validator->errors()->first());
        }
    }

    public static function validateListClassroomsRequest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            "period_id"         => "required|numeric|exists:period,id",
            "study_program_id"  => "required|numeric|exists:study_program,id",
            "cycle_id"          => "required|numeric|exists:cycle,id",
        ]);

        if ($validator->fails()) {
            throw new Exception($validator->errors()->first());
        }
    }

    public static function validateListTeachersRequest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            "period_id" => "required|numeric|exists:period,id",
        ]);

        if ($validator->fails()) {
            throw new Exception($validator->errors()->first());
        }
    }

    public static function validateRequest(Request $request, $update = false)
    {
        $required = $update ? "nullable" : "required";

        $validator = Validator::make($request->all(), [
            "classroom_id"  => "$required|numeric|exists:classroom,id",
            "day"           => "required|numeric|in:0,1,2,3,4,5,6",
            "hour_start"    => "required|string|size:5",
            "hour_end"      => "required|string|size:5",
        ]);

        if ($validator->fails()) {
            throw new Exception($validator->errors()->first());
        }
    }

    public static function validateNotExistsSchedule($classroom, $request, $day, $hour_start, $hour_end)
    {
        $schedule = $classroom->schedules()
            ->where('id', '!=', $request)
            ->where('day', $day)
            ->where(function ($query) use ($hour_start, $hour_end) {
                $query->where(function ($query) use ($hour_start, $hour_end) {
                    $query->where('hour_start', '>=', $hour_start)
                        ->where('hour_end', '<=', $hour_end);
                })
                    ->orWhere(function ($query) use ($hour_start, $hour_end) {
                        $query->where('hour_start', '<', $hour_end)
                            ->where('hour_end', '>', $hour_start);
                    });
            })
            ->count();

        if ($schedule > 0) {
            throw new Exception("El horario hace conflicto con otro horario existente");
        }
    }

    public static function validateHoursAndMinutes(Request $request)
    {
        $hours = SystemConfigurationHelper::getStudyHours();
        $start = Carbon::createFromFormat('H:i', $hours->start);
        $end = Carbon::createFromFormat('H:i', $hours->end);

        $hour_start = Carbon::createFromFormat('H:i', $request->hour_start);
        $hour_end = Carbon::createFromFormat('H:i', $request->hour_end);

        $valid_minutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

        if (!in_array($hour_start->minute, $valid_minutes)) {
            throw new Exception("Los minutos de la hora de inicio deben ser cada 5");
        }

        if (!in_array($hour_end->minute, $valid_minutes)) {
            throw new Exception("Los minutos de la hora de fin deben ser cada 5");
        }

        if ($hour_start->lt($start)) {
            throw new Exception("La hora de inicio debe ser mayor o igual a la hora de inicio de clases");
        }

        if ($hour_start->gte($end)) {
            throw new Exception("La hora de inicio debe ser menor a la hora de fin de clases");
        }

        if ($hour_start->gte($hour_end)) {
            throw new Exception("La hora de inicio debe ser menor a la hora de fin");
        }

        if ($hour_end->gt($end)) {
            throw new Exception("La hora de fin debe ser menor o igual a la hora de fin de clases");
        }

        if ($hour_start->diffInMinutes($hour_end) < 45) {
            throw new Exception("Se acepta mínimo 45 minutos por clase diaria");
        }

        if ($hour_start->diffInMinutes($hour_end) > 120) {
            throw new Exception("Se acepta máximo 2 horas por clase diaria");
        }
    }

    public static function validateShift($classroom, Request $request)
    {
        $hours = SystemConfigurationHelper::getStudyHours();
        $shift_one_start = Carbon::createFromFormat('H:i', $hours->start);
        $shift_one_end = Carbon::createFromFormat('H:i', '12:00');

        $shift_two_start = Carbon::createFromFormat('H:i', '12:00');
        $shift_two_end = Carbon::createFromFormat('H:i', $hours->end);

        $hour_start = Carbon::createFromFormat('H:i', $request->hour_start);
        $hour_end = Carbon::createFromFormat('H:i', $request->hour_end);

        if ($classroom->shift->name == 'MAÑANA') {
            if ($hour_start->lt($shift_one_start) || $hour_end->gt($shift_one_end)) {
                throw new Exception("El horario no corresponde al turno de la mañana");
            }
        } else if ($classroom->shift->name == 'TARDE') {
            if ($hour_start->lt($shift_two_start) || $hour_end->gt($shift_two_end)) {
                throw new Exception("El horario no corresponde al turno de la tarde");
            }
        } else {
            throw new Exception("Turno no contemplado");
        }
    }

    public static function validateNotCross($classroom, Request $request)
    {
        $hour_start = Carbon::createFromFormat('H:i', $request->hour_start);
        $hour_end = Carbon::createFromFormat('H:i', $request->hour_end);

        $classrooms = Classroom::select([
            'classroom.id',
            'course.name as course_name',
            'schedule.hour_start',
            'schedule.hour_end',
        ])
            ->join('study_plan_detail', 'classroom.study_plan_detail_id', 'study_plan_detail.id')
            ->join('course', 'study_plan_detail.course_id', 'course.id')
            ->join('study_plan', 'study_plan_detail.study_plan_id', 'study_plan.id')
            ->join('schedule', 'classroom.id', 'schedule.classroom_id')
            ->where('classroom.id', '!=', $classroom->id)
            ->where('study_plan_detail.course_id', '!=', $classroom->studyPlanDetail->course_id)
            ->where('classroom.period_id', $classroom->period_id)
            ->where('classroom.section_id', $classroom->section_id)
            ->where('study_plan.study_program_id', $classroom->studyPlanDetail->studyPlan->study_program_id)
            ->where('study_plan_detail.cycle_id', $classroom->studyPlanDetail->cycle_id)
            ->where('schedule.day', $request->day)
            ->get();

        foreach ($classrooms as $classroom) {
            $start = Carbon::createFromFormat('H:i', $classroom->hour_start);
            $end = Carbon::createFromFormat('H:i', $classroom->hour_end);

            if ($hour_start->lt($end) && $start->lt($hour_end)) {
                throw new Exception("El horario se cruza con el curso $classroom->studyPlanDetail->course->name");
            }
        }
    }

    public static function validateAssignTeacherRequest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'person_id'     => 'required|numeric|exists:person,id',
            'classroom_id'  => 'required|numeric|exists:classroom,id',
        ]);

        if ($validator->fails()) {
            throw new Exception($validator->errors()->first());
        }
    }

    public static function validateNotCrossByTeacher($classroom, Request $request)
    {
        $columns = [
            'schedule.id',
            'schedule.day',
            'schedule.hour_start',
            'schedule.hour_end',
            'course.name as course_name',
        ];

        $schedules_assign = Schedule::select($columns)
            ->join('classroom', 'schedule.classroom_id', 'classroom.id')
            ->join('study_plan_detail', 'classroom.study_plan_detail_id', 'study_plan_detail.id')
            ->join('course', 'study_plan_detail.course_id', 'course.id')
            ->join('teacher', 'classroom.teacher_id', 'teacher.id')
            ->where('teacher.person_id', $request->person_id)
            ->where('classroom.period_id', $classroom->period_id)
            ->get()
            ->toArray();

        $schedules_current = Schedule::select($columns)
            ->join('classroom', 'schedule.classroom_id', 'classroom.id')
            ->join('study_plan_detail', 'classroom.study_plan_detail_id', 'study_plan_detail.id')
            ->join('course', 'study_plan_detail.course_id', 'course.id')
            ->where('classroom.id', $classroom->id)
            ->get()
            ->toArray();

        $schedules = array_merge($schedules_assign, $schedules_current);

        $days = [];
        foreach ($schedules as $schedule) {
            $start = Carbon::createFromFormat('H:i', $schedule['hour_start']);
            $end = Carbon::createFromFormat('H:i', $schedule['hour_end']);

            $hours = [];
            while ($start->lte($end)) {
                $hours[] = $start->format('H:i');
                $start->addMinutes(5);
            }
            array_pop($hours);

            $hours_of_day = $days[$schedule['day']] ?? [];

            $intersection = array_intersect($hours_of_day, $hours);

            if (!empty($intersection)) {
                $course = $schedule['course_name'];
                $day = DaysOfWeek::DAYS[$schedule['day']];
                throw new Exception("Al docente se le cruza el horario con el curso $course el día $day");
            }

            $days[$schedule['day']] = array_merge($hours_of_day, $hours);
        }
    }

    public static function validateFiltersByExportRequest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            "period_id"         => "required|numeric|exists:period,id",
            "study_program_id"  => "required|numeric|exists:study_program,id",
            "cycle_id"          => "required|numeric|exists:cycle,id",
        ]);

        if ($validator->fails()) {
            throw new Exception($validator->errors()->first());
        }
    }

    public static function validateListByExportRequest(Request $request, $is_secretary)
    {
        $required = $is_secretary ? "required" : "nullable";

        $validator = Validator::make($request->all(), [
            "period_id"     => "required|numeric|exists:period,id",
            "rol_id"        => "$required|numeric|exists:rol,id",
            "person_id"     => "$required|numeric|exists:person,id",
        ]);

        if ($validator->fails()) {
            throw new Exception($validator->errors()->first());
        }
    }
}
