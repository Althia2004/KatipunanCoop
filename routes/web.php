<?php

use App\Http\Controllers\SeminarController;
use App\Http\Controllers\AnnualReportsController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
    'canResetPassword' => Features::enabled(Features::resetPasswords()),
])->name('home');

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::inertia('dashboard', 'dashboard')->name('dashboard');
    });

Route::middleware(['auth'])->group(function () {
    Route::get('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])
        ->name('invitations.accept');

    Route::get('/reports/annual', [AnnualReportsController::class, 'index'])
        ->name('annual-reports.index');

    Route::inertia('/loan/member-registration', 'Loan/MemberRegistration')
        ->name('loan.member-registration');

    Route::get('/loan/seminar-tracking', [SeminarController::class, 'index'])
        ->name('loan.seminar-tracking');

    Route::get('/loan/seminar-tracking/create', [SeminarController::class, 'create'])
        ->name('loan.seminar-tracking.create');

    Route::post('loan/seminar-tracking', [SeminarController::class, 'store'])
        ->name('loan.seminar-tracking.store');

    Route::inertia('/loan/management', 'Loan/Management')
        ->name('loan.management');

    Route::inertia('/user/member-management', 'User/MemberManagement')
        ->name('user.member-management');

    Route::inertia('/user/amortization', 'User/Amortization')
        ->name('user.amortization');

    Route::inertia('/user/savings-interest', 'User/SavingsInterest')
        ->name('user.savings-interest');

    Route::inertia('/user/dividend-reports', 'User/DividendReports')
        ->name('user.dividend-reports');
});

require __DIR__.'/settings.php';