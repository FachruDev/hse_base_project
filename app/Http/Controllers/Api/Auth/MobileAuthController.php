<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\MobileLoginRequest;
use App\Models\MobileApiToken;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class MobileAuthController extends Controller
{
    public function login(MobileLoginRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $login = trim((string) $validated['login']);

        $user = User::query()
            ->with('department:id,name')
            ->where(function ($query) use ($login): void {
                $query
                    ->where('external_id', $login)
                    ->orWhere('email', $login);
            })
            ->where('is_active', true)
            ->first();

        if (! $user instanceof User || ! is_string($user->password) || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Login atau password tidak sesuai, atau user tidak aktif.',
            ], Response::HTTP_UNAUTHORIZED);
        }

        $plainToken = Str::random(80);
        $token = $user->mobileApiTokens()->create([
            'name' => $validated['device_name'] ?? 'mobile',
            'token_hash' => hash('sha256', $plainToken),
        ]);

        return response()->json([
            'message' => 'Login berhasil.',
            'data' => [
                'token_type' => 'Bearer',
                'access_token' => $plainToken,
                'expires_at' => $token->expires_at,
                'user' => $this->userPayload($user),
            ],
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $this->authenticatedUser($request)->load('department:id,name');

        return response()->json([
            'data' => [
                'user' => $this->userPayload($user),
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->attributes->get('mobile_api_token');

        if (! $token instanceof MobileApiToken) {
            return response()->json([
                'message' => 'Logout mobile membutuhkan Authorization: Bearer token.',
            ], Response::HTTP_BAD_REQUEST);
        }

        $token->delete();

        return response()->json([
            'message' => 'Logout berhasil.',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'user_id' => $user->external_id,
            'email' => $user->email,
            'name' => $user->name,
            'department' => $user->department === null ? null : [
                'id' => $user->department->id,
                'name' => $user->department->name,
            ],
            'roles' => $user->getRoleNames()->values()->all(),
            'permissions' => $user->getAllPermissions()->pluck('name')->values()->all(),
        ];
    }

    private function authenticatedUser(Request $request): User
    {
        $user = $request->user();

        if (! $user instanceof User) {
            abort(Response::HTTP_UNAUTHORIZED, 'User tidak terautentikasi.');
        }

        return $user;
    }
}
