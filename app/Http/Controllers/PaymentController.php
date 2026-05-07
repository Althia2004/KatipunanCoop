<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use App\Models\Loan;
use App\Models\LoanPayment;

class PaymentController extends Controller
{
    protected string $paymongoPkKey;
    protected string $paymongoSkKey;
    protected string $paymongoUrl = 'https://api.paymongo.com/v1';

    public function __construct()
    {
        $this->paymongoPkKey = config('services.paymongo.public_key');
        $this->paymongoSkKey = config('services.paymongo.secret_key');
    }

    /**
     * Create a payment intent for a loan payment
     */
    public function createPaymentIntent(Request $request)
    {
        $validated = $request->validate([
            'loan_id' => ['required', 'integer', 'exists:loans,id'],
            'amount' => ['required', 'numeric', 'min:100'],
            'payment_method' => ['required', 'in:gcash,bank_transfer'],
        ]);

        $loan = Loan::findOrFail($validated['loan_id']);
        $userId = Auth::id();

        // Verify user owns this loan
        if ($loan->member_id !== $userId) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        try {
            // Create payment intent via PayMongo API
            $response = Http::withBasicAuth($this->paymongoSkKey, '')
                ->post("{$this->paymongoUrl}/payment_intents", [
                    'data' => [
                        'attributes' => [
                            'amount' => (int)($validated['amount'] * 100), // Convert to cents
                            'currency' => 'PHP',
                            'payment_method_allowed' => [$validated['payment_method']],
                            'payment_method_options' => [
                                'card' => [
                                    'request_three_d_secure' => 'any',
                                ],
                            ],
                            'statement_descriptor' => 'KSCFMPC Loan Payment',
                            'metadata' => [
                                'loan_id' => $loan->id,
                                'user_id' => $userId,
                                'type' => 'loan_payment',
                            ],
                        ],
                    ],
                ]);

            if (!$response->successful()) {
                return response()->json(['error' => 'Failed to create payment intent'], 422);
            }

            $data = $response->json('data');

            return response()->json([
                'id' => $data['id'],
                'amount' => $validated['amount'],
                'currency' => 'PHP',
                'status' => $data['attributes']['status'],
                'clientKey' => $data['attributes']['client_key'],
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Payment processing error'], 500);
        }
    }

    /**
     * Verify and complete a payment
     */
    public function verifyPayment(Request $request)
    {
        $validated = $request->validate([
            'payment_intent_id' => ['required', 'string'],
            'source_id' => ['required', 'string'],
        ]);

        try {
            // Attach source to payment intent
            $response = Http::withBasicAuth($this->paymongoSkKey, '')
                ->post(
                    "{$this->paymongoUrl}/payment_intents/{$validated['payment_intent_id']}/attach",
                    [
                        'data' => [
                            'attributes' => [
                                'source' => [
                                    'id' => $validated['source_id'],
                                    'type' => 'source',
                                ],
                                'return_url' => route('member.dashboard'),
                            ],
                        ],
                    ]
                );

            if (!$response->successful()) {
                return response()->json(['success' => false, 'message' => 'Payment verification failed'], 422);
            }

            $data = $response->json('data');
            $metadata = $data['attributes']['metadata'] ?? [];

            if ($data['attributes']['status'] === 'succeeded') {
                // Create loan payment record
                if (!empty($metadata['loan_id'])) {
                    $amount = $data['attributes']['amount'] / 100; // Convert from cents
                    LoanPayment::create([
                        'loan_id' => $metadata['loan_id'],
                        'amount_paid' => $amount,
                        'payment_method' => 'paymongo',
                        'reference_number' => $validated['payment_intent_id'],
                        'status' => 'completed',
                        'paid_at' => now(),
                    ]);

                    // Update loan remaining balance
                    $loan = Loan::find($metadata['loan_id']);
                    if ($loan) {
                        $loan->remaining_balance -= $amount;
                        $loan->save();
                    }
                }

                return response()->json([
                    'success' => true,
                    'message' => 'Payment completed successfully',
                ]);
            }

            return response()->json([
                'success' => false,
                'message' => 'Payment is pending verification',
            ]);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Payment error: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Get payment status
     */
    public function getPaymentStatus(Request $request, string $paymentIntentId)
    {
        try {
            $response = Http::withBasicAuth($this->paymongoSkKey, '')
                ->get("{$this->paymongoUrl}/payment_intents/{$paymentIntentId}");

            if (!$response->successful()) {
                return response()->json(['error' => 'Payment not found'], 404);
            }

            $data = $response->json('data');

            return response()->json([
                'status' => $data['attributes']['status'],
                'amount' => $data['attributes']['amount'] / 100,
            ]);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to get payment status'], 500);
        }
    }

    /**
     * Get available payment methods
     */
    public function getPaymentMethods()
    {
        return response()->json([
            'methods' => ['gcash', 'bank_transfer'],
        ]);
    }

    /**
     * Cancel a payment
     */
    public function cancelPayment(Request $request, string $paymentIntentId)
    {
        try {
            $response = Http::withBasicAuth($this->paymongoSkKey, '')
                ->post("{$this->paymongoUrl}/payment_intents/{$paymentIntentId}/cancel");

            if ($response->successful()) {
                return response()->json(['success' => true]);
            }

            return response()->json(['success' => false, 'message' => 'Failed to cancel payment'], 422);
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Error canceling payment'], 500);
        }
    }
}
