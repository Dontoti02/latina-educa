<?php

use Illuminate\Support\Facades\Route;
use Modules\Tenant\Middleware\AuthTenantMiddleware;
use Modules\Tenant\Middleware\DomainTenantMiddleware;
use Modules\Tenant\Middleware\SubscriptionTenantMiddleware;
use Modules\Tenant\Packages\Period\Controllers\PeriodController;

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
    Route::controller(PeriodController::class)
        ->prefix('period')
        ->group(function () {
            Route::post('list', 'list');
            Route::get('list', 'list');
            Route::get('current', 'current');
            Route::post('create', 'create');
            Route::put('update/{id}', 'update');
            Route::put('toggle/{id}', 'toggle');
            Route::put('disable/{id}', 'toggle');
            Route::put('{id}/close', 'toggle');
            Route::delete('delete/{id}', 'delete');
        });
});