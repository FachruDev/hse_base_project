<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveUserRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()?->can('admin.users.view'), 403);

        $users = User::query()
            ->with('department:id,name')
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json($users);
    }

    public function store(SaveUserRequest $request): JsonResponse
    {
        abort_unless($request->user()?->can('admin.users.create'), 403);

        $user = User::query()->create($this->userPayload($request));

        return response()->json([
            'message' => 'User berhasil dibuat.',
            'data' => $user,
        ], 201);
    }

    public function show(Request $request, User $user): JsonResponse
    {
        abort_unless($request->user()?->can('admin.users.view'), 403);

        return response()->json([
            'data' => $user->load('department:id,name'),
        ]);
    }

    public function update(SaveUserRequest $request, User $user): JsonResponse
    {
        abort_unless($request->user()?->can('admin.users.update'), 403);

        $user->update($this->userPayload($request));

        return response()->json([
            'message' => 'User berhasil diperbarui.',
            'data' => $user->fresh()->load('department:id,name'),
        ]);
    }

    public function destroy(Request $request, User $user): JsonResponse
    {
        abort_unless($request->user()?->can('admin.users.delete'), 403);

        $user->delete();

        return response()->json([
            'message' => 'User berhasil dihapus.',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function userPayload(SaveUserRequest $request): array
    {
        $payload = $request->validated();

        if (($payload['password'] ?? null) === null || $payload['password'] === '') {
            unset($payload['password']);
        }

        return $payload;
    }
}
