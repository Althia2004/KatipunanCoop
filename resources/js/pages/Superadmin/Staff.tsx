import { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Pencil, Trash2, Search, X } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import InputError from '@/components/input-error';

// ── Types ─────────────────────────────────────────────────────────────────────

interface StaffUser {
    id: number;
    name: string;
    email: string;
    role: string;
    email_verified_at: string | null;
    created_at: string;
}

interface Props {
    staff: StaffUser[];
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

// ── Component ─────────────────────────────────────────────────────────────────

export default function SuperadminStaff({ staff }: Props) {
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<StaffUser | null>(null);
    const [deletingUser, setDeletingUser] = useState<StaffUser | null>(null);

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

    return (
        <>
            <Head title="Staff Management" />

            <div className="p-6 space-y-6 max-w-300 mx-auto">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 mb-1">
                        Staff Management
                    </p>
                    <h1 className="text-2xl font-bold text-[#2d5a27]">All Staff</h1>
                    <p className="text-sm text-zinc-400 mt-0.5">
                        Manage staff accounts, roles, and access levels.
                    </p>
                </div>

                {message && (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
                        {message}
                        <button onClick={() => setMessage(null)} className="ml-4 text-green-500 hover:text-green-700">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                <Card className="border border-zinc-200 shadow-sm">
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <p className="text-sm font-semibold text-zinc-700">
                                {filteredStaff.length} staff member{filteredStaff.length !== 1 ? 's' : ''}
                            </p>
                            <Button size="sm" onClick={() => setAddOpen(true)}
                                className="bg-[#2d5a27] hover:bg-[#1e3e1a] text-white gap-1.5">
                                <Plus className="w-4 h-4" /> Add Staff
                            </Button>
                        </div>
                        <div className="flex gap-2 mt-3 flex-wrap">
                            <div className="relative flex-1 min-w-45">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
                                <Input className="pl-8 h-8 text-sm" placeholder="Search by name or email…"
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
                                        <th className="text-left px-4 py-2.5 font-medium text-zinc-500 text-xs uppercase tracking-wide">Joined</th>
                                        <th className="text-right px-4 py-2.5 font-medium text-zinc-500 text-xs uppercase tracking-wide">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-zinc-100">
                                    {filteredStaff.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="text-center py-10 text-zinc-400 text-sm">
                                                No staff members found.
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
                                            <td className="px-4 py-3 text-zinc-400 text-xs">
                                                {new Date(u.created_at).toLocaleDateString('en-PH', {
                                                    year: 'numeric', month: 'short', day: 'numeric',
                                                })}
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
