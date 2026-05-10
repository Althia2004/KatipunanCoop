<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Response;

class ShareAccountController extends Controller
{
    public function index(): Response
    {
        $user = Auth::user();
        
        $account = $user->shareAccount()->with('transactions')->firstOrCreate([
            'user_id' => $user->id
        ]);

        return Inertia::render('User/CapitalShares', [
            'account' => $account,
            'transactions' => $account->transactions,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'amount' => 'required|numeric|min:100', // Min ₱100.00
            'reference_number' => 'required|string|max:50',
            'remarks' => 'nullable|string|max:255',
        ]);

        $user = Auth::user();
        $account = $user->shareAccount;

        // Convert PHP to Centavos
        $amountInCentavos = (int) ($request->amount * 100);

        DB::transaction(function () use ($account, $amountInCentavos, $request) {
            $account->transactions()->create([
                'type' => 'deposit',
                'amount' => $amountInCentavos,
                'reference_number' => $request->reference_number,
                'remarks' => $request->remarks,
                'processed_at' => now(),
            ]);

            $account->increment('paid_up_balance', $amountInCentavos);
        });

        return redirect()->back()->with('success', 'Capital share deposit recorded successfully.');
    }

}