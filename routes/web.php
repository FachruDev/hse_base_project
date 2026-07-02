<?php

use App\Http\Controllers\Web\ConfigurationController;
use App\Http\Controllers\Web\DashboardController;
use App\Http\Controllers\Web\MasterDataController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware('external.user')->group(function (): void {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get(
        '/dashboard/forms/catatan-pengolahan-limbah-air',
        [DashboardController::class, 'catatanPengolahanLimbahAirIndex'],
    )->name('dashboard.forms.catatan-pengolahan-limbah-air.index');
    Route::get(
        '/dashboard/forms/catatan-pengolahan-limbah-air/create',
        [DashboardController::class, 'catatanPengolahanLimbahAirCreate'],
    )->name('dashboard.forms.catatan-pengolahan-limbah-air.create');
    Route::get(
        '/dashboard/forms/catatan-pengolahan-limbah-air/monthly/{year}/{month}',
        [DashboardController::class, 'catatanPengolahanLimbahAirMonthlyShow'],
    )->name('dashboard.forms.catatan-pengolahan-limbah-air.monthly.show');
    Route::get(
        '/dashboard/forms/catatan-pengolahan-limbah-air/monthly/{year}/{month}/checklist.pdf',
        [DashboardController::class, 'catatanPengolahanLimbahAirMonthlyChecklistPdf'],
    )->name('dashboard.forms.catatan-pengolahan-limbah-air.monthly.checklist.pdf');
    Route::get(
        '/dashboard/forms/catatan-pengolahan-limbah-air/monthly/{year}/{month}/batch-mixing.pdf',
        [DashboardController::class, 'catatanPengolahanLimbahAirMonthlyBatchMixingPdf'],
    )->name('dashboard.forms.catatan-pengolahan-limbah-air.monthly.batch-mixing.pdf');
    Route::post(
        '/dashboard/forms/catatan-pengolahan-limbah-air/monthly/{year}/{month}/checklist-approval',
        [DashboardController::class, 'catatanPengolahanLimbahAirApproveMonthlyChecklist'],
    )->name('dashboard.forms.catatan-pengolahan-limbah-air.monthly.checklist-approval');
    Route::get(
        '/dashboard/forms/catatan-pengolahan-limbah-air/logs/{log}',
        [DashboardController::class, 'catatanPengolahanLimbahAirLogShow'],
    )->name('dashboard.forms.catatan-pengolahan-limbah-air.logs.show');
    Route::patch(
        '/dashboard/forms/catatan-pengolahan-limbah-air/logs/{log}/approve',
        [DashboardController::class, 'catatanPengolahanLimbahAirApproveDailyLog'],
    )->name('dashboard.forms.catatan-pengolahan-limbah-air.logs.approve');
    Route::patch(
        '/dashboard/forms/catatan-pengolahan-limbah-air/logs/{log}/reopen',
        [DashboardController::class, 'catatanPengolahanLimbahAirReopenDailyLog'],
    )->name('dashboard.forms.catatan-pengolahan-limbah-air.logs.reopen');
    Route::post(
        '/dashboard/forms/catatan-pengolahan-limbah-air/monthly/{year}/{month}/process-approval',
        [DashboardController::class, 'catatanPengolahanLimbahAirApproveMonthlyProcess'],
    )->name('dashboard.forms.catatan-pengolahan-limbah-air.monthly.process-approval');
    Route::post(
        '/dashboard/forms/catatan-pengolahan-limbah-air/monthly/{year}/{month}/process-approval/reopen',
        [DashboardController::class, 'catatanPengolahanLimbahAirReopenMonthlyProcess'],
    )->name('dashboard.forms.catatan-pengolahan-limbah-air.monthly.process-approval.reopen');
    Route::post(
        '/dashboard/forms/catatan-pengolahan-limbah-air/checklist',
        [DashboardController::class, 'catatanPengolahanLimbahAirSaveChecklist'],
    )->name('dashboard.forms.catatan-pengolahan-limbah-air.checklist.store');
    Route::post(
        '/dashboard/forms/catatan-pengolahan-limbah-air/process',
        [DashboardController::class, 'catatanPengolahanLimbahAirSaveProcess'],
    )->name('dashboard.forms.catatan-pengolahan-limbah-air.process.store');
    Route::get(
        '/dashboard/forms/penyimpanan-limbah-b3',
        [DashboardController::class, 'b3StorageIndex'],
    )->name('dashboard.forms.penyimpanan-limbah-b3.index');
    Route::get(
        '/dashboard/forms/penyimpanan-limbah-b3/create',
        [DashboardController::class, 'b3StorageCreate'],
    )->name('dashboard.forms.penyimpanan-limbah-b3.create');
    Route::get(
        '/dashboard/forms/penyimpanan-limbah-b3/monthly/{year}/{month}',
        [DashboardController::class, 'b3StorageMonthlyShow'],
    )->name('dashboard.forms.penyimpanan-limbah-b3.monthly.show');
    Route::post(
        '/dashboard/forms/penyimpanan-limbah-b3/monthly/{year}/{month}/approval',
        [DashboardController::class, 'b3StorageApproveMonthly'],
    )->name('dashboard.forms.penyimpanan-limbah-b3.monthly.approval');
    Route::post(
        '/dashboard/forms/penyimpanan-limbah-b3',
        [DashboardController::class, 'b3StorageStore'],
    )->name('dashboard.forms.penyimpanan-limbah-b3.store');
    Route::get(
        '/dashboard/forms/penyimpanan-limbah-b3/{log}/photo',
        [DashboardController::class, 'b3StoragePhoto'],
    )->name('dashboard.forms.penyimpanan-limbah-b3.photo');

    Route::get('/dashboard/master-data/{module}', [MasterDataController::class, 'index'])
        ->name('dashboard.master-data.index');
    Route::post('/dashboard/master-data/{module}', [MasterDataController::class, 'store'])
        ->name('dashboard.master-data.store');
    Route::patch('/dashboard/master-data/{module}/{record}', [MasterDataController::class, 'update'])
        ->name('dashboard.master-data.update');
    Route::delete('/dashboard/master-data/{module}/{record}', [MasterDataController::class, 'destroy'])
        ->name('dashboard.master-data.destroy');

    Route::get('/dashboard/configuration/weekend', [ConfigurationController::class, 'weekendIndex'])
        ->name('dashboard.configuration.weekend.index');
    Route::patch('/dashboard/configuration/weekend/{operationalWeekday}', [ConfigurationController::class, 'weekendUpdate'])
        ->name('dashboard.configuration.weekend.update');

    Route::get('/dashboard/configuration/holidays', [ConfigurationController::class, 'holidayIndex'])
        ->name('dashboard.configuration.holidays.index');
    Route::post('/dashboard/configuration/holidays', [ConfigurationController::class, 'holidayStore'])
        ->name('dashboard.configuration.holidays.store');
    Route::patch('/dashboard/configuration/holidays/{holiday}', [ConfigurationController::class, 'holidayUpdate'])
        ->name('dashboard.configuration.holidays.update');
    Route::delete('/dashboard/configuration/holidays/{holiday}', [ConfigurationController::class, 'holidayDestroy'])
        ->name('dashboard.configuration.holidays.destroy');
});
