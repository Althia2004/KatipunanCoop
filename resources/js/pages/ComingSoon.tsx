import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Construction } from 'lucide-react';

interface Props {
    page: string;
}

export default function ComingSoon({ page }: Props) {
    return (
        <>
            <Head title={page} />
            <div className="min-h-screen bg-[#f5f0e8] flex flex-col items-center justify-center px-4">
                <div className="text-center space-y-6 max-w-md">
                    <div className="w-20 h-20 rounded-2xl bg-[#2d5a27]/10 flex items-center justify-center mx-auto">
                        <Construction className="w-10 h-10 text-[#2d5a27]" />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-[#c8920a] mb-2">
                            Under Development
                        </p>
                        <h1 className="text-3xl font-bold text-[#2d5a27]">{page}</h1>
                        <p className="text-zinc-500 mt-3 leading-relaxed">
                            This section is currently being built. Please check back soon.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#2d5a27] text-white rounded-xl hover:bg-[#1e3e1a] transition font-semibold"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Back to Home
                        </Link>
                    </div>
                    <p className="text-xs text-zinc-400">
                        KSCFMPC — Katipunan Small Coconut Farmers Multi Purpose Cooperative
                    </p>
                </div>
            </div>
        </>
    );
}
