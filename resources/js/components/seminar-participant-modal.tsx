import { router } from '@inertiajs/react';
import { Participant, Seminar } from '@/types/seminar';
import { X, Users, CheckCircle, XCircle, Phone } from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
    pending:            'Pending',
    seminar_scheduled:  'Seminar Scheduled',
    seminar_attended:   'Seminar Attended',
    for_bod_approval:   'For BOD Approval',
    approved:           'Approved',
    rejected:           'Rejected',
};

const STATUS_COLORS: Record<string, string> = {
    pending:            'bg-zinc-100 text-zinc-600',
    seminar_scheduled:  'bg-blue-100 text-blue-700',
    seminar_attended:   'bg-amber-100 text-amber-700',
    for_bod_approval:   'bg-purple-100 text-purple-700',
    approved:           'bg-emerald-100 text-emerald-700',
    rejected:           'bg-red-100 text-red-600',
};

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    seminar: Seminar;
}

export default function SeminarParticipantModal({ isOpen, onClose, seminar }: ModalProps) {
    if (!isOpen) return null;

    const participants = seminar.participants || [];
    const attendedCount = participants.filter(p => p.attended).length;

    const handleConfirmAttendance = (participant: Participant) => {
        router.patch(
            `/loan/member-registration/${participant.id}/confirm-attendance`,
            {},
            { preserveScroll: true }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-[#2d4734]">{seminar.title}</h2>
                        <p className="text-sm text-zinc-500">
                            Participant Roster &mdash; {attendedCount}/{participants.length} attended
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-200 rounded-full transition text-zinc-400"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 max-h-[60vh] overflow-y-auto space-y-3">
                    {participants.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="bg-zinc-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users className="text-zinc-400" />
                            </div>
                            <p className="text-zinc-500 font-medium">No participants registered yet.</p>
                            <p className="text-zinc-400 text-xs mt-1">
                                Assign members to this seminar from the Member Registration page.
                            </p>
                        </div>
                    ) : (
                        participants.map((person) => (
                            <div
                                key={person.id}
                                className="flex items-center justify-between p-4 border border-zinc-100 rounded-xl hover:bg-zinc-50 transition gap-4"
                            >
                                {/* Avatar + Info */}
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 bg-[#4c9f5f]/10 rounded-full flex items-center justify-center text-[#2d4734] font-bold flex-shrink-0">
                                        {person.name.charAt(0)}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="font-semibold text-zinc-900 truncate">{person.name}</p>
                                        <div className="flex items-center gap-1 text-zinc-400 text-xs mt-0.5">
                                            <Phone className="w-3 h-3" />
                                            {person.contact_number}
                                        </div>
                                    </div>
                                </div>

                                {/* Right: status badge + attendance action */}
                                <div className="flex items-center gap-3 flex-shrink-0">
                                    <span className={`hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_COLORS[person.status] ?? 'bg-zinc-100 text-zinc-600'}`}>
                                        {STATUS_LABELS[person.status] ?? person.status}
                                    </span>

                                    {person.attended ? (
                                        <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold uppercase">
                                            <CheckCircle className="w-4 h-4" /> Present
                                        </span>
                                    ) : person.status === 'seminar_scheduled' ? (
                                        <button
                                            onClick={() => handleConfirmAttendance(person)}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-lg transition active:scale-95"
                                            title="Mark as attended"
                                        >
                                            <XCircle className="w-3.5 h-3.5" /> Mark Attended
                                        </button>
                                    ) : (
                                        <span className="text-zinc-400 text-xs">—</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-zinc-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-zinc-200 rounded-xl font-semibold text-zinc-600 hover:bg-zinc-50 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
}