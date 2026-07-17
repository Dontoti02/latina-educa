<?php

namespace Modules\Tenant\Packages\History\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\Tenant\Packages\History\UseCases\HistoryUseCases;

class HistoryController extends Controller
{
    public function filters()
    {
        return HistoryUseCases::filters();
    }

    public function listStudents(Request $request)
    {
        return HistoryUseCases::listStudents($request);
    }

    public function list(Request $request)
    {
        return HistoryUseCases::list($request);
    }
}
