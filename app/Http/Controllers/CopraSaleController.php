<?php

namespace App\Http\Controllers;

use App\Models\CopraSale;
use App\Models\Member;
use App\Services\MigsScoreService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CopraSaleController extends Controller
{
    private function getMember(): Member
    {
        $member = Member::where('user_id', auth()->id())->first();

        if (! $member) {
            throw new \Illuminate\Http\Exceptions\HttpResponseException(
                redirect()->route('member.login')
                    ->withErrors(['auth' => 'Your account is not yet linked to a member record. Please contact the cooperative office.'])
            );
        }

        return $member;
    }

    public function index(Request $request)
    {
        $year           = (int) $request->query('year', now()->year);
        $month          = (int) $request->query('month', 0);
        $classification = strtoupper($request->query('classification', ''));
        $search         = trim($request->query('search', ''));
        $saleDate       = $request->query('sale_date', '');

        $saleQuery = CopraSale::query()
            ->whereYear('sale_date', $year);

        if ($month > 0 && $month <= 12) {
            $saleQuery->whereMonth('sale_date', $month);
        }

        if (in_array($classification, ['MIGS', 'NON-MIGS'], true)) {
            $saleQuery->where('classification', $classification);
        }

        if ($saleDate) {
            $saleQuery->whereDate('sale_date', $saleDate);
        }

        if ($search) {
            $saleQuery->whereHas('member', function ($query) use ($search) {
                $query->where('name', 'like', "%{$search}%");
            });
        }

        $totalGross = (float) $saleQuery->sum('gross_amount');
        $totalNet   = (float) $saleQuery->sum('net_amount');
        $totalKilos = (float) $saleQuery->sum('kilos');
        $totalTxns  = $saleQuery->count();

        $members = Member::with(['copraSales' => function ($query) use ($year, $month, $classification, $saleDate) {
            $query->whereYear('sale_date', $year);

            if ($month > 0 && $month <= 12) {
                $query->whereMonth('sale_date', $month);
            }

            if (in_array($classification, ['MIGS', 'NON-MIGS'], true)) {
                $query->where('classification', $classification);
            }

            if ($saleDate) {
                $query->whereDate('sale_date', $saleDate);
            }

            $query->orderByDesc('sale_date');
        }])
        ->when($search, fn ($query) => $query->where('name', 'like', "%{$search}%"))
        ->whereIn('status', ['approved', 'active'])
        ->orderBy('name')
        ->get()
        ->map(function ($member) {
            $sales = $member->copraSales;

            return [
                'id'        => $member->id,
                'name'      => $member->name,
                'ytd_gross' => (float) $sales->sum('gross_amount'),
                'ytd_net'   => (float) $sales->sum('net_amount'),
                'ytd_kilos' => (float) $sales->sum('kilos'),
                'sales'     => $sales->map(fn ($sale) => [
                    'id'                   => $sale->id,
                    'sale_date'            => $sale->sale_date->format('Y-m-d'),
                    'sale_date_formatted'  => $sale->sale_date->format('M d, Y'),
                    'classification'       => $sale->classification,
                    'kilos'                => (float) $sale->kilos,
                    'price_per_kilo'       => (float) $sale->price_per_kilo,
                    'gross_amount'         => (float) $sale->gross_amount,
                    'total_amount'         => (float) $sale->total_amount,
                    'deduction_amount'     => (float) $sale->deduction_amount,
                    'deduction_type'       => $sale->deduction_type,
                    'net_amount'           => (float) $sale->net_amount,
                    'remarks'              => $sale->remarks,
                ])->values(),
            ];
        });

        return inertia('Superadmin/CoproSales', [
            'members'        => $members,
            'year'           => $year,
            'years'          => range(now()->year, max(2020, now()->year - 5)),
            'stats'          => [
                'total_gross'        => $totalGross,
                'total_net'          => $totalNet,
                'total_kilos'        => $totalKilos,
                'total_transactions' => (int) $totalTxns,
            ],
            'filters'        => [
                'search'         => $search,
                'month'          => $month,
                'classification' => $classification,
                'sale_date'      => $saleDate,
            ],
        ]);
    }

    public function store(Request $request, Member $member)
    {
        $validated = $request->validate([
            'sale_date'      => 'required|date',
            'kilos'          => 'required|numeric|min:0.01',
            'price_per_kilo' => 'required|numeric|min:0.01',
            'classification' => ['nullable', Rule::in(['MIGS', 'NON-MIGS'])],
            'deduction_amount' => 'nullable|numeric|min:0',
            'deduction_type' => 'nullable|string|in:loan_payment,savings,manual',
            'remarks'        => 'nullable|string|max:500',
        ]);

        $gross      = round($validated['kilos'] * $validated['price_per_kilo'], 2);
        $total      = $gross;
        $deduction  = (float) ($validated['deduction_amount'] ?? 0);
        $net        = max(0, round($gross - $deduction, 2));

        $member->copraSales()->create([
            'sale_date'        => $validated['sale_date'],
            'kilos'            => $validated['kilos'],
            'price_per_kilo'   => $validated['price_per_kilo'],
            'total_amount'     => $total,
            'gross_amount'     => $gross,
            'classification'   => $validated['classification'] ?? 'NON-MIGS',
            'deduction_amount' => $deduction,
            'deduction_type'   => $validated['deduction_type'] ?? null,
            'net_amount'       => $net,
            'remarks'          => $validated['remarks'] ?? null,
            'recorded_by'      => auth()->id(),
        ]);

        $ytd = $member->copraSales()->whereYear('sale_date', now()->year)->sum('gross_amount');
        $member->update(['copra_sales_ytd' => $ytd]);

        app(MigsScoreService::class)->recalculate($member);

        activity()->causedBy(auth()->user())
            ->performedOn($member)
            ->log("Copra sale recorded: {$validated['kilos']} kg @ ₱{$validated['price_per_kilo']}/kg = ₱{$gross} gross");

        return back()->with('success', 'Copra sale recorded.');
    }

    public function update(Request $request, CopraSale $copraSale)
    {
        $validated = $request->validate([
            'sale_date'      => 'required|date',
            'kilos'          => 'required|numeric|min:0.01',
            'price_per_kilo' => 'required|numeric|min:0.01',
            'classification' => ['nullable', Rule::in(['MIGS', 'NON-MIGS'])],
            'deduction_amount' => 'nullable|numeric|min:0',
            'deduction_type' => 'nullable|string|in:loan_payment,savings,manual',
            'remarks'        => 'nullable|string|max:500',
        ]);

        $gross      = round($validated['kilos'] * $validated['price_per_kilo'], 2);
        $total      = $gross;
        $deduction  = (float) ($validated['deduction_amount'] ?? 0);
        $net        = max(0, round($gross - $deduction, 2));

        $copraSale->update([
            'sale_date'        => $validated['sale_date'],
            'kilos'            => $validated['kilos'],
            'price_per_kilo'   => $validated['price_per_kilo'],
            'total_amount'     => $total,
            'gross_amount'     => $gross,
            'classification'   => $validated['classification'] ?? 'NON-MIGS',
            'deduction_amount' => $deduction,
            'deduction_type'   => $validated['deduction_type'] ?? null,
            'net_amount'       => $net,
            'remarks'          => $validated['remarks'] ?? null,
        ]);

        $member = $copraSale->member;
        $ytd = $member->copraSales()->whereYear('sale_date', now()->year)->sum('gross_amount');
        $member->update(['copra_sales_ytd' => $ytd]);

        app(MigsScoreService::class)->recalculate($member);

        activity()->causedBy(auth()->user())
            ->performedOn($member)
            ->log("Copra sale updated: {$validated['kilos']} kg @ ₱{$validated['price_per_kilo']}/kg = ₱{$gross} gross");

        return back()->with('success', 'Copra sale updated.');
    }

    public function destroy(CopraSale $copraSale)
    {
        $member = $copraSale->member;
        $copraSale->delete();

        $ytd = $member->copraSales()->whereYear('sale_date', now()->year)->sum('gross_amount');
        $member->update(['copra_sales_ytd' => $ytd]);

        app(MigsScoreService::class)->recalculate($member);

        activity()->causedBy(auth()->user())
            ->performedOn($member)
            ->log('Copra sale deleted.');

        return back()->with('success', 'Copra sale deleted.');
    }

    public function memberSales()
    {
        $member = $this->getMember();

        $sales = $member->copraSales()
            ->orderByDesc('sale_date')
            ->get()
            ->map(fn ($sale) => [
                'id'                  => $sale->id,
                'sale_date'           => $sale->sale_date->format('Y-m-d'),
                'sale_date_formatted' => $sale->sale_date->format('M d, Y'),
                'classification'      => $sale->classification,
                'kilos'               => (float) $sale->kilos,
                'price_per_kilo'      => (float) $sale->price_per_kilo,
                'total_amount'        => (float) $sale->total_amount,
                'gross_amount'        => (float) $sale->gross_amount,
                'deduction_amount'    => (float) $sale->deduction_amount,
                'deduction_type'      => $sale->deduction_type,
                'net_amount'          => (float) $sale->net_amount,
                'remarks'             => $sale->remarks,
            ]);

        return response()->json([
            'member' => [
                'id'               => $member->id,
                'name'             => $member->name,
                'copra_sales_ytd'  => (float) ($member->copra_sales_ytd ?? 0),
                'patronage_amount' => (float) ($member->patronage_amount ?? 0),
            ],
            'sales'   => $sales,
            'summary' => [
                'total_gross' => (float) $sales->sum('gross_amount'),
                'total_net'   => (float) $sales->sum('net_amount'),
                'total_kilos' => (float) $sales->sum('kilos'),
            ],
        ]);
    }

    public function generateReport(Request $request)
    {
        $reportType    = $request->query('type', 'annual');
        $year          = (int) $request->query('year', now()->year);
        $month         = (int) $request->query('month', 0);
        $classification = strtoupper($request->query('classification', ''));

        $sales = CopraSale::with('member')
            ->whereYear('sale_date', $year);

        if ($month > 0 && $month <= 12) {
            $sales->whereMonth('sale_date', $month);
        }

        if (in_array($classification, ['MIGS', 'NON-MIGS'], true)) {
            $sales->where('classification', $classification);
        }

        if ($reportType === 'member_contribution') {
            $rows = $sales->get()->groupBy('member_id');
            $csv  = implode(',', ['Member Name', 'Total Kilos', 'Total Gross', 'Total Net', 'Patronage Basis', 'Year']) . "\n";

            foreach ($rows as $group) {
                $member = $group->first()->member;
                $csv .= implode(',', [
                    '"' . ($member?->name ?? '—') . '"',
                    $group->sum('kilos'),
                    $group->sum('gross_amount'),
                    $group->sum('net_amount'),
                    $group->sum('gross_amount'),
                    $year,
                ]) . "\n";
            }

            $filename = "copra_sales_member_contribution_{$year}.csv";
        } else {
            $rows = $sales->orderByDesc('sale_date')->get();
            $csv  = implode(',', ['Member Name', 'Sale Date', 'Classification', 'Kilos', 'Price Per Kilo', 'Total Amount', 'Deduction Amount', 'Net Amount', 'Remarks']) . "\n";

            foreach ($rows as $sale) {
                $csv .= implode(',', [
                    '"' . ($sale->member?->name ?? '—') . '"',
                    $sale->sale_date->format('Y-m-d'),
                    $sale->classification,
                    $sale->kilos,
                    $sale->price_per_kilo,
                    $sale->total_amount,
                    $sale->deduction_amount,
                    $sale->net_amount,
                    '"' . str_replace('"', '""', $sale->remarks ?? '') . '"',
                ]) . "\n";
            }

            $filename = "copra_sales_{$reportType}_{$year}";
            if ($month > 0) {
                $filename .= "_{$month}";
            }
            $filename .= '.csv';
        }

        return response($csv, 200, [
            'Content-Type'        => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ]);
    }
}
