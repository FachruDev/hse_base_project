<?php

use App\Http\Controllers\Web\DashboardController;
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
});
