import { Participant, Seminar } from '@/types/seminar'; // Import your interfaces
import { X, Mail, CheckCircle, XCircle } from 'lucide-react';


interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    seminar: Seminar;
}

export default function SeminarParticipantModal({ isOpen, onClose, seminar} : ModalProps) {
    if (!isOpen) return null;

    // In a real app, 'participants' would come from your SQL relationship
    const participants = seminar.participants || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                
                {/* Modal Header */}
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                    <div>
                        <h2 className="text-xl font-bold text-[#2d4734]">{seminar.title}</h2>
                        <p className="text-sm text-zinc-500">Participant Roster</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-zinc-200 rounded-full transition text-zinc-400"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Modal Body: The List */}
                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {participants.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="bg-zinc-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Mail className="text-zinc-400" />
                            </div>
                            <p className="text-zinc-500 font-medium">No participants registered yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {participants.map((person) => (
                                <div key={person.id} className="flex items-center justify-between p-4 border border-zinc-100 rounded-xl hover:bg-zinc-50 transition">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-[#4c9f5f]/10 rounded-full flex items-center justify-center text-[#2d4734] font-bold">
                                            {person.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-zinc-900">{person.name}</p>
                                            <p className="text-xs text-zinc-500">{person.email}</p>
                                        </div>
                                    </div>
                                    <div>
                                        {person.attended ? (
                                            <span className="flex items-center gap-1 text-emerald-600 text-xs font-bold uppercase">
                                                <CheckCircle className="w-4 h-4" /> Present
                                            </span>
                                        ) : (
                                            <span className="flex items-center gap-1 text-zinc-400 text-xs font-bold uppercase">
                                                <XCircle className="w-4 h-4" /> Pending
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-6 border-t border-zinc-100 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2 border border-zinc-200 rounded-xl font-semibold text-zinc-600 hover:bg-zinc-50 transition"
                    >
                        Close
                    </button>
                    <button className="px-6 py-2 bg-[#2d4734] text-white rounded-xl font-semibold hover:bg-[#1e3023] transition">
                        Export List
                    </button>
                </div>
            </div>
        </div>
    );
}