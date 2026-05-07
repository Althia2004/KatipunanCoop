<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SuperadminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || !in_array($user->role, ['superadmin', 'admin'])) {
            if ($user) {
                return redirect()->route($user->dashboardRouteName());
            }

            return redirect()->route('home');
        }

        return $next($request);
    }
}
