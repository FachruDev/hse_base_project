<?php

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

    Route::get('/dashboard/master-data/{module}', [MasterDataController::class, 'index'])
        ->name('dashboard.master-data.index');
    Route::post('/dashboard/master-data/{module}', [MasterDataController::class, 'store'])
        ->name('dashboard.master-data.store');
    Route::patch('/dashboard/master-data/{module}/{record}', [MasterDataController::class, 'update'])
        ->name('dashboard.master-data.update');
    Route::delete('/dashboard/master-data/{module}/{record}', [MasterDataController::class, 'destroy'])
        ->name('dashboard.master-data.destroy');
});
