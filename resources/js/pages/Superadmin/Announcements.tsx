import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { Eye, EyeOff, Megaphone, Pencil, Plus, Trash2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import InputError from '@/components/input-error';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Announcement {
    id: number;
    title: string;
    content: string;
    category: 'general' | 'meeting' | 'copra' | 'seminar';
    status: 'draft' | 'published';
    announcement_date: string;
    created_by: string;
    created_at: string;
}

interface Props {
    announcements: Announcement[];
    stats: { total: number; published: number; draft: number };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const CATEGORIES = ['general', 'meeting', 'copra', 'seminar'] as const;
const STATUSES   = ['draft', 'published'] as const;

const categoryLabel: Record<string, string> = {
    general: 'General',
    meeting: 'Meeting',
    copra:   'Copra',
    seminar: 'Seminar',
};

const categoryBadge: Record<string, string> = {
    general: 'bg-zinc-100 text-zinc-700',
    meeting: 'bg-[#2d5a27]/10 text-[#2d5a27]',
    copra:   'bg-[#c8920a]/10 text-[#c8920a]',
    seminar: 'bg-blue-100 text-blue-700',
};

const statusBadge: Record<string, string> = {
    published: 'bg-[#2d5a27]/10 text-[#2d5a27]',
    draft:     'bg-[#c8920a]/10 text-[#c8920a]',
};

const today = new Date().toISOString().slice(0, 10);

const blankForm = {
    title:             '',
    content:           '',
    category:          'general' as const,
    status:            'draft' as const,
    announcement_date: today,
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function Announcements({ announcements, stats }: Props) {
    const { props } = usePage<{ flash?: { success?: string } }>();
    const flash = props.flash;

    const [addOpen,    setAddOpen]    = useState(false);
    const [editOpen,   setEditOpen]   = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [target,     setTarget]     = useState<Announcement | null>(null);

    // ── Add form ──
    const addForm = useForm({ ...blankForm });

    const openAdd = () => {
        addForm.reset();
        setAddOpen(true);
    };

    const submitAdd = () => {
        addForm.post('/superadmin/announcements', {
            onSuccess: () => setAddOpen(false),
            preserveScroll: true,
        });
    };

    // ── Edit form ──
    const editForm = useForm({ ...blankForm });

    const openEdit = (a: Announcement) => {
        setTarget(a);
        editForm.setData({
            title:             a.title,
            content:           a.content,
            category:          a.category,
            status:            a.status,
            announcement_date: a.announcement_date,
        });
        setEditOpen(true);
    };

    const submitEdit = () => {
        if (!target) return;
        editForm.put(`/superadmin/announcements/${target.id}`, {
            onSuccess: () => setEditOpen(false),
            preserveScroll: true,
        });
    };

    // ── Delete ──
    const openDelete = (a: Announcement) => {
        setTarget(a);
        setDeleteOpen(true);
    };

    const submitDelete = () => {
        if (!target) return;
        router.delete(`/superadmin/announcements/${target.id}`, {
            onSuccess: () => setDeleteOpen(false),
            preserveScroll: true,
        });
    };

    // ── Toggle ──
    const handleToggle = (a: Announcement) => {
        router.patch(`/superadmin/announcements/${a.id}/toggle`, {}, { preserveScroll: true });
    };

    return (
        <>
            <Head title="Announcements" />
            <div className="p-6 space-y-6 max-w-7xl mx-auto">

                {/* Flash */}
                {flash?.success && (
                    <div className="flex items-center gap-3 px-4 py-3 bg-[#2d5a27]/10 border border-[#2d5a27]/20 rounded-xl text-sm text-[#2d5a27] font-medium">
                        {flash.success}
                    </div>
                )}

                {/* ── Header ── */}
                <div className="flex items-start justify-between">
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">Superadmin</p>
                        <h1 className="text-2xl font-bold text-[#2d5a27]">Announcements</h1>
                        <p className="text-sm text-zinc-400 mt-0.5">Manage public announcements shown on the landing page</p>
                    </div>
                    <button
                        onClick={openAdd}
                        className="flex items-center gap-2 px-4 py-2 bg-[#2d5a27] text-white text-sm font-semibold rounded-xl hover:bg-[#234820] transition"
                    >
                        <Plus className="w-4 h-4" />
                        New Announcement
                    </button>
                </div>

                {/* ── Stat Cards ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
                        <p className="text-xs font-medium text-zinc-500 mb-1">Total Announcements</p>
                        <p className="text-2xl font-bold text-zinc-900">{stats.total}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
                        <p className="text-xs font-medium text-zinc-500 mb-1">Published</p>
                        <p className="text-2xl font-bold text-[#2d5a27]">{stats.published}</p>
                    </div>
                    <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-sm">
                        <p className="text-xs font-medium text-zinc-500 mb-1">Draft</p>
                        <p className="text-2xl font-bold text-[#c8920a]">{stats.draft}</p>
                    </div>
                </div>

                {/* ── Table ── */}
                <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-zinc-100 bg-zinc-50">
                                {['Title', 'Category', 'Date', 'Status', 'Created By', 'Actions'].map((h) => (
                                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {announcements.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-16 text-center">
                                        <div className="flex flex-col items-center gap-2 text-zinc-400">
                                            <Megaphone className="w-8 h-8" />
                                            <p className="text-sm">No announcements yet. Create your first one.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : announcements.map((a) => (
                                <tr key={a.id} className="hover:bg-zinc-50 transition">
                                    <td className="px-5 py-3.5 font-medium text-zinc-800 max-w-xs">
                                        <p className="truncate">{a.title}</p>
                                        <p className="text-xs text-zinc-400 truncate mt-0.5">{a.content.slice(0, 60)}…</p>
                                    </td>
                                    <td className="px-5 py-3.5">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-xl text-xs font-semibold capitalize ${categoryBadge[a.category] ?? 'bg-zinc-100 text-zinc-700'}`}>
                                            {categoryLabel[a.category]}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-zinc-600 whitespace-nowrap">{a.announcement_date}</td>
                                    <td className="px-5 py-3.5">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-xl text-xs font-semibold capitalize ${statusBadge[a.status]}`}>
                                            {a.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-3.5 text-zinc-500 whitespace-nowrap">{a.created_by}</td>
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={() => handleToggle(a)}
                                                title={a.status === 'published' ? 'Unpublish' : 'Publish'}
                                                className="flex items-center gap-1 h-7 px-2 text-xs border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 transition"
                                            >
                                                {a.status === 'published'
                                                    ? <EyeOff className="w-3 h-3" />
                                                    : <Eye className="w-3 h-3" />
                                                }
                                                {a.status === 'published' ? 'Unpublish' : 'Publish'}
                                            </button>
                                            <button
                                                onClick={() => openEdit(a)}
                                                className="flex items-center gap-1 h-7 px-2 text-xs border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 transition"
                                            >
                                                <Pencil className="w-3 h-3" />
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => openDelete(a)}
                                                className="flex items-center gap-1 h-7 px-2 text-xs border border-red-200 rounded-lg text-red-600 hover:bg-red-50 transition"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

            </div>

            {/* ── Add Dialog ── */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>New Announcement</DialogTitle>
                    </DialogHeader>
                    <AnnouncementForm form={addForm} />
                    <DialogFooter>
                        <button
                            onClick={() => setAddOpen(false)}
                            className="px-4 py-2 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={submitAdd}
                            disabled={addForm.processing}
                            className="px-4 py-2 bg-[#2d5a27] text-white text-sm font-semibold rounded-xl hover:bg-[#234820] transition disabled:opacity-50"
                        >
                            {addForm.processing ? 'Saving…' : 'Save Announcement'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Edit Dialog ── */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Edit Announcement</DialogTitle>
                    </DialogHeader>
                    <AnnouncementForm form={editForm} />
                    <DialogFooter>
                        <button
                            onClick={() => setEditOpen(false)}
                            className="px-4 py-2 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={submitEdit}
                            disabled={editForm.processing}
                            className="px-4 py-2 bg-[#2d5a27] text-white text-sm font-semibold rounded-xl hover:bg-[#234820] transition disabled:opacity-50"
                        >
                            {editForm.processing ? 'Saving…' : 'Save Announcement'}
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Delete Dialog ── */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete Announcement</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete <strong>{target?.title}</strong>? This will remove it from the landing page.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <button
                            onClick={() => setDeleteOpen(false)}
                            className="px-4 py-2 border border-zinc-200 rounded-xl text-sm font-semibold text-zinc-600 hover:bg-zinc-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={submitDelete}
                            className="px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition"
                        >
                            Delete
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

// ── Reusable form fields component ────────────────────────────────────────────

type FormFields = {
    title: string;
    content: string;
    category: string;
    status: string;
    announcement_date: string;
};

function AnnouncementForm({ form }: { form: ReturnType<typeof useForm<FormFields>> }) {
    return (
        <div className="space-y-4 py-2">
            {/* Title */}
            <div className="space-y-1.5">
                <Label>Title <span className="text-red-500">*</span></Label>
                <input
                    type="text"
                    value={form.data.title}
                    onChange={(e) => form.setData('title', e.target.value)}
                    placeholder="Announcement title"
                    className="w-full h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:ring-2 focus:ring-[#2d5a27] outline-none"
                />
                <InputError message={form.errors.title} />
            </div>

            {/* Content */}
            <div className="space-y-1.5">
                <Label>Content <span className="text-red-500">*</span></Label>
                <textarea
                    value={form.data.content}
                    onChange={(e) => form.setData('content', e.target.value)}
                    placeholder="Announcement details…"
                    rows={4}
                    className="w-full min-h-32 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-700 focus:ring-2 focus:ring-[#2d5a27] outline-none resize-none"
                />
                <InputError message={form.errors.content} />
            </div>

            {/* Category + Status */}
            <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                    <Label>Category <span className="text-red-500">*</span></Label>
                    <select
                        value={form.data.category}
                        onChange={(e) => form.setData('category', e.target.value)}
                        className="w-full h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:ring-2 focus:ring-[#2d5a27] outline-none"
                    >
                        {CATEGORIES.map((c) => (
                            <option key={c} value={c}>{categoryLabel[c]}</option>
                        ))}
                    </select>
                    <InputError message={form.errors.category} />
                </div>
                <div className="space-y-1.5">
                    <Label>Status <span className="text-red-500">*</span></Label>
                    <select
                        value={form.data.status}
                        onChange={(e) => form.setData('status', e.target.value)}
                        className="w-full h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:ring-2 focus:ring-[#2d5a27] outline-none"
                    >
                        {STATUSES.map((s) => (
                            <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                    </select>
                    <InputError message={form.errors.status} />
                </div>
            </div>

            {/* Date */}
            <div className="space-y-1.5">
                <Label>Announcement Date <span className="text-red-500">*</span></Label>
                <input
                    type="date"
                    value={form.data.announcement_date}
                    onChange={(e) => form.setData('announcement_date', e.target.value)}
                    className="w-full h-9 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 focus:ring-2 focus:ring-[#2d5a27] outline-none"
                />
                <InputError message={form.errors.announcement_date} />
            </div>
        </div>
    );
}
