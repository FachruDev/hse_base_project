<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Services\Web\DashboardService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function __invoke(Request $request, DashboardService $dashboardService): Response
    {
        return Inertia::render('dashboard/index', [
            'dashboard' => $dashboardService->build($request->user()),
        ]);
    }
}
