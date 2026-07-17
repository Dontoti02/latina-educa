<?php

namespace Modules\Tenant\Packages\Enrollment\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Modules\Tenant\Packages\Enrollment\UseCases\EnrollmentUseCases;

class EnrollmentController extends Controller
{
  public function list(Request $request)
  {
    return EnrollmentUseCases::list($request);
  }

  public function getFormsData()
  {
    return EnrollmentUseCases::getFormsData();
  }

  public function SearchStudent(Request $request)
  {
    return EnrollmentUseCases::SearchStudent($request);
  }

  public function validateDNI(Request $request)
  {
    return EnrollmentUseCases::validateDNI($request);
  }

  public function enrollRegularStudent(Request $request)
  {
    return EnrollmentUseCases::enrollRegularStudent($request);
  }

  public function enrollNewStudent(Request $request)
  {
    return EnrollmentUseCases::enrollNewStudent($request);
  }

  public function validateFamilyDNI(Request $request)
  {
    return EnrollmentUseCases::validateFamilyDNI($request);
  }

  public function validateEnrollment(Request $request)
  {
    return EnrollmentUseCases::validateEnrollment($request);
  }

  public function delete(int $id)
  {
    return EnrollmentUseCases::delete($id);
  }

  public function get(int $id)
  {
    return EnrollmentUseCases::get($id);
  }

  public function updateEnroll(int $id, Request $request)
  {
    return EnrollmentUseCases::updateEnroll($id, $request);
  }

  public function getValidationsForEnrollment()
  {
    return EnrollmentUseCases::getValidationsForEnrollment();
  }
}
