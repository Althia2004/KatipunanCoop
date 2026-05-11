import { Head } from '@inertiajs/react';
import {
    User, Calendar, MapPin, Phone, Briefcase, Shield, Star,
} from 'lucide-react';
import MemberLayout from '@/layouts/MemberLayout';

interface Props {
    user: { name: string; email: string };
    member: {
        name: string;
        gender: string;
        date_of_birth: string;
        address: string;
        contact_number: string;
        source_of_income: string;
        member_since: string;
        status: string;
        standing: string;
        migs_score: number;
        classification: string;
        savings_balance: number;
        share_capital: number;
    };
}

const fmt = (n: number) =>
    '₱' + n.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function MemberProfile({ user, member }: Props) {
    const isMigs = member.classification === 'migs';

    return (
        <MemberLayout user={user} title="My Profile">
            <Head title="My Profile — KSCFMPC Member Portal" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">My Profile</h1>
                    <p className="text-zinc-500 text-sm mt-0.5">Your membership details and information.</p>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left: Avatar + status */}
                    <div className="space-y-4">
                        <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-6 flex flex-col items-center text-center">
                            <div className="w-20 h-20 rounded-full bg-[#2d5a27]/10 flex items-center justify-center mb-4">
                                <User className="w-10 h-10 text-[#2d5a27]/50" />
                            </div>
                            <h2 className="text-lg font-bold text-zinc-900">{member.name}</h2>
                            <p className="text-xs text-zinc-500 mt-0.5">Member since {member.member_since}</p>
                            <div className="flex items-center gap-2 mt-3">
                                <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                                    member.status === 'active' || member.status === 'approved'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-zinc-100 text-zinc-500'
                                }`}>
                                    {member.status}
                                </span>
                                {member.standing && (
                                    <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-full bg-[#2d5a27]/10 text-[#2d5a27]">
                                        {member.standing}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* MIGS Card */}
                        <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5">
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm font-semibold text-zinc-700">MIGS Score</p>
                                <Star className={`w-4 h-4 ${isMigs ? 'text-[#c8920a]' : 'text-zinc-300'}`} />
                            </div>
                            <div className="flex items-end gap-1 mb-2">
                                <span className="text-3xl font-black text-zinc-900">{member.migs_score}</span>
                                <span className="text-zinc-400 text-sm mb-0.5">/100</span>
                            </div>
                            <div className="w-full h-2 bg-zinc-100 rounded-full overflow-hidden mb-2">
                                <div
                                    className="h-full rounded-full"
                                    style={{
                                        width: `${member.migs_score}%`,
                                        backgroundColor: isMigs ? '#2d5a27' : '#c8920a',
                                    }}
                                />
                            </div>
                            <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${
                                isMigs ? 'bg-[#2d5a27]/10 text-[#2d5a27]' : 'bg-zinc-100 text-zinc-500'
                            }`}>
                                {isMigs ? 'MIGS Member' : 'Non-MIGS'}
                            </span>
                        </div>

                        {/* Balances */}
                        <div className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5 space-y-3">
                            <div>
                                <p className="text-xs text-zinc-400">Savings Balance</p>
                                <p className="text-xl font-bold text-[#2d5a27]">{fmt(member.savings_balance)}</p>
                            </div>
                            <div className="border-t border-zinc-50 pt-3">
                                <p className="text-xs text-zinc-400">Capital Share</p>
                                <p className="text-xl font-bold text-[#c8920a]">{fmt(member.share_capital)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Details */}
                    <div className="lg:col-span-2 bg-white rounded-xl border border-zinc-100 shadow-sm p-6">
                        <h3 className="text-sm font-semibold text-zinc-700 mb-5 flex items-center gap-2">
                            <Shield className="w-4 h-4 text-[#2d5a27]" />
                            Personal Information
                        </h3>

                        <div className="grid sm:grid-cols-2 gap-5">
                            {[
                                { label: 'Full Name', value: member.name, icon: User },
                                { label: 'Gender', value: member.gender, icon: User },
                                { label: 'Date of Birth', value: member.date_of_birth, icon: Calendar },
                                { label: 'Contact Number', value: member.contact_number, icon: Phone },
                                { label: 'Source of Income', value: member.source_of_income, icon: Briefcase },
                                { label: 'Member Since', value: member.member_since, icon: Calendar },
                            ].map(item => (
                                <div key={item.label}>
                                    <p className="text-xs font-medium text-zinc-400 flex items-center gap-1.5 mb-1">
                                        <item.icon className="w-3 h-3" />
                                        {item.label}
                                    </p>
                                    <p className="text-sm font-medium text-zinc-800 capitalize">{item.value || '—'}</p>
                                </div>
                            ))}

                            <div className="sm:col-span-2">
                                <p className="text-xs font-medium text-zinc-400 flex items-center gap-1.5 mb-1">
                                    <MapPin className="w-3 h-3" />
                                    Address
                                </p>
                                <p className="text-sm font-medium text-zinc-800">{member.address || '—'}</p>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-zinc-100">
                            <p className="text-xs text-zinc-400">
                                To update your personal information, please visit the cooperative office or contact your assigned staff.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </MemberLayout>
    );
}
