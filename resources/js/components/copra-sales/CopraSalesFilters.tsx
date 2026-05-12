import { Input } from '@/components/ui/input';

interface Props {
    search: string;
    month: number;
    classification: string;
    saleDate: string;
    onSearch: (value: string) => void;
    onMonth: (value: number) => void;
    onClassification: (value: string) => void;
    onSaleDate: (value: string) => void;
}

const MONTHS = [
    { value: 0, label: 'All months' },
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' },
];

export default function CopraSalesFilters({
    search,
    month,
    classification,
    saleDate,
    onSearch,
    onMonth,
    onClassification,
    onSaleDate,
}: Props) {
    return (
        <div className="grid gap-3 sm:grid-cols-4 p-4 border-b border-zinc-100 bg-white">
            <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Search member</label>
                <Input
                    placeholder="Name, member..."
                    value={search}
                    onChange={e => onSearch(e.target.value)}
                    className="h-10"
                />
            </div>

            <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Classification</label>
                <select
                    value={classification}
                    onChange={e => onClassification(e.target.value)}
                    className="w-full h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-700"
                >
                    <option value="">All classifications</option>
                    <option value="MIGS">MIGS</option>
                    <option value="NON-MIGS">NON-MIGS</option>
                </select>
            </div>

            <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Month</label>
                <select
                    value={month}
                    onChange={e => onMonth(Number(e.target.value))}
                    className="w-full h-10 rounded-md border border-zinc-200 bg-white px-3 text-sm text-zinc-700"
                >
                    {MONTHS.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                </select>
            </div>

            <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Sale date</label>
                <Input
                    type="date"
                    value={saleDate}
                    onChange={e => onSaleDate(e.target.value)}
                    className="h-10"
                />
            </div>
        </div>
    );
}
