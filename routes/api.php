<?php

use App\Http\Controllers\Api\Admin\PermissionController;
use App\Http\Controllers\Api\Admin\RoleController;
use App\Http\Controllers\Api\Admin\UserController;
use App\Http\Controllers\Api\Auth\MobileAuthController;
use App\Http\Controllers\Api\B3Storage\B3StorageInitiatorDepartmentController;
use App\Http\Controllers\Api\B3Storage\B3StorageLogController;
use App\Http\Controllers\Api\B3Storage\B3StorageWasteTypeController;
use App\Http\Controllers\Api\Ipal\IpalLogController;
use App\Http\Controllers\Api\Master\BatchItemController;
use App\Http\Controllers\Api\Master\BatchSectionController;
use App\Http\Controllers\Api\Master\ChecklistItemController;
use App\Http\Controllers\Api\Master\ChecklistTemplateController;
use App\Http\Controllers\Api\Master\HolidayController;
use App\Http\Controllers\Api\Master\MasterDataController;
use App\Http\Controllers\Api\Master\OperationalWeekdayController;
use App\Http\Controllers\Api\Master\ProcessItemController;
use App\Http\Controllers\Api\Master\ProcessSectionController;
use App\Http\Controllers\Api\Master\ProcessTemplateController;
use Illuminate\Support\Facades\Route;

Route::post('auth/login', [MobileAuthController::class, 'login']);

Route::middleware('external.user')->group(function (): void {
    Route::prefix('auth')->group(function (): void {
        Route::get('me', [MobileAuthController::class, 'me']);
        Route::post('logout', [MobileAuthController::class, 'logout']);
    });

    Route::prefix('master')->group(function (): void {
        Route::get('checklist', [MasterDataController::class, 'checklist']);
        Route::get('process', [MasterDataController::class, 'process']);

        Route::apiResource('checklist-templates', ChecklistTemplateController::class)
            ->parameters(['checklist-templates' => 'checklistTemplate']);
        Route::apiResource('checklist-items', ChecklistItemController::class)
            ->parameters(['checklist-items' => 'checklistItem']);
        Route::apiResource('process-templates', ProcessTemplateController::class)
            ->parameters(['process-templates' => 'processTemplate']);
        Route::apiResource('process-sections', ProcessSectionController::class)
            ->parameters(['process-sections' => 'processSection']);
        Route::apiResource('process-items', ProcessItemController::class)
            ->parameters(['process-items' => 'processItem']);
        Route::apiResource('batch-items', BatchItemController::class)
            ->parameters(['batch-items' => 'batchItem']);
        Route::apiResource('batch-sections', BatchSectionController::class)
            ->parameters(['batch-sections' => 'batchSection']);
        Route::apiResource('operational-weekdays', OperationalWeekdayController::class)
            ->parameters(['operational-weekdays' => 'operationalWeekday']);
        Route::apiResource('holidays', HolidayController::class);
    });

    Route::prefix('ipal')->group(function (): void {
        Route::get('logs', [IpalLogController::class, 'index']);
        Route::post('logs', [IpalLogController::class, 'store']);
        Route::get('logs/{log}', [IpalLogController::class, 'show']);
        Route::post('logs/{log}/submit', [IpalLogController::class, 'submit']);
        Route::post('logs/{log}/approve', [IpalLogController::class, 'approve']);
    });

    Route::prefix('b3-storage')->group(function (): void {
        Route::prefix('master')->group(function (): void {
            Route::apiResource('waste-types', B3StorageWasteTypeController::class)
                ->parameters(['waste-types' => 'wasteType']);
            Route::apiResource('initiator-departments', B3StorageInitiatorDepartmentController::class)
                ->parameters(['initiator-departments' => 'initiatorDepartment']);
        });

        Route::apiResource('logs', B3StorageLogController::class)
            ->parameters(['logs' => 'log']);
        Route::get('logs/{log}/photo', [B3StorageLogController::class, 'photo']);
    });

    Route::prefix('admin')->group(function (): void {
        Route::apiResource('users', UserController::class);
        Route::apiResource('roles', RoleController::class);
        Route::apiResource('permissions', PermissionController::class);
    });
});
