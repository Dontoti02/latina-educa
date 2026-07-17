<?php

namespace Modules\Tenant\Middleware;

use Closure;
use Illuminate\Http\Request;
use Carbon\Carbon;
use Exception;
use Illuminate\Support\Facades\DB;
use Modules\Admin\Models\Domain;
use Modules\Admin\Models\InstitutionModule;
use Modules\Shared\Services\CentralTransactionService;
use Modules\Shared\Utils\Response;

class CheckInstitutionModuleMiddleware
{
  public function handle(Request $request, Closure $next, $moduleKey)
  {
    try {
      $tenantId = tenant('id');
      $domain = Domain::byKey('tenant_id', $tenantId);
      $institution = $domain->institution;

      $dbBefore = DB::connection()->getDatabaseName();

      $module = CentralTransactionService::run(function () use ($institution, $moduleKey) {
        return InstitutionModule::where('institution_id', $institution->id)
          ->where('module_key', $moduleKey)
          ->first();
      });

      $dbAfter = DB::connection()->getDatabaseName();

      

      if (!$module) {
        throw new Exception('Módulo no habilitado o fuera de vigencia (No existe registro en BD para institution_id ' . ($institution ? $institution->id : 'null') . ').');
      }

      if (!$module->is_active) {
        throw new Exception('Módulo no habilitado o fuera de vigencia (El módulo está inactivo).');
      }

      if ($module->start_date && Carbon::now()->lt(Carbon::parse($module->start_date)->startOfDay())) {
        throw new Exception('Módulo no habilitado o fuera de vigencia (Fecha de inicio ' . $module->start_date . ' es posterior a la actual ' . Carbon::now()->toDateTimeString() . ').');
      }

      if ($module->end_date && Carbon::now()->gt(Carbon::parse($module->end_date)->endOfDay())) {
        throw new Exception('Módulo no habilitado o fuera de vigencia (Fecha de fin ' . $module->end_date . ' es anterior a la actual ' . Carbon::now()->toDateTimeString() . ').');
      }

      return $next($request);
    } catch (Exception $e) {
      return Response::forbidden($e->getMessage());
    }
  }
}