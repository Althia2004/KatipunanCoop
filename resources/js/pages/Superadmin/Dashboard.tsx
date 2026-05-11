import { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Users, Clock, AlertCircle, UserCheck, Pencil, Trash2,
    Settings, ClipboardList, BarChart3, Plus, Search, X,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import InputError from '@/components/input-error';
import type { Auth } from '@/types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface StaffUser {
    id: number;
    name: string;
    email: string;
    role: string;
    email_verified_at: string | null;
    created_at: string;
}

interface ApprovalItem {
    id: number;
    type: string;
    requestedBy: string;
    date: string;
    priority: 'high' | 'medium' | 'low';
}

interface AuditItem {
    id: number;
    action: string;
    performedBy: string;
    target: string;
    datetime: string;
    type: 'created' | 'updated' | 'deleted' | 'login';
}

interface Props {
    stats: {
        totalMembers: number;
        pendingApprovals: number;
        activeStaff: number;
        systemAlerts: number;
    };
    staff: StaffUser[];
    recentApprovals: ApprovalItem[];
    recentAudit: AuditItem[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const ROLES = ['admin', 'manager', 'board', 'bookkeeper', 'hr', 'staff', 'superadmin'] as const;

const roleBadgeClass = (role: string): string =>
    ({
        superadmin: 'bg-purple-100 text-purple-700',
        admin:      'bg-green-100 text-green-700',
        manager:    'bg-blue-100 text-blue-700',
        board:      'bg-amber-100 text-amber-700',
        bookkeeper: 'bg-teal-100 text-teal-700',
        hr:         'bg-pink-100 text-pink-700',
        staff:      'bg-zinc-100 text-zinc-600',
    } as Record<string, string>)[role] ?? 'bg-zinc-100 text-zinc-600';

const priorityBadgeClass = (p: string): string =>
    ({ high: 'bg-red-100 text-red-700', medium: 'bg-amber-100 text-amber-700', low: 'bg-green-100 text-green-700' }[p] ?? 'bg-zinc-100 text-zinc-600');

const SYSTEM_SETTINGS_DISPLAY = [
    { label: 'Lending Interest Rate',    value: '3%' },
    { label: 'CA Interest Rate',         value: '2%' },
    { label: 'Late Payment Penalty',     value: '₱50' },
    { label: 'Manager Loan Limit',       value: '₱50,000' },
    { label: 'BOD Approval Threshold',   value: '80% of credit limit' },
    { label: 'MIGS Minimum Score',       value: '50 points' },
    { label: 'Dividend Allocation',      value: '70/30' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function SuperadminDashboard({ stats, staff, recentApprovals, recentAudit }: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const firstName = auth.user.name.split(' ')[0];
    const today = new Date().toLocaleDateString('en-PH', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    });

    // Staff table
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    // Dialogs
    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
    const [deletingUser, setDeletingUser] = useState<StaffUser | null>(null);

    // Flash message
    const [message, setMessage] = useState<string | null>(null);

    const addForm = useForm({ name: '', email: '', password: '', role: 'staff' });
    const editForm = useForm({ name: '', email: '', role: 'staff' });

    const filteredStaff = staff.filter(
        (u) =>
            (roleFilter === 'all' || u.role === roleFilter) &&
            (u.name.toLowerCase().includes(search.toLowerCase()) ||
                u.email.toLowerCase().includes(search.toLowerCase())),
    );

    function openEdit(u: StaffUser) {
        setEditingUser(u);
        editForm.setData({ name: u.name, email: u.email, role: u.role });
        setEditOpen(true);
    }

    function handleAdd(e: React.FormEvent) {
        e.preventDefault();
        addForm.post('/superadmin/staff', {
            onSuccess: () => { setAddOpen(false); addForm.reset(); setMessage('Staff member added successfully.'); },
        });
    }

    function handleEdit(e: React.FormEvent) {
        e.preventDefault();
        if (!editingUser) return;
        editForm.put(`/superadmin/staff/${editingUser.id}`, {
            onSuccess: () => { setEditOpen(false); setMessage('Staff member updated successfully.'); },
        });
    }

    function handleDelete() {
        if (!deletingUser) return;
        router.delete(`/superadmin/staff/${deletingUser.id}`, {
            onSuccess: () => { setDeleteOpen(false); setMessage('Staff member removed.'); },
        });
    }

    const statCards = [
        { icon: Users,       value: stats.totalMembers,     label: 'Total Members',     color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { icon: Clock,       value: stats.pendingApprovals, label: 'Pending Approvals', color: 'text-amber-600',   bg: 'bg-amber-50' },
        { icon: UserCheck,   value: stats.activeStaff,      label: 'Active Staff',      color: 'text-blue-600',    bg: 'bg-blue-50' },
        { icon: AlertCircle, value: stats.systemAlerts,     label: 'System Alerts',     color: 'text-red-500',     bg: 'bg-red-50' },
    ];

    const quickActions = [
        { label: 'Manage Staff',      desc: 'Add, edit, assign roles',    href: '/superadmin/staff',             icon: Users,        color: 'text-blue-600',    bg: 'bg-blue-50' },
        { label: 'System Settings',   desc: 'Interest rates, penalties',   href: '/superadmin/settings/interest', icon: Settings,     color: 'text-purple-600',  bg: 'bg-purple-50' },
        { label: 'Pending Approvals', desc: 'Review escalated items',      href: '/superadmin/approvals',         icon: ClipboardList,color: 'text-amber-600',   bg: 'bg-amber-50' },
        { label: 'Financial Reports', desc: 'View coop financials',        href: '/superadmin/reports/financial', icon: BarChart3,    color: 'text-emerald-600', bg: 'bg-emerald-50' },
    ];

    return (
        <>
            <Head title="Superadmin Dashboard" />

            <div className="p-6 space-y-8 max-w-350 mx-auto">

                {/* Welcome */}
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">
                        System Administrator
                    </p>
                    <h1 className="text-2xl font-bold text-[#2d5a27]">
                        Welcome back, {firstName} 👋
                    </h1>
                    <p className="text-sm text-zinc-400 mt-0.5">{today}</p>
                </div>

                {/* Flash */}
                {message && (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                        {message}
                        <button onClick={() => setMessage(null)} className="ml-4 text-green-500 hover:text-green-700">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {statCards.map((s) => (
                        <Card key={s.label} className="border border-zinc-200 shadow-sm">
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.bg}`}>
                                    <s.icon className={`w-5 h-5 ${s.color}`} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-zinc-900">{s.value}</p>
                                    <p className="text-xs text-zinc-500">{s.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActions.map((a) => (
                        <Link key={a.label} href={a.href}
                            className="block bg-white border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${a.bg}`}>
                                <a.icon className={`w-5 h-5 ${a.color}`} />
                            </div>
                            <p className="font-semibold text-zinc-900 text-sm">{a.label}</p>
                            <p className="text-xs text-zinc-400 mt-0.5">{a.desc}</p>
                        </Link>
                    ))}
                </div>

                {/* Staff Table + Side Panels */}
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

                    {/* Staff Table — 2/3 */}
                    <Card className="xl:col-span-2 border border-zinc-200 shadow-sm">
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between gap-3 flex-wrap">
                                <h2 className="text-base font-semibold text-zinc-900">Staff Management</h2>
                                <Button size="sm" onClick={() => setAddOpen(true)}
                                    className="bg-[#2d5a27] hover:bg-[#1e3e1a] text-white gap-1.5">
                                    <Plus className="w-4 h-4" /> Add Staff
                                </Button>
                            </div>
                            <div className="flex gap-2 mt-3 flex-wrap">
                                <div className="relative flex-1 min-w-40">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                                    <Input className="pl-8 h-8 text-sm" placeholder="Search staff…"
                                        value={search} onChange={(e) => setSearch(e.target.value)} />
                                </div>
                                <select
                                    value={roleFilter}
                                    onChange={(e) => setRoleFilter(e.target.value)}
                                    className="h-8 rounded-md border border-zinc-200 bg-white px-2 text-sm text-zinc-700"
                                >
                                    <option value="all">All Roles</option>
                                    {ROLES.map((r) => (
                                        <option key={r} value={r}>{r}</option>
                                    ))}
                                </select>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-zinc-100 bg-zinc-50">
                                            <th className="text-left px-4 py-2.5 font-medium text-zinc-500 text-xs uppercase tracking-wide">Name</th>
                                            <th className="text-left px-4 py-2.5 font-medium text-zinc-500 text-xs uppercase tracking-wide">Email</th>
                                            <th className="text-left px-4 py-2.5 font-medium text-zinc-500 text-xs uppercase tracking-wide">Role</th>
                                            <th className="text-left px-4 py-2.5 font-medium text-zinc-500 text-xs uppercase tracking-wide">Status</th>
                                            <th className="text-right px-4 py-2.5 font-medium text-zinc-500 text-xs uppercase tracking-wide">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-zinc-100">
                                        {filteredStaff.length === 0 && (
                                            <tr>
                                                <td colSpan={5} className="text-center py-8 text-zinc-400 text-sm">
                                                    No staff found.
                                                </td>
                                            </tr>
                                        )}
                                        {filteredStaff.map((u) => (
                                            <tr key={u.id} className="hover:bg-zinc-50 transition">
                                                <td className="px-4 py-3 font-medium text-zinc-800">{u.name}</td>
                                                <td className="px-4 py-3 text-zinc-500">{u.email}</td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${roleBadgeClass(u.role)}`}>
                                                        {u.role}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${u.email_verified_at ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'}`}>
                                                        {u.email_verified_at ? 'Active' : 'Unverified'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button variant="ghost" size="icon"
                                                            className="w-7 h-7 text-zinc-400 hover:text-blue-600"
                                                            onClick={() => openEdit(u)}>
                                                            <Pencil className="w-3.5 h-3.5" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon"
                                                            className="w-7 h-7 text-zinc-400 hover:text-red-600"
                                                            onClick={() => { setDeletingUser(u); setDeleteOpen(true); }}>
                                                            <Trash2 className="w-3.5 h-3.5" />
                                                        </Button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Column */}
                    <div className="space-y-4">

                        {/* System Settings snapshot */}
                        <Card className="border border-zinc-200 shadow-sm">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-base font-semibold text-zinc-900">System Settings</h2>
                                    <Link href="/superadmin/settings/interest"
                                        className="text-xs text-[#2d5a27] font-medium hover:underline">
                                        Edit
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-0 pt-0">
                                {SYSTEM_SETTINGS_DISPLAY.map((s) => (
                                    <div key={s.label}
                                        className="flex justify-between items-center py-2 border-b border-zinc-100 last:border-0">
                                        <span className="text-xs text-zinc-500">{s.label}</span>
                                        <span className="text-xs font-semibold text-zinc-800">{s.value}</span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Pending Approvals */}
                        <Card className="border border-zinc-200 shadow-sm">
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-base font-semibold text-zinc-900">Pending Approvals</h2>
                                    <Link href="/superadmin/approvals"
                                        className="text-xs text-[#2d5a27] font-medium hover:underline">
                                        View all
                                    </Link>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-0">
                                {recentApprovals.length === 0 && (
                                    <p className="text-xs text-zinc-400 py-2">No pending approvals.</p>
                                )}
                                {recentApprovals.map((a, i) => (
                                    <div key={i}
                                        className="flex items-center justify-between py-2 border-b border-zinc-100 last:border-0">
                                        <div>
                                            <p className="text-xs font-medium text-zinc-800">{a.type}</p>
                                            <p className="text-[11px] text-zinc-400">{a.requestedBy} · {a.date}</p>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${priorityBadgeClass(a.priority)}`}>
                                            {a.priority}
                                        </span>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Audit Log */}
                <Card className="border border-zinc-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <h2 className="text-base font-semibold text-zinc-900">Recent Audit Log</h2>
                            <Link href="/superadmin/audit"
                                className="text-xs text-[#2d5a27] font-medium hover:underline">
                                View all
                            </Link>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {recentAudit.length === 0 ? (
                            <p className="text-sm text-zinc-400 py-4 text-center">
                                No audit records yet. Audit logging will be enabled in a future update.
                            </p>
                        ) : (
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-zinc-100">
                                        <th className="text-left py-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">Action</th>
                                        <th className="text-left py-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">Performed By</th>
                                        <th className="text-left py-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">Target</th>
                                        <th className="text-left py-2 text-xs font-medium text-zinc-500 uppercase tracking-wide">Date/Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentAudit.map((log) => (
                                        <tr key={log.id} className="border-b border-zinc-100 last:border-0">
                                            <td className="py-2 text-zinc-800">{log.action}</td>
                                            <td className="py-2 text-zinc-500">{log.performedBy}</td>
                                            <td className="py-2 text-zinc-500">{log.target}</td>
                                            <td className="py-2 text-zinc-400">{log.datetime}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ── Add Staff Dialog ── */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Add Staff Member</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAdd} className="space-y-4 mt-2">
                        <div className="grid gap-1.5">
                            <Label>Full Name</Label>
                            <Input value={addForm.data.name}
                                onChange={(e) => addForm.setData('name', e.target.value)} required />
                            <InputError message={addForm.errors.name} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Email</Label>
                            <Input type="email" value={addForm.data.email}
                                onChange={(e) => addForm.setData('email', e.target.value)} required />
                            <InputError message={addForm.errors.email} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Password</Label>
                            <Input type="password" value={addForm.data.password}
                                onChange={(e) => addForm.setData('password', e.target.value)} required />
                            <InputError message={addForm.errors.password} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Role</Label>
                            <select value={addForm.data.role}
                                onChange={(e) => addForm.setData('role', e.target.value)}
                                className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm">
                                {ROLES.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                            <InputError message={addForm.errors.role} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setAddOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit"
                                className="bg-[#2d5a27] hover:bg-[#1e3e1a] text-white"
                                disabled={addForm.processing}>
                                {addForm.processing ? 'Adding…' : 'Add Staff'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── Edit Staff Dialog ── */}
            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Staff Member</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleEdit} className="space-y-4 mt-2">
                        <div className="grid gap-1.5">
                            <Label>Full Name</Label>
                            <Input value={editForm.data.name}
                                onChange={(e) => editForm.setData('name', e.target.value)} required />
                            <InputError message={editForm.errors.name} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Email</Label>
                            <Input type="email" value={editForm.data.email}
                                onChange={(e) => editForm.setData('email', e.target.value)} required />
                            <InputError message={editForm.errors.email} />
                        </div>
                        <div className="grid gap-1.5">
                            <Label>Role</Label>
                            <select value={editForm.data.role}
                                onChange={(e) => editForm.setData('role', e.target.value)}
                                className="h-9 rounded-md border border-zinc-200 bg-white px-3 text-sm">
                                {ROLES.map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                            <InputError message={editForm.errors.role} />
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
                                Cancel
                            </Button>
                            <Button type="submit"
                                className="bg-[#2d5a27] hover:bg-[#1e3e1a] text-white"
                                disabled={editForm.processing}>
                                {editForm.processing ? 'Saving…' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ── Delete Confirm Dialog ── */}
            <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                <DialogContent className="max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Delete Staff Member</DialogTitle>
                    </DialogHeader>
                    <p className="text-sm text-zinc-600 mt-2">
                        Are you sure you want to delete{' '}
                        <strong>{deletingUser?.name}</strong>? This action cannot be undone.
                    </p>
                    <DialogFooter className="mt-4">
                        <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete}>Delete</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

