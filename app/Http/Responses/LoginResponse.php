<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Symfony\Component\HttpFoundation\Response;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(403);
        }

        if ($request->wantsJson()) {
            return new JsonResponse(['two_factor' => false], 200);
        }

        // Admin uses team-based dashboard
        if ($user->role === 'admin') {
            $team = $user->currentTeam ?? $user->personalTeam();
            if (!$team) {
                $team = $user->teams()->first();
                if ($team) {
                    $user->update(['current_team_id' => $team->id]);
                }
            }
            if ($team) {
                return redirect('/' . $team->slug . '/dashboard');
            }
            // No team at all — safe fallback
            return redirect('/superadmin/dashboard');
        }

        $redirect = match($user->role) {
            'superadmin' => '/superadmin/dashboard',
            'manager'    => '/manager/dashboard',
            'bookkeeper' => '/bookkeeper/dashboard',
            'hr'         => '/hr/dashboard',
            'board'      => '/board/dashboard',
            'member'     => '/member/dashboard',
            default      => '/login',
        };

        return redirect()->intended($redirect);
    }
}