<?php

namespace Modules\Tenant\Packages\Registration\UseCases;

use Exception;
use Illuminate\Http\Request;
use Modules\Shared\Utils\Response;
use Modules\Tenant\Packages\Registration\Repositories\RegistrationRepository;

class RegistrationUseCases
{
    public static function filters()
    {
        try {
            $result = RegistrationRepository::filters();
            return Response::success($result);
        } catch (Exception $e) {
            return Response::error($e->getMessage());
        }
    }

    public static function listStudents(Request $request)
    {
        try {
            $result = RegistrationRepository::listStudents($request);
            return Response::success($result);
        } catch (Exception $e) {
            return Response::error($e->getMessage());
        }
    }

    public static function list(Request $request)
    {
        try {
            [$result] = RegistrationRepository::list($request);
            return Response::success($result);
        } catch (Exception $e) {
            return Response::error($e->getMessage());
        }
    }
}
