<?php

namespace Modules\Tenant\Packages\Enrollment\UseCases;

use Exception;
use Illuminate\Http\Request;
use Modules\Shared\Utils\Response;
use Modules\Tenant\Packages\Enrollment\Repositories\EnrollmentRepository;

class EnrollmentUseCases
{
  public static function list(Request $request)
  {
    try {
      $result = EnrollmentRepository::list($request);
      return Response::success($result);
    } catch (Exception $e) {
      return Response::error($e->getMessage());
    }
  }

  public static function get(int $id)
  {
    try {
      $result = EnrollmentRepository::get($id);
      return Response::success($result);
    } catch (Exception $e) {
      return Response::error($e->getMessage());
    }
  }

  public static function getFormsData()
  {
    try {
      $result = EnrollmentRepository::getFormsData();
      return Response::success($result);
    } catch (Exception $e) {
      return Response::error($e->getMessage());
    }
  }

  public static function SearchStudent(Request $request)
  {
    try {
      $result = EnrollmentRepository::SearchStudent($request);
      return Response::success($result);
    } catch (Exception $e) {
      return Response::error($e->getMessage());
    }
  }

  public static function validateDNI(Request $request)
  {
    try {
      $result = EnrollmentRepository::validateDNI($request);
      return Response::success($result);
    } catch (Exception $e) {
      return Response::error($e->getMessage());
    }
  }

  public static function enrollRegularStudent(Request $request)
  {
    try {
      $result = EnrollmentRepository::enrollRegularStudent($request);
      return Response::success($result);
    } catch (Exception $e) {
      return Response::error($e->getMessage());
    }
  }

  public static function enrollNewStudent(Request $request)
  {
    try {
      $result = EnrollmentRepository::enrollNewStudent($request);
      return Response::success($result);
    } catch (Exception $e) {
      return Response::error($e->getMessage());
    }
  }

  public static function validateFamilyDNI(Request $request)
  {
    try {
      $result = EnrollmentRepository::validateFamilyDNI($request);
      return Response::success($result);
    } catch (Exception $e) {
      return Response::error($e->getMessage());
    }
  }

  public static function validateEnrollment(Request $request)
  {
    try {
      $result = EnrollmentRepository::validateEnrollment($request);
      return Response::success($result);
    } catch (Exception $e) {
      return Response::error($e->getMessage());
    }
  }

  public static function delete(int $id)
  {
    try {
      $result = EnrollmentRepository::delete($id);
      return Response::success($result);
    } catch (Exception $e) {
      return Response::error($e->getMessage());
    }
  }

  public static function updateEnroll(int $id, Request $request)
  {
    try {
      $result = EnrollmentRepository::updateEnroll($id, $request);
      return Response::success($result);
    } catch (Exception $e) {
      return Response::error($e->getMessage());
    }
  }

  public static function getValidationsForEnrollment()
  {
    try {
      $result = EnrollmentRepository::getValidationsForEnrollment();
      return Response::success($result);
    } catch (Exception $e) {
      return Response::error($e->getMessage());
    }
  }
}
