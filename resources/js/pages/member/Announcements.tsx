import { Head } from '@inertiajs/react';
import { Megaphone, CalendarDays } from 'lucide-react';
import MemberLayout from '@/layouts/MemberLayout';

interface Announcement {
    id: number;
    title: string;
    content: string;
    category: string;
    announcement_date: string;
}

interface Props {
    user: { name: string; email: string };
    announcements: Announcement[];
}

const CATEGORY_COLORS: Record<string, string> = {
    general:   'bg-zinc-100 text-zinc-600',
    loan:      'bg-blue-100 text-blue-700',
    event:     'bg-purple-100 text-purple-700',
    policy:    'bg-orange-100 text-orange-700',
    reminder:  'bg-yellow-100 text-yellow-700',
};

export default function MemberAnnouncements({ user, announcements }: Props) {
    return (
        <MemberLayout user={user} title="Announcements">
            <Head title="Announcements — KSCFMPC Member Portal" />

            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-900">Announcements</h1>
                    <p className="text-zinc-500 text-sm mt-0.5">Stay updated with the latest news from KSCFMPC.</p>
                </div>

                {announcements.length === 0 ? (
                    <div className="bg-white rounded-xl border border-zinc-100 shadow-sm py-16 text-center">
                        <Megaphone className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
                        <p className="text-zinc-500 font-medium">No announcements</p>
                        <p className="text-zinc-400 text-sm mt-1">Check back later for updates.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {announcements.map(a => (
                            <div key={a.id} className="bg-white rounded-xl border border-zinc-100 shadow-sm p-5">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 flex-wrap mb-2">
                                            <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                                                CATEGORY_COLORS[a.category] ?? 'bg-zinc-100 text-zinc-600'
                                            }`}>
                                                {a.category}
                                            </span>
                                            <span className="flex items-center gap-1 text-xs text-zinc-400">
                                                <CalendarDays className="w-3 h-3" />
                                                {a.announcement_date}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-zinc-900 text-base leading-snug">{a.title}</h3>
                                        <p className="text-sm text-zinc-600 mt-2 leading-relaxed">{a.content}</p>
                                    </div>
                                    <div className="w-9 h-9 rounded-lg bg-[#2d5a27]/10 flex items-center justify-center shrink-0 mt-0.5">
                                        <Megaphone className="w-4 h-4 text-[#2d5a27]" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </MemberLayout>
    );
}
