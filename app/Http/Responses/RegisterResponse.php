<?php

namespace App\Http\Responses;

use Illuminate\Http\JsonResponse;
use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;
use Symfony\Component\HttpFoundation\Response;

class RegisterResponse implements RegisterResponseContract
{
    public function toResponse($request): Response
    {
        $user = $request->user();

        if (!$user) {
            abort(403);
        }

        if ($request->wantsJson()) {
            return new JsonResponse(['two_factor' => false], 201);
        }

        $redirect = match($user->role) {
            'superadmin' => '/superadmin/dashboard',
            'admin'      => '/admin/dashboard',
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