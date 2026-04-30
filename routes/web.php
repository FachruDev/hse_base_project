<?php

use App\Http\Controllers\Web\DashboardController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware('external.user')->group(function (): void {
    Route::get('/dashboard', DashboardController::class)->name('dashboard');
});
