<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\SaveUserRequest;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::query()
            ->with('department:id,name')
            ->orderByDesc('id')
            ->paginate(20);

        return response()->json($users);
    }

    public function store(SaveUserRequest $request): JsonResponse
    {
        $user = User::query()->create($request->validated());

        return response()->json([
            'message' => 'User berhasil dibuat.',
            'data' => $user,
        ], 201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json([
            'data' => $user->load('department:id,name'),
        ]);
    }

    public function update(SaveUserRequest $request, User $user): JsonResponse
    {
        $user->update($request->validated());

        return response()->json([
            'message' => 'User berhasil diperbarui.',
            'data' => $user->fresh()->load('department:id,name'),
        ]);
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json([
            'message' => 'User berhasil dihapus.',
        ]);
    }
}
