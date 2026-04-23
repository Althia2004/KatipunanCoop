<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LoanManagementController;
use App\Http\Controllers\SeminarController;
use App\Http\Controllers\AnnualReportsController;
use App\Http\Controllers\BeneficiaryController;
use App\Http\Controllers\MemberRegistrationController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
    'canResetPassword' => Features::enabled(Features::resetPasswords()),
])->name('home');

// ── Coming-Soon role-based dashboard placeholders ──
Route::middleware(['auth'])->group(function () {
    Route::inertia('/member/dashboard',     'ComingSoon', ['page' => 'Member Dashboard'])->name('member.dashboard');
    Route::inertia('/admin/dashboard',      'ComingSoon', ['page' => 'Admin Dashboard'])->name('admin.dashboard');
    Route::inertia('/superadmin/dashboard', 'ComingSoon', ['page' => 'Superadmin Dashboard'])->name('superadmin.dashboard');
    Route::inertia('/manager/dashboard',    'ComingSoon', ['page' => 'Manager Dashboard'])->name('manager.dashboard');
    Route::inertia('/board/dashboard',      'ComingSoon', ['page' => 'Board of Directors Dashboard'])->name('board.dashboard');
    Route::inertia('/bookkeeper/dashboard', 'ComingSoon', ['page' => 'Bookkeeper Dashboard'])->name('bookkeeper.dashboard');
    Route::inertia('/hr/dashboard',         'ComingSoon', ['page' => 'HR Manager Dashboard'])->name('hr.dashboard');
});

Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    });

Route::middleware(['auth'])->group(function () {
    Route::get('invitations/{invitation}/accept', [TeamInvitationController::class, 'accept'])
        ->name('invitations.accept');

    Route::get('/reports/annual', [AnnualReportsController::class, 'index'])
        ->name('annual-reports.index');
    Route::get('/reports/annual/{id}', [AnnualReportsController::class, 'show'])
        ->name('annual-reports.show');
    Route::patch('/reports/annual/{id}/pin', [AnnualReportsController::class, 'pin'])
        ->name('annual-reports.pin');

    Route::get('/loan/seminar-tracking', [SeminarController::class, 'index'])
        ->name('loan.seminar-tracking');

    Route::get('/loan/seminar-tracking/create', [SeminarController::class, 'create'])
        ->name('loan.seminar-tracking.create');

    Route::post('loan/seminar-tracking', [SeminarController::class, 'store'])
        ->name('loan.seminar-tracking.store');

    Route::get('/loan/management', [LoanManagementController::class, 'index'])
        ->name('loan.management');

    // --- Member Registration ---
    Route::get('/loan/member-registration', [MemberRegistrationController::class, 'index'])
        ->name('loan.member-registration');
    Route::get('/loan/member-registration/create', [MemberRegistrationController::class, 'create'])
        ->name('loan.member-registration.create');
    Route::post('/loan/member-registration', [MemberRegistrationController::class, 'store'])
        ->name('loan.member-registration.store');
    Route::get('/loan/member-registration/{memberRegistration}', [MemberRegistrationController::class, 'show'])
        ->name('loan.member-registration.show');
    Route::patch('/loan/member-registration/{memberRegistration}/assign-seminar', [MemberRegistrationController::class, 'assignSeminar'])
        ->name('loan.member-registration.assign-seminar');
    Route::patch('/loan/member-registration/{memberRegistration}/confirm-attendance', [MemberRegistrationController::class, 'confirmAttendance'])
        ->name('loan.member-registration.confirm-attendance');
    Route::patch('/loan/member-registration/{memberRegistration}/endorse-to-bod', [MemberRegistrationController::class, 'endorseToBod'])
        ->name('loan.member-registration.endorse-to-bod');

    // --- Beneficiaries (staff only) ---
    Route::post('/loan/member-registration/{memberRegistration}/beneficiaries', [BeneficiaryController::class, 'store'])
        ->name('loan.member-registration.beneficiaries.store');
    Route::patch('/loan/member-registration/{memberRegistration}/beneficiaries/{beneficiary}', [BeneficiaryController::class, 'update'])
        ->name('loan.member-registration.beneficiaries.update');
    Route::delete('/loan/member-registration/{memberRegistration}/beneficiaries/{beneficiary}', [BeneficiaryController::class, 'destroy'])
        ->name('loan.member-registration.beneficiaries.destroy');

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