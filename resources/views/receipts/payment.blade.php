<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Payment Receipt #{{ $payment_id }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'Segoe UI', Arial, sans-serif;
            background: #f4f4f4;
            display: flex;
            justify-content: center;
            padding: 40px 16px;
        }
        .receipt {
            background: #fff;
            width: 100%;
            max-width: 480px;
            border-radius: 12px;
            box-shadow: 0 4px 24px rgba(0,0,0,0.10);
            overflow: hidden;
        }
        .receipt-header {
            background: #2d5a27;
            color: #fff;
            text-align: center;
            padding: 28px 24px 20px;
        }
        .receipt-header h1 {
            font-size: 20px;
            font-weight: 700;
            letter-spacing: 0.5px;
        }
        .receipt-header p {
            font-size: 12px;
            opacity: 0.8;
            margin-top: 4px;
        }
        .receipt-id {
            display: inline-block;
            background: rgba(255,255,255,0.15);
            border-radius: 20px;
            padding: 4px 14px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 10px;
            letter-spacing: 1px;
        }
        .receipt-body {
            padding: 24px;
        }
        .amount-block {
            background: #f0f7ee;
            border: 1px solid #c8dfc4;
            border-radius: 10px;
            text-align: center;
            padding: 18px;
            margin-bottom: 20px;
        }
        .amount-block .label {
            font-size: 11px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .amount-block .amount {
            font-size: 36px;
            font-weight: 800;
            color: #2d5a27;
            margin-top: 4px;
        }
        .row {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            padding: 10px 0;
            border-bottom: 1px solid #f0f0f0;
            font-size: 13px;
        }
        .row:last-child { border-bottom: none; }
        .row .key {
            color: #888;
            font-weight: 500;
            min-width: 140px;
        }
        .row .val {
            color: #1a1a1a;
            font-weight: 600;
            text-align: right;
        }
        .badge {
            display: inline-block;
            padding: 2px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 700;
            text-transform: capitalize;
        }
        .badge-cash    { background: #f4f4f4; color: #444; }
        .badge-gcash   { background: #dbeafe; color: #1d4ed8; }
        .badge-maya    { background: #ede9fe; color: #6d28d9; }
        .badge-bpi     { background: #fee2e2; color: #b91c1c; }
        .badge-onsite  { background: #f0f7ee; color: #2d5a27; }
        .badge-online  { background: #dbeafe; color: #1d4ed8; }
        .receipt-footer {
            background: #fafafa;
            border-top: 1px solid #f0f0f0;
            text-align: center;
            padding: 16px 24px;
            font-size: 11px;
            color: #aaa;
        }
        @media print {
            body { background: #fff; padding: 0; }
            .receipt { box-shadow: none; border-radius: 0; max-width: 100%; }
            .print-btn { display: none; }
        }
        .print-btn {
            display: block;
            width: 100%;
            margin: 20px auto 0;
            max-width: 480px;
            padding: 12px;
            background: #2d5a27;
            color: #fff;
            border: none;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            letter-spacing: 0.5px;
        }
        .print-btn:hover { background: #234820; }
    </style>
</head>
<body>
    <div>
        <div class="receipt">
            <div class="receipt-header">
                <h1>{{ $cooperative_name }}</h1>
                <p>Official Payment Receipt</p>
                <span class="receipt-id">RECEIPT #{{ str_pad($payment_id, 6, '0', STR_PAD_LEFT) }}</span>
            </div>

            <div class="receipt-body">
                <div class="amount-block">
                    <div class="label">Amount Paid</div>
                    <div class="amount">&#8369;{{ $amount_paid }}</div>
                </div>

                <div class="row">
                    <span class="key">Member</span>
                    <span class="val">{{ $member_name }}</span>
                </div>
                <div class="row">
                    <span class="key">Loan Reference</span>
                    <span class="val">{{ $loan_id ? 'Loan #'.$loan_id : '—' }}</span>
                </div>
                <div class="row">
                    <span class="key">Payment Date</span>
                    <span class="val">{{ $payment_date }}</span>
                </div>
                <div class="row">
                    <span class="key">Payment Method</span>
                    <span class="val">
                        <span class="badge badge-{{ strtolower($payment_method) }}">{{ $payment_method }}</span>
                    </span>
                </div>
                <div class="row">
                    <span class="key">Payment Type</span>
                    <span class="val">
                        <span class="badge badge-{{ strtolower($payment_type ?? 'onsite') }}">{{ ucfirst($payment_type ?? 'onsite') }}</span>
                    </span>
                </div>
                @if($reference_number)
                <div class="row">
                    <span class="key">Reference No.</span>
                    <span class="val">{{ $reference_number }}</span>
                </div>
                @endif
                @if($remarks)
                <div class="row">
                    <span class="key">Remarks</span>
                    <span class="val">{{ $remarks }}</span>
                </div>
                @endif
                <div class="row">
                    <span class="key">Recorded By</span>
                    <span class="val">{{ $recorded_by }}</span>
                </div>
                <div class="row">
                    <span class="key">Recorded At</span>
                    <span class="val">{{ $recorded_at }}</span>
                </div>
            </div>

            <div class="receipt-footer">
                This is an official receipt issued by {{ $cooperative_name }}.<br>
                Please keep this for your records.
            </div>
        </div>

        <button class="print-btn" onclick="window.print()">🖨 Print Receipt</button>
    </div>
</body>
</html>
