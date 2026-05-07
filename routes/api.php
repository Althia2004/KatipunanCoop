<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PaymentController;

Route::middleware(['auth'])->group(function () {
    // Payment endpoints
    Route::post('/payments/create-intent', [PaymentController::class, 'createPaymentIntent'])->name('payments.create-intent');
    Route::post('/payments/verify', [PaymentController::class, 'verifyPayment'])->name('payments.verify');
    Route::get('/payments/{paymentIntentId}/status', [PaymentController::class, 'getPaymentStatus'])->name('payments.status');
    Route::get('/payments/methods', [PaymentController::class, 'getPaymentMethods'])->name('payments.methods');
    Route::post('/payments/{paymentIntentId}/cancel', [PaymentController::class, 'cancelPayment'])->name('payments.cancel');
});
