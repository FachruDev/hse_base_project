<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
            return response()->json([
                'message' => 'Parameter userid wajib diisi.',
            ], 401);
        }

        $user = User::query()
            ->where('external_id', $externalId)
            ->where('is_active', true)
            ->first();

        if ($user === null) {
            return response()->json([
                'message' => 'User tidak ditemukan atau tidak aktif.',
            ], 401);
        }

        Auth::setUser($user);
        $request->setUserResolver(static fn (): User => $user);

        return $next($request);
    }
}
