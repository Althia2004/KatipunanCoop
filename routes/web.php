<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LoanManagementController;
use App\Http\Controllers\SeminarController;
use App\Http\Controllers\AnnualReportsController;
use App\Http\Controllers\BeneficiaryController;
use App\Http\Controllers\MemberRegistrationController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\MemberAuthController;
use App\Http\Controllers\SuperadminController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::inertia('/', 'welcome', [
    'canRegister' => Features::enabled(Features::registration()),
    'canResetPassword' => Features::enabled(Features::resetPasswords()),
])->name('home');

// ── Superadmin ──
Route::prefix('superadmin')
    ->middleware(['auth', 'superadmin'])
    ->group(function () {
        Route::get('/dashboard', [SuperadminController::class, 'dashboard'])->name('superadmin.dashboard');
        Route::get('/staff', [SuperadminController::class, 'staff'])->name('superadmin.staff');
        Route::post('/staff', [SuperadminController::class, 'storeStaff'])->name('superadmin.staff.store');
        Route::put('/staff/{user}', [SuperadminController::class, 'updateStaff'])->name('superadmin.staff.update');
        Route::delete('/staff/{user}', [SuperadminController::class, 'destroyStaff'])->name('superadmin.staff.destroy');
        Route::get('/approvals', [SuperadminController::class, 'approvals'])->name('superadmin.approvals');
        Route::patch('/approvals/registration/{memberRegistration}/approve', [SuperadminController::class, 'approveRegistration'])->name('superadmin.approvals.registration.approve');
        Route::patch('/approvals/registration/{memberRegistration}/reject', [SuperadminController::class, 'rejectRegistration'])->name('superadmin.approvals.registration.reject');
        Route::patch('/approvals/member/{member}/approve-deletion', [SuperadminController::class, 'approveDeletion'])->name('superadmin.approvals.member.approve-deletion');
        Route::patch('/approvals/member/{member}/reject-deletion', [SuperadminController::class, 'rejectDeletion'])->name('superadmin.approvals.member.reject-deletion');
        Route::get('/settings/interest', [SuperadminController::class, 'settings'])->name('superadmin.settings');
        Route::post('/settings', [SuperadminController::class, 'updateSettings'])->name('superadmin.settings.update');
        Route::get('/audit', [SuperadminController::class, 'audit'])->name('superadmin.audit');
        Route::get('/reports/annual', [SuperadminController::class, 'annualReports'])->name('superadmin.reports.annual');
        Route::post('/reports/annual', [SuperadminController::class, 'storeAnnualReport'])->name('superadmin.reports.annual.store');
        Route::get('/reports/annual/{meeting}/download', [SuperadminController::class, 'downloadAnnualReport'])->name('superadmin.reports.annual.download');
        Route::get('/reports/financial', [SuperadminController::class, 'financialReports'])->name('superadmin.reports.financial');
        Route::get('/members', [SuperadminController::class, 'members'])->name('superadmin.members');
        Route::put('/members/{member}', [SuperadminController::class, 'updateMember'])->name('superadmin.members.update');
        Route::delete('/members/{member}', [SuperadminController::class, 'deleteMember'])->name('superadmin.members.delete');
        Route::put('/members/{member}/account', [SuperadminController::class, 'updateMemberAccount'])->name('superadmin.members.account.update');
        Route::get('/loans', [SuperadminController::class, 'loans'])->name('superadmin.loans');
        Route::inertia('/pending-approvals', 'Superadmin/PendingApprovals/PendingApprovalsPanel')
            ->name('superadmin.pending-approvals');
    });

// ── Member Portal (guest-accessible) ──
Route::get('/member/login', fn () => inertia('member/login'))->name('member.login');
Route::post('/member/login', [MemberAuthController::class, 'login'])->name('member.login.post');
Route::post('/member/logout', [MemberAuthController::class, 'logout'])->name('member.logout');

// ── Coming-Soon role-based dashboard placeholders ──
Route::middleware(['auth'])->group(function () {
    Route::get('/member/dashboard', [MemberAuthController::class, 'dashboard'])->name('member.dashboard');
    Route::inertia('/member/loan-application', 'member/LoanManagement')->name('member.loan.application');
    Route::inertia('/member/loan-tracking', 'member/LoanTracking')->name('member.loan.tracking');
    Route::inertia('/member/view-savings', 'member/ViewSavings')->name('member.view.savings');
    Route::inertia('/member/view-return-patronage', 'member/ViewPatronageRefund')->name('member.view.patronage');
    Route::inertia('/member/reports', 'member/ReportDownloads')->name('member.reports');
    Route::inertia('/admin/dashboard',      'ComingSoon', ['page' => 'Admin Dashboard'])->name('admin.dashboard');
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
    Route::patch('/reports/annual/{id}/complete', [AnnualReportsController::class, 'markCompleted'])
        ->name('annual-reports.complete');
    Route::patch('/reports/annual/{meeting}/link-seminar', [AnnualReportsController::class, 'linkSeminar'])
        ->name('annual-reports.link-seminar');

    Route::get('/loan/seminar-tracking', [SeminarController::class, 'index'])
        ->name('loan.seminar-tracking');

    Route::get('/loan/seminar-tracking/create', [SeminarController::class, 'create'])
        ->name('loan.seminar-tracking.create');

    Route::post('loan/seminar-tracking', [SeminarController::class, 'store'])
        ->name('loan.seminar-tracking.store');

    Route::get('/loan/management', [LoanManagementController::class, 'index'])
        ->name('loan.management');

    Route::patch('/loan/request/{loanRequest}/approve', [LoanManagementController::class, 'approve'])
        ->name('loan.request.approve');

    Route::get('/loan/active', [LoanManagementController::class, 'active'])
        ->name('loan.active');

    Route::post('/loan/request', [LoanManagementController::class, 'store'])
        ->name('loan.request.store');

    Route::inertia('/loan/request', 'Loan/Request')
        ->name('loan.request');

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
    Route::post('/loan/member-registration/{memberRegistration}/assign-account', [MemberRegistrationController::class, 'assignAccount'])
        ->name('loan.member-registration.assign-account');

    // --- Beneficiaries (staff only) ---
    Route::post('/loan/member-registration/{memberRegistration}/beneficiaries', [BeneficiaryController::class, 'store'])
        ->name('loan.member-registration.beneficiaries.store');
    Route::patch('/loan/member-registration/{memberRegistration}/beneficiaries/{beneficiary}', [BeneficiaryController::class, 'update'])
        ->name('loan.member-registration.beneficiaries.update');
    Route::delete('/loan/member-registration/{memberRegistration}/beneficiaries/{beneficiary}', [BeneficiaryController::class, 'destroy'])
        ->name('loan.member-registration.beneficiaries.destroy');

    Route::get('/user/member-management', [MemberController::class, 'memberManagement'])
        ->name('user.member-management');
    Route::patch('/user/member-management/{member}', [MemberController::class, 'updateMember'])
        ->name('user.member-management.update');
    Route::patch('/user/member-management/{member}/toggle-status', [MemberController::class, 'toggleStatus'])
        ->name('user.member-management.toggle-status');
    Route::patch('/user/member-management/{member}/request-deletion', [MemberController::class, 'requestDeletion'])
        ->name('user.member-management.request-deletion');

    Route::inertia('/user/amortization', 'User/Amortization')
        ->name('user.amortization');

    Route::inertia('/user/savings-interest', 'User/SavingsInterest')
        ->name('user.savings-interest');

    Route::inertia('/user/dividend-reports', 'User/DividendReports')
        ->name('user.dividend-reports');
});

// --- API Routes: Member Management ---
Route::prefix('api')->middleware(['auth'])->group(function () {
    Route::get('/members', [MemberController::class, 'index'])
        ->name('api.members.index');
    Route::get('/members/pending', [MemberController::class, 'pending'])
        ->name('api.members.pending');
    Route::post('/members', [MemberController::class, 'store'])
        ->name('api.members.store');
    Route::put('/members/{member}', [MemberController::class, 'update'])
        ->name('api.members.update');
    Route::delete('/members/{member}', [MemberController::class, 'destroy'])
        ->name('api.members.destroy');
    Route::put('/members/{member}/approve', [MemberController::class, 'approve'])
        ->name('api.members.approve');
    Route::put('/members/{member}/reject', [MemberController::class, 'reject'])
        ->name('api.members.reject');
});

require __DIR__.'/settings.php';