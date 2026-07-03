<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SavePermissionRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;

class PermissionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('admin.permissions.view'), 403);

        $permissions = Permission::query()
            ->orderBy('name')
            ->paginate(20);

        return response()->json($permissions);
    }

    public function store(SavePermissionRequest $request): JsonResponse
    {
        abort_unless($request->user()?->hasRole('superadmin') && $request->user()?->can('admin.permissions.create'), 403);

        $validated = $request->validated();

        $permission = Permission::query()->create([
            'name' => $validated['name'],
            'guard_name' => $validated['guard_name'] ?? 'web',
        ]);

        return response()->json([
            'message' => 'Permission berhasil dibuat.',
            'data' => $permission,
        ], 201);
    }

    public function show(Request $request, Permission $permission): JsonResponse
    {
        abort_unless($request->user()?->can('admin.permissions.view'), 403);

        return response()->json([
            'data' => $permission,
        ]);
    }

    public function update(SavePermissionRequest $request, Permission $permission): JsonResponse
    {
        abort_unless($request->user()?->hasRole('superadmin') && $request->user()?->can('admin.permissions.update'), 403);

        $validated = $request->validated();

        $permission->update([
            'name' => $validated['name'],
            'guard_name' => $validated['guard_name'] ?? $permission->guard_name,
        ]);

        return response()->json([
            'message' => 'Permission berhasil diperbarui.',
            'data' => $permission->fresh(),
        ]);
    }

    public function destroy(Request $request, Permission $permission): JsonResponse
    {
        abort_unless($request->user()?->hasRole('superadmin') && $request->user()?->can('admin.permissions.delete'), 403);

        $permission->delete();

        return response()->json([
            'message' => 'Permission berhasil dihapus.',
        ]);
    }
}
