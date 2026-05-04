import { Calendar, MapPin, Users, UserCircle } from 'lucide-react';
import { Seminar } from '@/types/seminar';

interface TableProps {
    seminars: Seminar[];
    onViewParticipants: (seminar: Seminar) => void; 
}

export default function SeminarTrackTable({ seminars, onViewParticipants } : TableProps) {
    
    // Helper to format dates nicely so they don't look like "2026-04-12 10:00:00"
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 font-bold">
                    <tr>
                        <th className="px-6 py-4">SEMINAR</th>
                        <th className="px-6 py-4">DETAILS</th>
                        <th className="px-6 py-4">STATUS</th>
                        <th className="px-6 py-4 text-right">ACTION</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                    {/* Fallback for empty state */}
                    {seminars.length === 0 ? (
                        <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                                <div className="flex flex-col items-center gap-2">
                                    <Calendar className="w-8 h-8 text-zinc-300" />
                                    <p className="font-medium">No seminars found in the database.</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        seminars.map((s) => (
                            <tr key={s.id} className="hover:bg-zinc-50/50 transition group">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-zinc-900 group-hover:text-[#4c9f5f] transition-colors">{s.title}</p>
                                    <div className="flex items-center gap-1.5 mt-1 text-zinc-500">
                                        <UserCircle className="w-3.5 h-3.5" />
                                        <span className="text-xs">{s.speaker_name || 'No speaker assigned'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-zinc-500 space-y-1">
                                    <div className="flex items-center gap-2 whitespace-nowrap">
                                        <Calendar className="w-3.5 h-3.5 text-zinc-400"/> 
                                        {formatDate(s.scheduled_at)}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <MapPin className="w-3.5 h-3.5 text-zinc-400"/> 
                                        {s.location}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                        s.status === 'ongoing' ? 'bg-amber-100 text-amber-700' : 
                                        s.status === 'completed' ? 'bg-zinc-100 text-zinc-600' :
                                        'bg-emerald-100 text-emerald-700'
                                    }`}>
                                        {s.status || 'upcoming'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => onViewParticipants(s)}
                                        className="inline-flex items-center gap-2 px-3 py-2 hover:bg-[#4c9f5f]/10 rounded-lg text-zinc-400 hover:text-[#2d4734] font-medium transition"
                                        title="View Participants"
                                    >
                                        <span className="text-xs hidden md:inline">Participants</span>
                                        <Users className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}