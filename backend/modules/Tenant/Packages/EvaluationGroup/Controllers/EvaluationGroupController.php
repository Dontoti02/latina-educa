<?php

namespace Modules\Tenant\Packages\EvaluationGroup\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\Tenant\Packages\EvaluationGroup\UseCases\EvaluationGroupUseCases;

class EvaluationGroupController extends Controller
{
    public function list(int $classroom_id)
    {
        return EvaluationGroupUseCases::list($classroom_id);
    }

    public function set(Request $request)
    {
        return EvaluationGroupUseCases::set($request);
    }
}
