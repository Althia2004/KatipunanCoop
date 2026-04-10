import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { Users, BookOpenCheck, Target, BarChart3, Plus, Search, Filter, CheckCircle2, Clock } from 'lucide-react';
import SeminarTrackTable from '@/components/seminar-track-table';
import SeminarParticipantModal from '@/components/seminar-participant-modal';
import { Seminar } from '@/types/seminar';

interface SeminarPageProps {
    seminarsFromDb: Seminar[];
}

export default function SeminarTracking({ seminarsFromDb }: SeminarPageProps) {
    console.log("Check this:", seminarsFromDb);
    const [searchTerm, setSearchTerm] = useState('');
    // Tip: Always type your state for objects/nulls to avoid TS errors later
    const [selectedSeminar, setSelectedSeminar] = useState<Seminar | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 1. Logic: Filter seminars based on search input
    // This ensures your table updates as you type
    const seminars = (seminarsFromDb || []).filter(s => 
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.speaker_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // 2. KPI Calculations based on the data
    const totalSeminars = seminars.length;
    const completedCount = seminars.filter(s => s.status === 'completed').length;
    const upcomingCount = seminars.filter(s => s.status === 'upcoming').length;

    return (
        <>
            <Head title="Seminar Tracking" />

            <div className="p-8 max-w-[90rem] mx-auto space-y-8">
                
                {/* 1. Header & Quick Actions */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-[#2d4734]">Seminar Tracking</h1>
                        <p className="text-zinc-500 font-medium">Monitor attendee engagement and session schedules.</p>
                    </div>
                    <Link 
                        href="/loan/seminar-tracking/create" 
                        className="flex items-center gap-2 px-6 py-3 bg-[#4c9f5f] text-white rounded-xl font-bold hover:bg-[#3d814d] transition shadow-lg shadow-emerald-900/10 active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Create Seminar
                    </Link>
                </div>

                {/* 2. KPI Cards - Now Dynamic */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Total Sessions */}
                    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600"><BookOpenCheck /></div>
                            <div>
                                <p className="text-sm text-zinc-500 font-medium">Total Sessions</p>
                                <p className="text-2xl font-bold text-zinc-900">{totalSeminars}</p>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming */}
                    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-50 rounded-lg text-blue-600"><Clock /></div>
                            <div>
                                <p className="text-sm text-zinc-500 font-medium">Upcoming</p>
                                <p className="text-2xl font-bold text-zinc-900">{upcomingCount}</p>
                            </div>
                        </div>
                    </div>

                    {/* Completed */}
                    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-amber-50 rounded-lg text-amber-600"><CheckCircle2 /></div>
                            <div>
                                <p className="text-sm text-zinc-500 font-medium">Completed</p>
                                <p className="text-2xl font-bold text-zinc-900">{completedCount}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 3. Toolbar */}
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full text-zinc-900">
                        <Search className="absolute left-3 top-3 w-5 h-5 text-zinc-400" />
                        <input 
                            type="text" 
                            placeholder="Search by title, location, or speaker..." 
                            className="w-full text-zinc-900 pl-10 pr-4 py-2.5 bg-white border border-zinc-200 rounded-xl focus:ring-2 focus:ring-[#4c9f5f] focus:border-transparent outline-none transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-white text-zinc-700 font-bold border border-zinc-200 rounded-xl hover:bg-zinc-50 transition">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                </div>

                {/* 4. The Table - Now using filtered data */}
                <SeminarTrackTable 
                    seminars={seminars} 
                    onViewParticipants={(s) => {
                        setSelectedSeminar(s);
                        setIsModalOpen(true);
                    }}
                />
            </div>

            {/* Modals */}
            {selectedSeminar && (
                <SeminarParticipantModal 
                    isOpen={isModalOpen} 
                    onClose={() => setIsModalOpen(false)} 
                    seminar={selectedSeminar} 
                />
            )}
        </>
    );
}