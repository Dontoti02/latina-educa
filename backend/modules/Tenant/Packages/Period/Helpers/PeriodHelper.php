<?php

namespace Modules\Tenant\Packages\Period\Helpers;

use Exception;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Modules\Tenant\Models\Period;

class PeriodHelper
{
    public static function current($required = false)
    {
        $period = Period::select()
            ->where('is_current', true)
            ->first();

        if (!$period && $required) {
            throw new Exception('¡No se ha encontrado un periodo activo!');
        }

        if (!$period) {
            $period = Period::select()
                ->orderBy('id', 'desc')
                ->first();
        }

        return $period;
    }

    public static function validateListRequest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            "page"      => "required|integer|gt:0",
            "size"      => "required|integer|gt:0",
            "search"    => "nullable|string",
        ]);

        if ($validator->fails()) {
            throw new Exception($validator->errors()->first());
        }
    }

    public static function validateRequest(Request $request)
    {
        $validator = Validator::make($request->all(), [
            "name"                              => "required|string",
            "start_date"                        => "required|date",
            "end_date"                          => "required|date|after:start_date",
            "enrollment_start_date"             => "required|date",
            "enrollment_end_date"               => "required|date|after:enrollment_start_date",
            "classroom_start_date"              => "required|date",
            "classroom_end_date"                => "required|date|after:classroom_start_date",
            "is_number_to_fail"                 => "required|numeric|in:0,1,2",
            "classroom_max_to_fail"             => "required|numeric|min:0",
            "is_required_enrollment_payment"    => "required|boolean",
        ]);

        if ($validator->fails()) {
            throw new Exception($validator->errors()->first());
        }
    }
}
