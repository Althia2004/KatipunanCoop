<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class MemberAuthController extends Controller
{
    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email'    => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        // Attempt authentication
        if (Auth::attempt($credentials, false)) {
            $user = Auth::user();

            // Only allow users with the 'member' role
            if ($user->role !== 'member') {
                Auth::logout();

                return back()->withErrors([
                    'auth' => 'Invalid credentials. Please contact staff if you need help.',
                ])->onlyInput('email');
            }

            $request->session()->regenerate();

            return redirect()->intended(route('member.dashboard'));
        }

        return back()->withErrors([
            'auth' => 'Invalid credentials. Please contact staff if you need help.',
        ])->onlyInput('email');
    }

    public function logout(Request $request)
    {
        Auth::logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('home');
    }

    public function dashboard(Request $request)
    {
        return inertia('member/dashboard', [
            'user' => [
                'name'  => $request->user()->name,
                'email' => $request->user()->email,
            ],
        ]);
    }
}
