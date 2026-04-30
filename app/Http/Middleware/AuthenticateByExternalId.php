<?php

namespace App\Http\Middleware;

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
        $externalId = $request->query('userid', $request->query('user_id'));

        if (! is_string($externalId) || $externalId === '') {
            return $this->unauthorizedResponse(
                $request,
                'Parameter user_id wajib diisi.',
                'Tambahkan query seperti /dashboard?user_id=irvan.m untuk membuka aplikasi.',
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

        Auth::setUser($user);
        $request->setUserResolver(static fn (): User => $user);

        return $next($request);
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
