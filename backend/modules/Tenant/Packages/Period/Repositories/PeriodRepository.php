<?php

namespace Modules\Tenant\Packages\Period\Repositories;

use Carbon\Carbon;
use Exception;
use Illuminate\Http\Request;
use Modules\Tenant\Models\Classroom;
use Modules\Tenant\Models\Period;
use Modules\Tenant\Packages\Period\Helpers\PeriodHelper;

class PeriodRepository
{
    public static function list(Request $request)
    {
        if ($request->isMethod('get')) {
            $periods = Period::select()->orderBy('name', 'desc')->get();
            $items = [];
            foreach ($periods as $period) {
                $totalStudents = $period->enrollments()->count();
                $totalClassrooms = $period->classrooms()->count();
                $items[] = [
                    'id' => ['value' => $period->id, 'is_editable' => false],
                    'name' => ['value' => $period->name, 'is_editable' => !$totalClassrooms],
                    'is_current' => ['value' => (bool)$period->is_current, 'is_editable' => true],
                    'start_date' => ['value' => $period->start_date, 'is_editable' => true],
                    'end_date' => ['value' => $period->end_date, 'is_editable' => true],
                    'enrollment_start_date' => ['value' => $period->enrollment_start_date, 'is_editable' => true],
                    'enrollment_end_date' => ['value' => $period->enrollment_end_date, 'is_editable' => true],
                    'section_start_date' => ['value' => $period->classroom_start_date, 'is_editable' => true],
                    'section_end_date' => ['value' => $period->classroom_end_date, 'is_editable' => true],
                    'is_number_to_fail' => ['value' => $period->is_number_to_fail, 'is_editable' => true],
                    'section_max_to_fail' => ['value' => $period->classroom_max_to_fail, 'is_editable' => true],
                    'is_required_enrollment_payment' => ['value' => (bool)$period->is_required_enrollment_payment, 'is_editable' => true],
                    'students' => ['value' => $totalStudents, 'is_editable' => false],
                    'classrooms' => ['value' => $totalClassrooms, 'is_editable' => false],
                    'status' => ['value' => $period->is_current ? 'SIN TERMINO' : 'TERMINADO', 'is_editable' => false],
                ];
            }
            return $items;
        }

        PeriodHelper::validateListRequest($request);

        $page = $request->input('page');
        $size = $request->input('size');
        $search = $request->input('search');

        $periods = Period::select()
            ->when($search, function ($query) use ($search) {
                $query->where('name', 'like', "%$search%");
            })
            ->orderBy('name', 'desc')
            ->paginate($size, ['*'], 'page', $page);

        $result = [
            'page' => $page,
            'size' => $size,
            'total' => $periods->total(),
            'items' => $periods->items(),
        ];

        return $result;
    }

    public static function current()
    {
        $period = PeriodHelper::current(true);
        return [
            'id' => $period->id,
            'name' => $period->name,
            'status' => $period->is_current ? 'SIN TERMINO' : 'TERMINADO',
            'classrooms' => $period->classrooms()->count(),
            'students' => $period->enrollments()->count(),
            'start_date' => $period->start_date,
            'end_date' => $period->end_date,
        ];
    }

    public static function create(Request $request)
    {
        if ($request->has('section_start_date')) {
            $request->merge([
                'classroom_start_date' => $request->input('section_start_date'),
                'classroom_end_date' => $request->input('section_end_date'),
                'classroom_max_to_fail' => $request->input('section_max_to_fail'),
            ]);
        }

        PeriodHelper::validateRequest($request);

        $name = $request->input('name');
        $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
        $endDate = Carbon::parse($request->input('end_date'))->endOfDay();
        $enrollmentStartDate = $request->input('enrollment_start_date');
        $enrollmentEndDate = $request->input('enrollment_end_date');
        $classroomStartDate = $request->input('classroom_start_date');
        $classroomEndDate = $request->input('classroom_end_date');
        $isNumberToFail = $request->input('is_number_to_fail');
        $classroomMaxToFail = $request->input('classroom_max_to_fail');
        $isRequiredEnrollmentPayment = $request->input('is_required_enrollment_payment');

        $existsPeriodName = Period::select()
            ->where('name', $name)
            ->exists();

        if ($existsPeriodName) {
            throw new Exception('Ya existe un periodo registrado con el mismo nombre.');
        }

        $existsPeriod = Period::select()
            ->where(function ($query) use ($startDate) {
                $query
                    ->where('start_date', '<=', $startDate)
                    ->where('end_date', '>=', $startDate);
            })
            ->orWhere(function ($query) use ($endDate) {
                $query
                    ->where('start_date', '<=', $endDate)
                    ->where('end_date', '>=', $endDate);
            })
            ->orWhere(function ($query) use ($startDate, $endDate) {
                $query
                    ->where('start_date', '>=', $startDate)
                    ->where('end_date', '<=', $endDate);
            })
            ->exists();

        if ($existsPeriod) {
            throw new Exception('Ya existe un periodo registrado dentro del rango de fechas.');
        }

        Period::create([
            'name' => $name,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'enrollment_start_date' => $enrollmentStartDate,
            'enrollment_end_date' => $enrollmentEndDate,
            'classroom_start_date' => $classroomStartDate,
            'classroom_end_date' => $classroomEndDate,
            'is_number_to_fail' => $isNumberToFail,
            'classroom_max_to_fail' => $classroomMaxToFail,
            'is_required_enrollment_payment' => $isRequiredEnrollmentPayment,
        ]);

        return 'Periodo creado correctamente.';
    }

    public static function update(int $id, Request $request)
    {
        if ($request->has('section_start_date')) {
            $request->merge([
                'classroom_start_date' => $request->input('section_start_date'),
                'classroom_end_date' => $request->input('section_end_date'),
                'classroom_max_to_fail' => $request->input('section_max_to_fail'),
            ]);
        }

        PeriodHelper::validateRequest($request);

        $period = Period::findOrFail($id);

        $name = $request->input('name');
        $startDate = Carbon::parse($request->input('start_date'))->startOfDay();
        $endDate = Carbon::parse($request->input('end_date'))->endOfDay();
        $enrollmentStartDate = $request->input('enrollment_start_date');
        $enrollmentEndDate = $request->input('enrollment_end_date');
        $classroomStartDate = $request->input('classroom_start_date');
        $classroomEndDate = $request->input('classroom_end_date');
        $isNumberToFail = $request->input('is_number_to_fail');
        $classroomMaxToFail = $request->input('classroom_max_to_fail');
        $isRequiredEnrollmentPayment = $request->input('is_required_enrollment_payment');

        $existsPeriodName = Period::select()
            ->where('id', '!=', $id)
            ->where('name', $name)
            ->exists();

        if ($existsPeriodName) {
            throw new Exception('Ya existe un periodo registrado con el mismo nombre.');
        }

        $existsPeriod = Period::select()
            ->where('id', '!=', $id)
            ->where(function ($query) use ($startDate, $endDate) {
                $query
                    ->where(function ($query) use ($startDate) {
                        $query
                            ->where('start_date', '<=', $startDate)
                            ->where('end_date', '>=', $startDate);
                    })
                    ->orWhere(function ($query) use ($endDate) {
                        $query
                            ->where('start_date', '<=', $endDate)
                            ->where('end_date', '>=', $endDate);
                    })
                    ->orWhere(function ($query) use ($startDate, $endDate) {
                        $query
                            ->where('start_date', '>=', $startDate)
                            ->where('end_date', '<=', $endDate);
                    });
            })
            ->exists();

        if ($existsPeriod) {
            throw new Exception('Ya existe un periodo registrado dentro del rango de fechas.');
        }

        $period->update([
            'name' => $name,
            'start_date' => $startDate,
            'end_date' => $endDate,
            'enrollment_start_date' => $enrollmentStartDate,
            'enrollment_end_date' => $enrollmentEndDate,
            'classroom_start_date' => $classroomStartDate,
            'classroom_end_date' => $classroomEndDate,
            'is_number_to_fail' => $isNumberToFail,
            'classroom_max_to_fail' => $classroomMaxToFail,
            'is_required_enrollment_payment' => $isRequiredEnrollmentPayment,
        ]);

        return 'Periodo actualizado correctamente.';
    }

    public static function toggle(int $id)
    {
        $period = Period::findOrFail($id);

        $is_current = !$period->is_current;

        if (!$is_current) {
            $exists = Classroom::select()
                ->where('period_id', $id)
                ->where('is_closed', false)
                ->exists();

            if ($exists) {
                throw new Exception('No se puede finalizar el periodo porque tiene clases sin cerrar.');
            }
        } else {
            $currentPeriod = Period::select()
                ->where('id', '!=', $id)
                ->where('is_current', true)
                ->first();

            if ($currentPeriod) {
                throw new Exception("Se debe finalizar el periodo $currentPeriod->name antes de activar este.");
            }
        }

        $period->update([
            'is_current' => $is_current,
        ]);

        $message = $is_current ? 'activado' : 'finalizado';

        return "Periodo $message correctamente.";
    }

    public static function delete(int $id)
    {
        $period = Period::findOrFail($id);

        if ($period->classrooms()->exists()) {
            throw new Exception('No se puede eliminar el periodo porque tiene clases asociadas');
        }

        if ($period->enrollments()->exists()) {
            throw new Exception('No se puede eliminar el periodo porque tiene matriculas asociadas');
        }

        $period->delete();

        return 'Periodo eliminado correctamente.';
    }
}