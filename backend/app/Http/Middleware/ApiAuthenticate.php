<?php

namespace App\Http\Middleware;

use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApiAuthenticate
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();

        if (! $token) {
            return response()->json(['message' => 'Authentication token is required.'], 401);
        }

        $user = User::where('api_token_hash', hash('sha256', $token))
            ->where('is_active', true)
            ->first();

        if (! $user) {
            return response()->json(['message' => 'Invalid or expired token.'], 401);
        }

        Auth::setUser($user);

        return $next($request);
    }
}
