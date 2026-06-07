<?php

namespace App\Http\Middleware;

use App\Models\MobileApiToken;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateByExternalId
{
    /**
     * Handle an incoming request.
     *
     * @param  Closure(Request): (Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $bearerToken = $request->bearerToken();
        if (is_string($bearerToken) && $bearerToken !== '') {
            return $this->authenticateByBearerToken($request, $next, $bearerToken);
        }

        $externalId = $request->query('userid', $request->query('user_id'));

        if (! is_string($externalId) || $externalId === '') {
            return $this->unauthorizedResponse(
                $request,
                'Parameter user_id wajib diisi.',
                'Gunakan Authorization: Bearer token untuk mobile API, atau tambahkan query seperti /dashboard?user_id=irvan.m untuk akses internal.',
            );
        }

        $user = User::query()
            ->where('external_id', $externalId)
            ->where('is_active', true)
            ->first();

        if ($user === null) {
            return $this->unauthorizedResponse(
                $request,
                'User tidak ditemukan atau tidak aktif.',
                'Periksa kembali nilai user_id yang dikirim dari aplikasi induk.',
            );
        }

        $this->setAuthenticatedUser($request, $user);

        return $next($request);
    }

    /**
     * @param  Closure(Request): (Response)  $next
     */
    private function authenticateByBearerToken(Request $request, Closure $next, string $plainToken): Response
    {
        $token = MobileApiToken::query()
            ->with('user')
            ->where('token_hash', hash('sha256', $plainToken))
            ->first();

        if (! $token instanceof MobileApiToken || $token->isExpired()) {
            return $this->unauthorizedResponse(
                $request,
                'Token tidak valid atau sudah kedaluwarsa.',
                'Login ulang melalui POST /api/auth/login untuk mendapatkan token baru.',
            );
        }

        $user = $token->user;
        if (! $user instanceof User || ! $user->is_active) {
            return $this->unauthorizedResponse(
                $request,
                'User tidak ditemukan atau tidak aktif.',
                'Hubungi admin HSE untuk memastikan user masih aktif.',
            );
        }

        $token->forceFill(['last_used_at' => now()])->save();
        $request->attributes->set('mobile_api_token', $token);
        $this->setAuthenticatedUser($request, $user);

        return $next($request);
    }

    private function setAuthenticatedUser(Request $request, User $user): void
    {
        Auth::setUser($user);
        $request->setUserResolver(static fn (): User => $user);
    }

    private function unauthorizedResponse(Request $request, string $message, string $hint): Response
    {
        if ($request->is('api/*') || $request->expectsJson()) {
            return response()->json([
                'message' => $message,
                'hint' => $hint,
            ], 401);
        }

        return Inertia::render('auth/invalid-user', [
            'message' => $message,
            'hint' => $hint,
            'requested_user_id' => $request->query('userid', $request->query('user_id')),
        ])->toResponse($request)->setStatusCode(401);
    }
}
