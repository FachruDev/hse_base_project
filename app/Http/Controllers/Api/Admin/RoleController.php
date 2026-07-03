<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveRoleRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('admin.roles.view'), 403);

        $roles = Role::query()
            ->with('permissions:id,name,guard_name')
            ->orderBy('name')
            ->paginate(20);

        return response()->json($roles);
    }

    public function store(SaveRoleRequest $request): JsonResponse
    {
        abort_unless($request->user()?->can('admin.roles.create'), 403);

        $validated = $request->validated();

        $role = Role::query()->create([
            'name' => $validated['name'],
            'guard_name' => $validated['guard_name'] ?? 'web',
        ]);

        if (array_key_exists('permissions', $validated)) {
            $role->syncPermissions($validated['permissions']);
        }

        return response()->json([
            'message' => 'Role berhasil dibuat.',
            'data' => $role->load('permissions:id,name,guard_name'),
        ], 201);
    }

    public function show(Request $request, Role $role): JsonResponse
    {
        abort_unless($request->user()?->can('admin.roles.view'), 403);

        return response()->json([
            'data' => $role->load('permissions:id,name,guard_name'),
        ]);
    }

    public function update(SaveRoleRequest $request, Role $role): JsonResponse
    {
        abort_unless($request->user()?->can('admin.roles.update'), 403);

        $validated = $request->validated();

        $role->update([
            'name' => $validated['name'],
            'guard_name' => $validated['guard_name'] ?? $role->guard_name,
        ]);

        if (array_key_exists('permissions', $validated)) {
            $role->syncPermissions($validated['permissions']);
        }

        return response()->json([
            'message' => 'Role berhasil diperbarui.',
            'data' => $role->fresh()->load('permissions:id,name,guard_name'),
        ]);
    }

    public function destroy(Request $request, Role $role): JsonResponse
    {
        abort_unless($request->user()?->can('admin.roles.delete'), 403);

        $role->delete();

        return response()->json([
            'message' => 'Role berhasil dihapus.',
        ]);
    }
}
