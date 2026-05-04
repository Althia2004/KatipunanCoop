<?php

use App\Models\LoanRequest;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (! Schema::hasTable('loan_requests') || ! Schema::hasTable('loans')) {
            return;
        }

        DB::transaction(function (): void {
            foreach (LoanRequest::where('status', LoanRequest::STATUS_APPROVED)
                ->whereDoesntHave('loan')
                ->cursor() as $loanRequest) {
                $loanRequest->createLoanFromRequest();
            }
        });
    }

    public function down(): void
    {
        if (! Schema::hasTable('loan_requests') || ! Schema::hasTable('loans')) {
            return;
        }

        DB::transaction(function (): void {
            DB::table('loans')
                ->whereIn('loan_request_id', function ($query) {
                    $query->select('id')
                        ->from('loan_requests')
                        ->where('status', LoanRequest::STATUS_APPROVED);
                })
                ->delete();
        });
    }
};
