<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class RedirectIfAuthenticated
{
    public function handle(Request $request, Closure $next, string ...$guards): Response
    {
        $guards = empty($guards) ? [null] : $guards;

        foreach ($guards as $guard) {
            if (Auth::guard($guard)->check()) {
                $user = Auth::guard($guard)->user();

                // Redirect based on role — no route() calls
                $redirect = match($user->role) {
                    'superadmin' => '/superadmin/dashboard',
                    'admin'      => $this->getAdminDashboard($user),
                    'manager'    => '/manager/dashboard',
                    'bookkeeper' => '/bookkeeper/dashboard',
                    'hr'         => '/hr/dashboard',
                    'board'      => '/board/dashboard',
                    'member'     => '/member/dashboard',
                    default      => '/superadmin/dashboard',
                };

                return redirect($redirect);
            }
        }

        return $next($request);
    }

    private function getAdminDashboard($user): string
    {
        $team = $user->currentTeam ?? $user->personalTeam();
        if ($team) {
            return '/' . $team->slug . '/dashboard';
        }
        // Find ANY team this user belongs to
        $anyTeam = $user->teams()->first();
        if ($anyTeam) {
            $user->update(['current_team_id' => $anyTeam->id]);
            return '/' . $anyTeam->slug . '/dashboard';
        }
        // Last resort — never redirect back to /login when already authenticated
        return '/superadmin/dashboard';
    }
}
