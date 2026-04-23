<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\URL;
use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;
use Symfony\Component\HttpFoundation\Response;

class LoginResponse implements LoginResponseContract
{
    public function toResponse($request): Response
    {
        $user = $request->user();

        if (! $user) {
            abort(403);
        }

        $routeName = $user->dashboardRouteName();
        $parameters = [];

        if ($routeName === 'dashboard') {
            $team = $user->currentTeam ?? $user->personalTeam();

            if (! $team) {
                abort(403);
            }

            URL::defaults(['current_team' => $team->slug]);
            $parameters = ['current_team' => $team->slug];
        }

        return $request->wantsJson()
            ? new JsonResponse(['two_factor' => false], 200)
            : redirect()->intended(route($routeName, $parameters));
    }
}
