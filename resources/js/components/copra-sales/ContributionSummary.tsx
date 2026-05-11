import { Leaf, BarChart3, Scale, Receipt } from 'lucide-react';

interface Props {
    totalSales: number;
    totalKilos: number;
    patronageAmount: number;
    year: number;
}

const fmt = (n: number) =>
    '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtKg = (n: number) =>
    n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' kg';

export default function ContributionSummary({ totalSales, totalKilos, patronageAmount, year }: Props) {
    return (
        <div className="grid sm:grid-cols-4 gap-4">
            {[
                { label: 'Contribution Basis', value: fmt(totalSales), icon: Leaf, color: '#2d5a27' },
                { label: 'Patronage Refund', value: fmt(patronageAmount), icon: BarChart3, color: '#c8920a' },
                { label: 'Total Kilos Sold', value: fmtKg(totalKilos), icon: Scale, color: '#2563eb' },
                { label: 'Report Year', value: year.toString(), icon: Receipt, color: '#7c3aed' },
            ].map(card => (
                <div key={card.label} className="bg-white rounded-xl border border-zinc-100 shadow-sm p-4">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-zinc-500 font-medium">{card.label}</p>
                        <div
                            className="w-8 h-8 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: card.color + '15' }}
                        >
                            <card.icon className="w-4 h-4" style={{ color: card.color }} />
                        </div>
                    </div>
                    <p className="text-xl font-bold text-zinc-900">{card.value}</p>
                </div>
            ))}
        </div>
    );
}
