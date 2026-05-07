import { Head, Link, useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    ChevronLeft, Calendar, MapPin, Phone, User, Users, Heart,
    CheckCircle2, Clock, Circle, ChevronRight, Plus, Pencil,
    Trash2, BookOpenCheck, X, Check, KeyRound,
} from 'lucide-react';
import type {
    MemberRegistration,
    AvailableSeminar,
    Beneficiary,
    RegistrationStatus,
} from '@/types/member-registration';

// ── Types ────────────────────────────────────────────────────────────────────

interface Props {
    registration: MemberRegistration;
    availableSeminars: AvailableSeminar[];
    has_account: boolean;
    account_email: string | null;
}

// ── Status Stepper ───────────────────────────────────────────────────────────

const STATUS_STEPS: { status: RegistrationStatus; label: string }[] = [
    { status: 'pending',           label: 'Pending' },
    { status: 'seminar_scheduled', label: 'Seminar Scheduled' },
    { status: 'seminar_attended',  label: 'Seminar Attended' },
    { status: 'approved',          label: 'Approved' },
];

const STATUS_ORDER: Record<RegistrationStatus, number> = {
    pending:           0,
    seminar_scheduled: 1,
    seminar_attended:  2,
    for_bod_approval:  2,
    approved:          3,
    rejected:          -1,
};

function StatusStepper({ current }: { current: RegistrationStatus }) {
    const isRejected = current === 'rejected';
    const currentIdx = STATUS_ORDER[current] ?? 0;

    return (
        <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider mb-5">
                Registration Status
            </h3>

            {isRejected ? (
                <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                    <X className="w-5 h-5 text-red-500" />
                    <div>
                        <p className="font-bold text-red-700">Rejected</p>
                        <p className="text-sm text-red-500">This application was not approved by the superadmin.</p>
                    </div>
                </div>
            ) : (
                <div className="flex items-start gap-0">
                    {STATUS_STEPS.map((step, idx) => {
                        const done    = idx < currentIdx;
                        const active  = idx === currentIdx;
                        const pending = idx > currentIdx;

                        return (
                            <div key={step.status} className="flex flex-1 flex-col items-center">
                                <div className="flex w-full items-center">
                                    {/* Left connector */}
                                    <div className={`flex-1 h-0.5 ${idx === 0 ? 'invisible' : done || active ? 'bg-[#4c9f5f]' : 'bg-zinc-200'}`} />

                                    {/* Circle */}
                                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                                        done   ? 'bg-[#4c9f5f] border-[#4c9f5f] text-white' :
                                        active ? 'bg-white border-[#4c9f5f] text-[#4c9f5f]' :
                                                 'bg-white border-zinc-300 text-zinc-300'
                                    }`}>
                                        {done ? <Check className="w-4 h-4" /> :
                                         active ? <Circle className="w-3 h-3 fill-current" /> :
                                                  <Circle className="w-3 h-3" />}
                                    </div>

                                    {/* Right connector */}
                                    <div className={`flex-1 h-0.5 ${idx === STATUS_STEPS.length - 1 ? 'invisible' : done ? 'bg-[#4c9f5f]' : 'bg-zinc-200'}`} />
                                </div>
                                <p className={`mt-2 text-[11px] font-semibold text-center leading-tight max-w-[80px] ${
                                    active ? 'text-[#2d4734]' : done ? 'text-emerald-600' : 'text-zinc-400'
                                }`}>
                                    {step.label}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ── Detail Section ───────────────────────────────────────────────────────────

function DetailCard({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
    return (
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-2">
                <Icon className="w-4 h-4 text-[#4c9f5f]" />
                <h3 className="font-bold text-zinc-700">{title}</h3>
            </div>
            <div className="p-6">{children}</div>
        </div>
    );
}

function InfoGrid({ rows }: { rows: { label: string; value: string | null | undefined }[] }) {
    return (
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {rows.map(({ label, value }) => (
                <div key={label}>
                    <dt className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{label}</dt>
                    <dd className="mt-1 text-zinc-900 font-medium">{value || <span className="text-zinc-400 italic">—</span>}</dd>
                </div>
            ))}
        </dl>
    );
}

// ── Beneficiary Form Modal ────────────────────────────────────────────────────

function BeneficiaryModal({
    registrationId,
    existing,
    onClose,
}: {
    registrationId: number;
    existing?: Beneficiary;
    onClose: () => void;
}) {
    const isEdit = !!existing;
    const { data, setData, post, patch, processing, errors } = useForm({
        first_name:       existing?.first_name       ?? '',
        middle_name:      existing?.middle_name       ?? '',
        last_name:        existing?.last_name         ?? '',
        contact_number:   existing?.contact_number    ?? '',
        address_street:   existing?.address_street    ?? '',
        address_barangay: existing?.address_barangay  ?? '',
        address_city:     existing?.address_city      ?? '',
        address_province: existing?.address_province  ?? '',
        relationship:     existing?.relationship      ?? '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            patch(`/loan/member-registration/${registrationId}/beneficiaries/${existing!.id}`, {
                onSuccess: onClose,
            });
        } else {
            post(`/loan/member-registration/${registrationId}/beneficiaries`, {
                onSuccess: onClose,
            });
        }
    };

    const field = (key: keyof typeof data, label: string, placeholder?: string) => (
        <div>
            <label className="block text-xs font-bold text-zinc-600 mb-1">{label}</label>
            <input
                type="text"
                value={data[key] as string}
                placeholder={placeholder}
                onChange={e => setData(key, e.target.value)}
                className={`w-full text-zinc-900 bg-zinc-50 rounded-lg border p-2.5 text-sm focus:ring-2 focus:ring-[#4c9f5f] focus:border-[#4c9f5f] outline-none transition-all ${
                    errors[key] ? 'border-red-400' : 'border-zinc-300'
                }`}
            />
            {errors[key] && <p className="text-red-500 text-xs mt-0.5">{errors[key]}</p>}
        </div>
    );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                    <h2 className="text-lg font-bold text-[#2d4734]">
                        {isEdit ? 'Edit Beneficiary' : 'Add Beneficiary'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-zinc-200 rounded-full transition">
                        <X className="w-5 h-5 text-zinc-400" />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {field('first_name',   'First Name *', 'First Name')}
                        {field('middle_name',  'Middle Name',  'Middle Name')}
                        {field('last_name',    'Last Name *',  'Last Name')}
                        {field('contact_number', 'Contact Number *', '09XX-XXX-XXXX')}
                        {field('address_street',   'Street / Purok *', 'House No. / Street')}
                        {field('address_barangay', 'Barangay *', 'Barangay')}
                        {field('address_city',     'City / Municipality *', 'City')}
                        {field('address_province', 'Province *', 'Province')}
                        {field('relationship', 'Relationship to Applicant *', 'e.g. Spouse, Father, Brother')}
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-5 py-2 border border-zinc-200 rounded-xl font-semibold text-zinc-600 hover:bg-zinc-50 transition text-sm">
                            Cancel
                        </button>
                        <button type="submit" disabled={processing} className="px-6 py-2 bg-[#4c9f5f] text-white rounded-xl font-bold hover:bg-[#3d814d] disabled:opacity-50 transition text-sm">
                            {processing ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Beneficiary'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function MemberRegistrationShow({ registration, availableSeminars, has_account, account_email }: Props) {
    const [beneficiaryModal, setBeneficiaryModal] = useState<'add' | Beneficiary | null>(null);

    // Assign seminar form
    const assignForm = useForm({ seminar_id: '' });
    const handleAssignSeminar = (e: React.FormEvent) => {
        e.preventDefault();
        assignForm.patch(`/loan/member-registration/${registration.id}/assign-seminar`);
    };

    // Account assignment form
    const accountForm = useForm({ email: '', password: '' });
    const handleAssignAccount = (e: React.FormEvent) => {
        e.preventDefault();
        accountForm.post(`/loan/member-registration/${registration.id}/assign-account`);
    };

    // Confirm attendance
    const handleConfirmAttendance = () => {
        router.patch(`/loan/member-registration/${registration.id}/confirm-attendance`);
    };

    // Delete beneficiary
    const handleDeleteBeneficiary = (beneficiaryId: number) => {
        router.delete(`/loan/member-registration/${registration.id}/beneficiaries/${beneficiaryId}`, {
            preserveScroll: true,
        });
    };

    const formatDate = (d: string) => new Date(d).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' });
    const formatDateTime = (d: string) => new Date(d).toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    return (
        <>
            <Head title={`Registration — ${registration.first_name} ${registration.last_name}`} />

            <div className="p-8 max-w-5xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-4 border-b border-zinc-200 pb-6">
                    <Link
                        href="/loan/member-registration"
                        className="p-2 hover:bg-zinc-100 rounded-lg transition text-zinc-400 hover:text-zinc-700"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold text-[#2d4734]">
                            {registration.first_name} {registration.middle_name ? registration.middle_name + ' ' : ''}{registration.last_name}
                        </h1>
                        <p className="text-zinc-500 font-medium text-sm">
                            Registration #{registration.id}
                            {registration.registered_by && ` · Encoded by ${registration.registered_by}`}
                            {' · '}{formatDate(registration.created_at)}
                        </p>
                    </div>
                </div>

                {/* Status Stepper */}
                <StatusStepper current={registration.status} />

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                    {/* Assign Seminar (pending or already scheduled → allow reassign) */}
                    {(registration.status === 'pending' || registration.status === 'seminar_scheduled') && (
                        <form onSubmit={handleAssignSeminar} className="flex gap-2 items-center bg-white border border-zinc-200 rounded-xl p-3 shadow-sm flex-wrap">
                            <BookOpenCheck className="w-4 h-4 text-[#4c9f5f] flex-shrink-0" />
                            <select
                                value={assignForm.data.seminar_id}
                                onChange={e => assignForm.setData('seminar_id', e.target.value)}
                                className="text-sm text-zinc-700 border border-zinc-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#4c9f5f] outline-none"
                            >
                                <option value="">Select a seminar...</option>
                                {availableSeminars.map(s => (
                                    <option key={s.id} value={s.id}>
                                        {s.title} — {formatDateTime(s.scheduled_at)}
                                    </option>
                                ))}
                            </select>
                            <button
                                type="submit"
                                disabled={assignForm.processing || !assignForm.data.seminar_id}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition"
                            >
                                {registration.status === 'seminar_scheduled' ? 'Reassign Seminar' : 'Assign Seminar'}
                            </button>
                        </form>
                    )}

                    {/* Confirm Attendance */}
                    {registration.status === 'seminar_scheduled' && (
                        <button
                            onClick={handleConfirmAttendance}
                            className="flex items-center gap-2 px-5 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition shadow-sm active:scale-95"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Confirm Attendance
                        </button>
                    )}

                    {/* Awaiting superadmin approval */}
                    {registration.status === 'seminar_attended' && (
                        <div className="flex items-center gap-2 px-5 py-3 bg-zinc-100 text-zinc-500 rounded-xl text-sm font-medium border border-zinc-200">
                            <Clock className="w-4 h-4" />
                            Awaiting superadmin approval
                        </div>
                    )}
                </div>

                {/* Account Assignment */}
{['for_bod_approval', 'seminar_attended', 'approved'].includes(registration.status) && (
    <DetailCard title="Member Portal Access" icon={KeyRound}>
        {has_account ? (
            <div className="flex items-center gap-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-700 text-sm font-medium">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                Portal account already created — <span className="font-bold">{account_email}</span>
            </div>
        ) : (
            <form onSubmit={handleAssignAccount} className="space-y-4">
                <p className="text-sm text-zinc-500">
                    Assign login credentials for this member's portal account.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-zinc-600 mb-1">Email Address *</label>
                        <input
                            type="email"
                            value={accountForm.data.email}
                            onChange={e => accountForm.setData('email', e.target.value)}
                            placeholder="member@example.com"
                            className={`w-full text-zinc-900 bg-zinc-50 rounded-lg border p-2.5 text-sm focus:ring-2 focus:ring-[#4c9f5f] focus:border-[#4c9f5f] outline-none transition-all ${accountForm.errors.email ? 'border-red-400' : 'border-zinc-300'}`}
                        />
                        {accountForm.errors.email && <p className="text-red-500 text-xs mt-0.5">{accountForm.errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-zinc-600 mb-1">Password *</label>
                        <input
                            type="password"
                            value={accountForm.data.password}
                            onChange={e => accountForm.setData('password', e.target.value)}
                            placeholder="Minimum 8 characters"
                            className={`w-full text-zinc-900 bg-zinc-50 rounded-lg border p-2.5 text-sm focus:ring-2 focus:ring-[#4c9f5f] focus:border-[#4c9f5f] outline-none transition-all ${accountForm.errors.password ? 'border-red-400' : 'border-zinc-300'}`}
                        />
                        {accountForm.errors.password && <p className="text-red-500 text-xs mt-0.5">{accountForm.errors.password}</p>}
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={accountForm.processing}
                    className="px-6 py-2.5 bg-[#2d5a27] text-white font-semibold rounded-xl hover:bg-[#1e3e1a] disabled:opacity-50 transition text-sm"
                >
                    {accountForm.processing ? 'Creating…' : 'Create Member Account'}
                </button>
            </form>
        )}
    </DetailCard>
)}
                {/* Seminar Details (if assigned) */}
                {registration.seminar && (
                    <DetailCard title="Assigned Seminar" icon={BookOpenCheck}>
                        <div className="flex flex-col sm:flex-row gap-6">
                            <div className="flex-1 space-y-2">
                                <p className="font-bold text-zinc-900 text-lg">{registration.seminar.title}</p>
                                <div className="flex items-center gap-2 text-zinc-500 text-sm">
                                    <Calendar className="w-4 h-4" />
                                    {formatDateTime(registration.seminar.scheduled_at)}
                                </div>
                                <div className="flex items-center gap-2 text-zinc-500 text-sm">
                                    <MapPin className="w-4 h-4" />
                                    {registration.seminar.location}
                                </div>
                            </div>
                            <div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                    registration.seminar.status === 'completed' ? 'bg-zinc-100 text-zinc-600' :
                                    registration.seminar.status === 'ongoing'   ? 'bg-amber-100 text-amber-700' :
                                                                                   'bg-emerald-100 text-emerald-700'
                                }`}>
                                    {registration.seminar.status}
                                </span>
                            </div>
                        </div>
                    </DetailCard>
                )}

                {/* Personal Details */}
                <DetailCard title="Personal Information" icon={User}>
                    <InfoGrid rows={[
                        { label: 'Full Name',        value: `${registration.first_name} ${registration.middle_name ?? ''} ${registration.last_name}`.trim() },
                        { label: 'Contact Number',   value: registration.contact_number },
                        { label: 'Date of Birth',    value: formatDate(registration.date_of_birth) },
                        { label: 'Gender',           value: registration.gender.charAt(0).toUpperCase() + registration.gender.slice(1) },
                        { label: 'ID / NIC Number',  value: registration.id_number },
                        { label: 'Source of Income', value: registration.source_of_income },
                        { label: 'Street / Purok',   value: registration.address_street },
                        { label: 'Barangay',         value: registration.address_barangay },
                        { label: 'City / Municipality', value: registration.address_city },
                        { label: 'Province',         value: registration.address_province },
                    ]} />
                    {registration.notes && (
                        <div className="mt-4 pt-4 border-t border-zinc-100">
                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1">Notes</p>
                            <p className="text-zinc-700 text-sm">{registration.notes}</p>
                        </div>
                    )}
                </DetailCard>

                {/* Co-Maker */}
                {registration.co_maker && (
                    <DetailCard title="Co-Maker" icon={Users}>
                        <InfoGrid rows={[
                            { label: 'Full Name',        value: `${registration.co_maker.first_name} ${registration.co_maker.middle_name ?? ''} ${registration.co_maker.last_name}`.trim() },
                            { label: 'Contact Number',   value: registration.co_maker.contact_number },
                            { label: 'Relationship',     value: registration.co_maker.relationship },
                            { label: 'Source of Income', value: registration.co_maker.source_of_income },
                            { label: 'Street / Purok',   value: registration.co_maker.address_street },
                            { label: 'Barangay',         value: registration.co_maker.address_barangay },
                            { label: 'City / Municipality', value: registration.co_maker.address_city },
                            { label: 'Province',         value: registration.co_maker.address_province },
                        ]} />
                    </DetailCard>
                )}

                {/* Beneficiaries */}
                <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Heart className="w-4 h-4 text-[#4c9f5f]" />
                            <h3 className="font-bold text-zinc-700">Beneficiaries</h3>
                            <span className="ml-1 px-2 py-0.5 bg-zinc-100 text-zinc-600 text-xs font-bold rounded-full">
                                {registration.beneficiaries.length}
                            </span>
                        </div>
                        <button
                            onClick={() => setBeneficiaryModal('add')}
                            className="flex items-center gap-1.5 px-4 py-2 bg-[#4c9f5f] text-white rounded-lg font-semibold text-sm hover:bg-[#3d814d] transition"
                        >
                            <Plus className="w-3.5 h-3.5" /> Add
                        </button>
                    </div>

                    {registration.beneficiaries.length === 0 ? (
                        <div className="p-10 text-center text-zinc-400">
                            <Heart className="w-8 h-8 mx-auto mb-2 text-zinc-200" />
                            <p className="font-medium">No beneficiaries listed yet.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-zinc-100">
                            {registration.beneficiaries.map((b, idx) => (
                                <div key={b.id} className="px-6 py-5 flex items-start justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-9 h-9 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-700 font-bold text-sm flex-shrink-0">
                                            {b.first_name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-zinc-900">
                                                {b.first_name} {b.middle_name ? b.middle_name + ' ' : ''}{b.last_name}
                                            </p>
                                            <p className="text-xs text-zinc-500 mt-0.5">
                                                {b.relationship} · {b.contact_number}
                                            </p>
                                            <p className="text-xs text-zinc-400">
                                                {b.address_barangay}, {b.address_city}, {b.address_province}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => setBeneficiaryModal(b)}
                                            className="p-2 hover:bg-zinc-100 rounded-lg transition text-zinc-400 hover:text-zinc-700"
                                            title="Edit"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteBeneficiary(b.id)}
                                            className="p-2 hover:bg-red-50 rounded-lg transition text-zinc-400 hover:text-red-500"
                                            title="Remove"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* Beneficiary Modal */}
            {beneficiaryModal !== null && (
                <BeneficiaryModal
                    registrationId={registration.id}
                    existing={beneficiaryModal === 'add' ? undefined : beneficiaryModal}
                    onClose={() => setBeneficiaryModal(null)}
                />
            )}
        </>
    );
}
