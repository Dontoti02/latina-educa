<?php

namespace Modules\Shared\Services;
use Illuminate\Support\Facades\DB;
use Modules\Admin\Models\Institution;
class CentralTransactionService
{
    public static function run(callable $callback)
    {

        return tenancy()->central(function () use ($callback) {
            
            DB::beginTransaction();

            try {

                $response = call_user_func($callback);
                
                DB::commit();
    
                return $response;
    
            } catch (\Exception $e) {
                DB::rollback();
                throw $e;
            }
        });
    }

    public static function institution($tenantId): Institution {
        return CentralTransactionService::run(function() use ($tenantId) {
            $institution = Institution::whereHas('domain', function($subquery)  use ($tenantId) {
                return $subquery->where('tenant_id',$tenantId);
            })->with('storage')->first();
            return $institution;
        });
    }
}
