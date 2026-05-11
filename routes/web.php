<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LoanManagementController;
use App\Http\Controllers\LoanRequestController;
use App\Http\Controllers\SeminarController;
use App\Http\Controllers\AnnualReportsController;
use App\Http\Controllers\BeneficiaryController;
use App\Http\Controllers\MemberRegistrationController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\MemberAuthController;
use App\Http\Controllers\MemberPortalController;
use App\Http\Controllers\AdminController;
use App\Http\Controllers\SuperadminController;
use App\Http\Controllers\Teams\TeamInvitationController;
use App\Http\Middleware\EnsureTeamMembership;
use Illuminate\Support\Facades\Route;
use Laravel\Fortify\Features;

Route::get('/', function () {
    return inertia('welcome', [
        'canRegister'      => Features::enabled(Features::registration()),
        'canResetPassword' => Features::enabled(Features::resetPasswords()),
        'announcements'    => \App\Models\Announcement::where('status', 'published')
            ->latest('announcement_date')
            ->take(3)
            ->get()
            ->map(fn ($a) => [
                'id'       => $a->id,
                'date'     => $a->announcement_date->format('F d, Y'),
                'title'    => $a->title,
                'desc'     => $a->content,
                'category' => $a->category,
            ]),
    ]);
})->name('home');

// ── Member Auth (guest) — MUST be before {current_team} wildcard ──
Route::get('/member/login', fn () => inertia('member/login'))->name('member.login');
Route::post('/member/login', [MemberAuthController::class, 'login'])->name('member.login.post');
Route::post('/member/logout', [MemberAuthController::class, 'logout'])->name('member.logout');

// ── Member Portal (protected) — MUST be before {current_team} wildcard ──
Route::prefix('member')
    ->middleware(['auth', 'member'])
    ->group(function () {
        Route::get('/dashboard',     [MemberPortalController::class, 'dashboard'])->name('member.dashboard');
        Route::get('/loans',         [MemberPortalController::class, 'loans'])->name('member.loans');
        Route::post('/loan-requests/store', [MemberPortalController::class, 'storeLoanRequest'])->name('member.loan-requests.store');
        Route::get('/payments',      [MemberPortalController::class, 'payments'])->name('member.payments');
        Route::post('/payments',     [MemberPortalController::class, 'storePayment'])->name('member.payments.store');
        Route::get('/savings',       [MemberPortalController::class, 'savings'])->name('member.savings');
        Route::post('/savings/deposit',  [MemberPortalController::class, 'savingsDeposit'])->name('member.savings.deposit');
        Route::post('/savings/withdraw', [MemberPortalController::class, 'savingsWithdraw'])->name('member.savings.withdraw');
        Route::get('/profile',       [MemberPortalController::class, 'profile'])->name('member.profile');
        Route::get('/announcements', [MemberPortalController::class, 'announcements'])->name('member.announcements');
        Route::get('/dividends',     [MemberPortalController::class, 'dividends'])->name('member.dividends');
        Route::get('/settings',      [MemberPortalController::class, 'settings'])->name('member.settings');
        Route::put('/settings/password', [MemberPortalController::class, 'updatePassword'])->name('member.settings.password');
        Route::put('/settings/contact',  [MemberPortalController::class, 'updateContact'])->name('member.settings.contact');
    });

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
        Route::post('/members/{member}/recalculate-migs', [SuperadminController::class, 'recalculateMigs'])->name('superadmin.members.recalculate-migs');
        Route::post('/members/recalculate-all-migs', [SuperadminController::class, 'recalculateAllMigs'])->name('superadmin.members.recalculate-all-migs');
        Route::get('/loans', [SuperadminController::class, 'loans'])->name('superadmin.loans');
        Route::get('/loans/{loan}', [SuperadminController::class, 'showLoan'])->name('superadmin.loans.show');
        Route::put('/loans/{loan}', [SuperadminController::class, 'updateLoan'])->name('superadmin.loans.update');
        Route::delete('/loans/{loan}', [SuperadminController::class, 'deleteLoan'])->name('superadmin.loans.delete');

        // BOD Loan Request Approval
        Route::get('/loan-requests', [SuperadminController::class, 'loanRequests'])->name('superadmin.loan-requests');
        Route::post('/loan-requests/{loanRequest}/approve', [SuperadminController::class, 'approveLoanRequest'])->name('superadmin.loan-requests.approve');
        Route::post('/loan-requests/{loanRequest}/reject',  [SuperadminController::class, 'rejectLoanRequest'])->name('superadmin.loan-requests.reject');

        Route::inertia('/pending-approvals', 'Superadmin/PendingApprovals/PendingApprovalsPanel')
            ->name('superadmin.pending-approvals');

        // Announcements
        Route::get('/announcements', [SuperadminController::class, 'announcements'])->name('superadmin.announcements');
        Route::post('/announcements', [SuperadminController::class, 'storeAnnouncement'])->name('superadmin.announcements.store');
        Route::put('/announcements/{announcement}', [SuperadminController::class, 'updateAnnouncement'])->name('superadmin.announcements.update');
        Route::delete('/announcements/{announcement}', [SuperadminController::class, 'deleteAnnouncement'])->name('superadmin.announcements.delete');
        Route::patch('/announcements/{announcement}/toggle', [SuperadminController::class, 'toggleAnnouncement'])->name('superadmin.announcements.toggle');

        // Copra Sales
        Route::get('/copra-sales', [SuperadminController::class, 'coproSales'])->name('superadmin.copra-sales');
        Route::post('/copra-sales/{member}', [SuperadminController::class, 'storeCoproSale'])->name('superadmin.copra-sales.store');
        Route::delete('/copra-sales/{copraSale}', [SuperadminController::class, 'deleteCoproSale'])->name('superadmin.copra-sales.delete');

        // Savings & Capital
        Route::get('/savings', [SuperadminController::class, 'savingsOverview'])->name('superadmin.savings');
        Route::post('/savings/{member}/deposit', [SuperadminController::class, 'savingsDeposit'])->name('superadmin.savings.deposit');
        Route::post('/savings/{member}/withdraw', [SuperadminController::class, 'savingsWithdraw'])->name('superadmin.savings.withdraw');
        Route::post('/savings/{member}/capital-adjust', [SuperadminController::class, 'capitalAdjust'])->name('superadmin.savings.capital-adjust');
        Route::get('/savings/{member}/history', [SuperadminController::class, 'savingsHistory'])->name('superadmin.savings.history');

        // Superadmin Payment Dashboard
        Route::get('/payments', [SuperadminController::class, 'payments'])->name('superadmin.payments');
        Route::post('/payments/capital-share', [SuperadminController::class, 'recordCapitalSharePayment'])->name('superadmin.payments.capital-share');
        Route::post('/payments', [SuperadminController::class, 'recordPayment'])->name('superadmin.payments.store');
        Route::put('/payments/{payment}', [SuperadminController::class, 'updatePayment'])->name('superadmin.payments.update');
        Route::get('/payments/{id}/receipt', [SuperadminController::class, 'downloadReceipt'])->name('superadmin.payments.receipt');
    });

// ── Role-based dashboard redirects ──
Route::middleware(['auth'])->group(function () {
    Route::get('/admin/dashboard', function () {
        $user = auth()->user();
        if (!$user) return redirect('/login');
        $team = $user->currentTeam ?? $user->personalTeam();
        if (!$team) {
            $team = $user->teams()->first();
            if ($team) $user->update(['current_team_id' => $team->id]);
        }
        if ($team) return redirect('/' . $team->slug . '/dashboard');
        return redirect('/login');
    })->name('admin.dashboard');

    Route::inertia('/manager/dashboard',    'ComingSoon', ['page' => 'Manager Dashboard'])->name('manager.dashboard');
    Route::inertia('/board/dashboard',      'ComingSoon', ['page' => 'Board of Directors Dashboard'])->name('board.dashboard');
    Route::inertia('/bookkeeper/dashboard', 'ComingSoon', ['page' => 'Bookkeeper Dashboard'])->name('bookkeeper.dashboard');
    Route::inertia('/hr/dashboard',         'ComingSoon', ['page' => 'HR Manager Dashboard'])->name('hr.dashboard');
});

// ── Team-based Admin Dashboard — MUST be AFTER all specific routes ──
Route::prefix('{current_team}')
    ->middleware(['auth', 'verified', EnsureTeamMembership::class])
    ->group(function () {
        Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');
    });

// ── Auth protected routes ──
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

    // Loan Request Actions (Admin)
    Route::post('/loan/loan-requests/store',                  [LoanRequestController::class, 'store'])->name('loan-requests.store');
    Route::post('/loan/loan-requests/{loanRequest}/approve',  [LoanRequestController::class, 'approve'])->name('loan-requests.approve');
    Route::post('/loan/loan-requests/{loanRequest}/reject',   [LoanRequestController::class, 'reject'])->name('loan-requests.reject');
    Route::post('/loan/loan-requests/{loanRequest}/escalate', [LoanRequestController::class, 'escalate'])->name('loan-requests.escalate');
    Route::get('/loan/loan-requests/eligibility/{member}',    [LoanRequestController::class, 'checkEligibility'])->name('loan-requests.eligibility');

    Route::patch('/loan/request/{loanRequest}/approve', [LoanManagementController::class, 'approve'])
        ->name('loan.request.approve');
        
    Route::patch('/loan/request/{loanRequest}/reject', [LoanManagementController::class, 'reject'])
        ->name('loan.request.reject');

    Route::get('/loan/active', [LoanManagementController::class, 'active'])
        ->name('loan.active');
    Route::post('/loan/request', [LoanManagementController::class, 'store'])
        ->name('loan.request.store');
    

    // Member Registration
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

    // Beneficiaries
    Route::post('/loan/member-registration/{memberRegistration}/beneficiaries', [BeneficiaryController::class, 'store'])
        ->name('loan.member-registration.beneficiaries.store');
    Route::patch('/loan/member-registration/{memberRegistration}/beneficiaries/{beneficiary}', [BeneficiaryController::class, 'update'])
        ->name('loan.member-registration.beneficiaries.update');
    Route::delete('/loan/member-registration/{memberRegistration}/beneficiaries/{beneficiary}', [BeneficiaryController::class, 'destroy'])
        ->name('loan.member-registration.beneficiaries.destroy');

    // Member Management
    Route::get('/user/member-management', [MemberController::class, 'memberManagement'])
        ->name('user.member-management');
    Route::patch('/user/member-management/{member}', [MemberController::class, 'updateMember'])
        ->name('user.member-management.update');
    Route::patch('/user/member-management/{member}/toggle-status', [MemberController::class, 'toggleStatus'])
        ->name('user.member-management.toggle-status');
    Route::patch('/user/member-management/{member}/request-deletion', [MemberController::class, 'requestDeletion'])
        ->name('user.member-management.request-deletion');

    Route::get('/member/capital-shares', [App\Http\Controllers\ShareAccountController::class, 'index'])
        ->name('member.shares');

    Route::post('/member/capital-shares', [App\Http\Controllers\ShareAccountController::class, 'store'])
        ->name('member.shares.store');
    
    #Route::inertia('/user/amortization', 'User/Amortization')
    // Amortization
    Route::get('/user/amortization', [MemberController::class, 'amortization'])
        ->name('user.amortization');
    Route::get('/user/amortization/download', [MemberController::class, 'downloadAmortization'])
        ->name('user.amortization.download');

    // Savings Interest
    Route::get('/user/savings-interest', [MemberController::class, 'savingsInterest'])
        ->name('user.savings-interest');
    Route::get('/user/savings-interest/download', [MemberController::class, 'downloadSavingsInterest'])
        ->name('user.savings-interest.download');

    // Dividend Reports
    Route::get('/user/dividend-reports', [MemberController::class, 'dividendReports'])
        ->name('user.dividend-reports');
    Route::get('/user/dividend-reports/download', [MemberController::class, 'downloadDividendReports'])
        ->name('user.dividend-reports.download');

    // Patronage Reports
    Route::get('/user/patronage-reports', [MemberController::class, 'patronageReports'])
        ->name('user.patronage-reports');
    Route::post('/user/patronage-reports/request-release', [MemberController::class, 'requestPatronageRelease'])
        ->name('user.patronage-reports.request-release');
    Route::get('/user/patronage-reports/download', [MemberController::class, 'downloadPatronage'])
        ->name('user.patronage-reports.download');

    // ── Unified Payment Dashboard (Admin/Staff) ──
    Route::get('/user/payments', [LoanManagementController::class, 'paymentDashboard'])
        ->name('payments.index');
    Route::post('/user/payments', [LoanManagementController::class, 'storePayment'])
        ->name('payments.store');
    Route::post('/user/payments/capital-share', [LoanManagementController::class, 'storeCapitalShare'])
        ->name('payments.capital-share');
    Route::put('/user/payments/{payment}', [LoanManagementController::class, 'updatePayment'])
        ->name('payments.update');
    Route::get('/user/payments/{payment}/receipt', [LoanManagementController::class, 'downloadReceipt'])
        ->name('payments.receipt');
});

// API Routes
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