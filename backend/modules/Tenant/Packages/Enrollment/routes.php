<?php

use Illuminate\Support\Facades\Route;
use Modules\Tenant\Middleware\AuthTenantMiddleware;
use Modules\Tenant\Middleware\DomainTenantMiddleware;
use Modules\Tenant\Middleware\SubscriptionTenantMiddleware;
use Modules\Tenant\Packages\Enrollment\Controllers\EnrollmentController;

#rutas publicas
Route::group(['middleware' => [
    DomainTenantMiddleware::class,
    SubscriptionTenantMiddleware::class,
]], function () {
    //
});

#rutas privadas
Route::group(['middleware' => [
    AuthTenantMiddleware::class,
    DomainTenantMiddleware::class,
    SubscriptionTenantMiddleware::class,
]], function () {
    Route::controller(EnrollmentController::class)
        ->prefix('enrollment')
        ->group(function () {
            Route::post('list', 'list');
            Route::get('get/{id}', 'get');
            Route::get('getFormsData', 'getFormsData');
            Route::post('searchStudent', 'searchStudent');
            Route::post('validateDNI', 'validateDNI');
            Route::post('validateEnrollment', 'validateEnrollment');
            Route::post('enrollRegularStudent', 'enrollRegularStudent');
            Route::post('enrollNewStudent', 'enrollNewStudent');
            Route::post('validateFamilyDNI', 'validateFamilyDNI');
            Route::delete('deleteEnroll/{id}', 'delete');
            Route::put('updateEnroll/{id}', 'updateEnroll');
            Route::get('validations', 'getValidationsForEnrollment');
        });
});
