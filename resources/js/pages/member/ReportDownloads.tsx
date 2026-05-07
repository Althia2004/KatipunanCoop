import { Head, Link } from '@inertiajs/react';
import { Download, FileText, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import reportService, { ReportType, ExportFormat } from '@/services/reportService';

type LoadingState = {
    [key: string]: boolean;
};

export default function ReportDownloads() {
    const [loading, setLoading] = useState<LoadingState>({});
    const [error, setError] = useState<string | null>(null);

    const reportTypes: Array<{
        id: ReportType;
        name: string;
        description: string;
        color: string;
        bg: string;
    }> = [
        {
            id: 'loans',
            name: 'Loan Reports',
            description: 'Download your loan history and details',
            color: 'text-blue-600',
            bg: 'bg-blue-50',
        },
        {
            id: 'savings',
            name: 'Savings Reports',
            description: 'Download your savings transaction history',
            color: 'text-emerald-600',
            bg: 'bg-emerald-50',
        },
        {
            id: 'patronage',
            name: 'Patronage Reports',
            description: 'Download your patronage refund records',
            color: 'text-purple-600',
            bg: 'bg-purple-50',
        },
    ];

    const handleDownload = async (reportType: ReportType, format: ExportFormat) => {
        const key = `${reportType}-${format}`;
        try {
            setLoading((prev) => ({ ...prev, [key]: true }));
            setError(null);

            switch (reportType) {
                case 'loans':
                    await reportService.downloadLoanReport(format);
                    break;
                case 'savings':
                    await reportService.downloadSavingsReport(format);
                    break;
                case 'patronage':
                    await reportService.downloadPatronageReport(format);
                    break;
                default:
                    throw new Error('Unknown report type');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to download report. Please try again.');
            console.error(err);
        } finally {
            setLoading((prev) => ({ ...prev, [key]: false }));
        }
    };

    return (
        <>
            <Head title="Report Downloads" />

            <div className="p-8 space-y-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <Link
                        href="/member/dashboard"
                        className="inline-flex items-center justify-center w-10 h-10 rounded-lg
                                   hover:bg-zinc-100 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-[#2d4734]">Download Reports</h1>
                        <p className="text-zinc-500 mt-1">Export your financial records in PDF or CSV format</p>
                    </div>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-2xl p-6 flex gap-3">
                        <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-semibold text-red-900">Error</h3>
                            <p className="text-red-700 text-sm">{error}</p>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {reportTypes.map((report) => (
                        <div
                            key={report.id}
                            className="bg-white border border-zinc-200 rounded-2xl p-6 hover:shadow-md
                                       transition-shadow duration-200"
                        >
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${report.bg} mb-4`}>
                                <FileText className={`w-6 h-6 ${report.color}`} />
                            </div>
                            <h3 className="font-semibold text-zinc-900 mb-2">{report.name}</h3>
                            <p className="text-sm text-zinc-500 mb-4">{report.description}</p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleDownload(report.id, 'pdf')}
                                    disabled={loading[`${report.id}-pdf`]}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2
                                               bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200
                                               transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading[`${report.id}-pdf`] ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Download className="w-4 h-4" />
                                    )}
                                    PDF
                                </button>
                                <button
                                    onClick={() => handleDownload(report.id, 'csv')}
                                    disabled={loading[`${report.id}-csv`]}
                                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2
                                               bg-zinc-100 text-zinc-700 rounded-lg hover:bg-zinc-200
                                               transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading[`${report.id}-csv`] ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Download className="w-4 h-4" />
                                    )}
                                    CSV
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                    <h3 className="font-semibold text-blue-900 mb-2">Report Information</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• PDF reports are formatted for printing and professional use</li>
                        <li>• CSV reports can be imported into spreadsheet applications</li>
                        <li>• All reports include data up to the current date</li>
                        <li>• Downloaded files are for your personal records only</li>
                    </ul>
                </div>
            </div>
        </>
    );
}
