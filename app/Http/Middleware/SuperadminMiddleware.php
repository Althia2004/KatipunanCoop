<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SuperadminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        if (!auth()->check()) {
            return redirect('/login');
        }

        $user = auth()->user();

        if ($user->role !== 'superadmin') {
            if ($user->role === 'admin') {
                $team = $user->currentTeam ?? $user->personalTeam();
                if ($team) {
                    return redirect('/' . $team->slug . '/dashboard');
                }
                return redirect('/login');
            }

            return match($user->role) {
                'member'     => redirect('/member/dashboard'),
                'manager'    => redirect('/manager/dashboard'),
                'bookkeeper' => redirect('/bookkeeper/dashboard'),
                'hr'         => redirect('/hr/dashboard'),
                'board'      => redirect('/board/dashboard'),
                default      => redirect('/login'),
            };
        }

        return $next($request);
    }
}