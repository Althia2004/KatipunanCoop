import { Head, useForm, Link } from '@inertiajs/react';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, User, Users, Heart } from 'lucide-react';
import AlertError from '@/components/alert-error';

// ── Types ────────────────────────────────────────────────────────────────────

interface BeneficiaryForm {
    first_name: string;
    middle_name: string;
    last_name: string;
    contact_number: string;
    address_street: string;
    address_barangay: string;
    address_city: string;
    address_province: string;
    relationship: string;
}

interface FormData {
    first_name: string;
    middle_name: string;
    last_name: string;
    contact_number: string;
    address_street: string;
    address_barangay: string;
    address_city: string;
    address_province: string;
    source_of_income: string;
    date_of_birth: string;
    gender: string;
    id_number: string;
    notes: string;
    co_maker: {
        first_name: string;
        middle_name: string;
        last_name: string;
        contact_number: string;
        address_street: string;
        address_barangay: string;
        address_city: string;
        address_province: string;
        source_of_income: string;
        relationship: string;
    };
    beneficiaries: BeneficiaryForm[];
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const EMPTY_BENEFICIARY: BeneficiaryForm = {
    first_name: '', middle_name: '', last_name: '', contact_number: '',
    address_street: '', address_barangay: '', address_city: '', address_province: '',
    relationship: '',
};

const TABS = [
    { id: 'personal',     label: 'Personal Info',  icon: User },
    { id: 'comaker',      label: 'Co-Maker',        icon: Users },
    { id: 'beneficiaries',label: 'Beneficiaries',   icon: Heart },
];

// ── Sub-components ───────────────────────────────────────────────────────────

function FieldRow({ children }: { children: React.ReactNode }) {
    return <div className="grid grid-cols-1 md:grid-cols-2 gap-5">{children}</div>;
}

function Field({
    label, error, children, full,
}: {
    label: string;
    error?: string;
    children: React.ReactNode;
    full?: boolean;
}) {
    return (
        <div className={full ? 'md:col-span-2' : ''}>
            <label className="block text-sm font-bold text-zinc-700 mb-1">{label}</label>
            {children}
            {error && <p className="text-red-500 text-xs mt-1 font-medium">{error}</p>}
        </div>
    );
}

function TextInput({
    value, onChange, placeholder, type = 'text', error,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
    error?: string;
}) {
    return (
        <input
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={e => onChange(e.target.value)}
            className={`w-full text-zinc-900 bg-zinc-50 rounded-xl border p-3 focus:ring-2 focus:ring-[#4c9f5f] focus:border-[#4c9f5f] outline-none transition-all ${
                error ? 'border-red-400 ring-1 ring-red-400' : 'border-zinc-300'
            }`}
        />
    );
}

function AddressFields({
    prefix, data, setField, errors,
}: {
    prefix: string;
    data: { address_street: string; address_barangay: string; address_city: string; address_province: string };
    setField: (key: string, value: string) => void;
    errors: Record<string, string | undefined>;
}) {
    return (
        <>
            <FieldRow>
                <Field label="Street / Purok" error={errors[`${prefix}address_street`]} full>
                    <TextInput
                        value={data.address_street}
                        onChange={v => setField('address_street', v)}
                        placeholder="House No. / Street / Purok"
                        error={errors[`${prefix}address_street`]}
                    />
                </Field>
            </FieldRow>
            <FieldRow>
                <Field label="Barangay" error={errors[`${prefix}address_barangay`]}>
                    <TextInput
                        value={data.address_barangay}
                        onChange={v => setField('address_barangay', v)}
                        placeholder="Barangay"
                        error={errors[`${prefix}address_barangay`]}
                    />
                </Field>
                <Field label="City / Municipality" error={errors[`${prefix}address_city`]}>
                    <TextInput
                        value={data.address_city}
                        onChange={v => setField('address_city', v)}
                        placeholder="City / Municipality"
                        error={errors[`${prefix}address_city`]}
                    />
                </Field>
            </FieldRow>
            <FieldRow>
                <Field label="Province" error={errors[`${prefix}address_province`]}>
                    <TextInput
                        value={data.address_province}
                        onChange={v => setField('address_province', v)}
                        placeholder="Province"
                        error={errors[`${prefix}address_province`]}
                    />
                </Field>
            </FieldRow>
        </>
    );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function MemberRegistrationCreate() {
    const [activeTab, setActiveTab] = useState<'personal' | 'comaker' | 'beneficiaries'>('personal');

    const { data, setData, post, processing, errors } = useForm<FormData>({
        first_name: '', middle_name: '', last_name: '',
        contact_number: '', address_street: '', address_barangay: '',
        address_city: '', address_province: '',
        source_of_income: '', date_of_birth: '', gender: '', id_number: '', notes: '',
        co_maker: {
            first_name: '', middle_name: '', last_name: '', contact_number: '',
            address_street: '', address_barangay: '', address_city: '', address_province: '',
            source_of_income: '', relationship: '',
        },
        beneficiaries: [{ ...EMPTY_BENEFICIARY }],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/loan/member-registration');
    };

    // Helper: set a field on data.co_maker
    const setCoMakerField = (key: string, value: string) => {
        setData('co_maker', { ...data.co_maker, [key]: value });
    };

    // Helper: set a field on a specific beneficiary
    const setBeneficiaryField = (index: number, key: string, value: string) => {
        const updated = data.beneficiaries.map((b, i) =>
            i === index ? { ...b, [key]: value } : b
        );
        setData('beneficiaries', updated);
    };

    const addBeneficiary = () => {
        setData('beneficiaries', [...data.beneficiaries, { ...EMPTY_BENEFICIARY }]);
    };

    const removeBeneficiary = (index: number) => {
        if (data.beneficiaries.length === 1) return;
        setData('beneficiaries', data.beneficiaries.filter((_, i) => i !== index));
    };

    const topErrors = Object.values(errors).filter(Boolean) as string[];

    return (
        <>
            <Head title="New Member Registration" />

            <div className="p-8 max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center gap-4 border-b border-zinc-200 pb-6">
                    <Link
                        href="/loan/member-registration"
                        className="p-2 hover:bg-zinc-100 rounded-lg transition text-zinc-400 hover:text-zinc-700"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-[#2d4734]">New Member Registration</h1>
                        <p className="text-zinc-500 font-medium">
                            Fill out all sections on behalf of the applicant.
                        </p>
                    </div>
                </div>

                {/* Global Errors */}
                {topErrors.length > 0 && (
                    <AlertError errors={topErrors} title="Please correct the following errors:" />
                )}

                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Tab Navigation */}
                    <div className="flex gap-1 p-1 bg-zinc-100 rounded-2xl w-fit">
                        {TABS.map(tab => (
                            <button
                                key={tab.id}
                                type="button"
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-white text-[#2d4734] shadow-sm'
                                        : 'text-zinc-500 hover:text-zinc-700'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* ── SECTION 1: Personal Information ── */}
                    {activeTab === 'personal' && (
                        <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-5">
                            <h2 className="text-lg font-bold text-zinc-800 border-b border-zinc-100 pb-3">
                                Personal Information
                            </h2>

                            <FieldRow>
                                <Field label="First Name *" error={errors.first_name}>
                                    <TextInput value={data.first_name} onChange={v => setData('first_name', v)} placeholder="Juan" error={errors.first_name} />
                                </Field>
                                <Field label="Middle Name" error={errors.middle_name}>
                                    <TextInput value={data.middle_name} onChange={v => setData('middle_name', v)} placeholder="Santos" />
                                </Field>
                            </FieldRow>
                            <FieldRow>
                                <Field label="Last Name *" error={errors.last_name}>
                                    <TextInput value={data.last_name} onChange={v => setData('last_name', v)} placeholder="Dela Cruz" error={errors.last_name} />
                                </Field>
                                <Field label="Contact Number *" error={errors.contact_number}>
                                    <TextInput value={data.contact_number} onChange={v => setData('contact_number', v)} placeholder="09XX-XXX-XXXX" error={errors.contact_number} />
                                </Field>
                            </FieldRow>

                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider pt-2">Complete Address</p>
                            <AddressFields
                                prefix=""
                                data={data}
                                setField={(k, v) => setData(k as keyof FormData, v as never)}
                                errors={errors}
                            />

                            <FieldRow>
                                <Field label="Source of Income *" error={errors.source_of_income}>
                                    <TextInput value={data.source_of_income} onChange={v => setData('source_of_income', v)} placeholder="e.g. Farming, Livestock" error={errors.source_of_income} />
                                </Field>
                                <Field label="Date of Birth *" error={errors.date_of_birth}>
                                    <TextInput type="date" value={data.date_of_birth} onChange={v => setData('date_of_birth', v)} error={errors.date_of_birth} />
                                </Field>
                            </FieldRow>

                            <FieldRow>
                                <Field label="Gender *" error={errors.gender}>
                                    <select
                                        value={data.gender}
                                        onChange={e => setData('gender', e.target.value)}
                                        className={`w-full text-zinc-900 bg-zinc-50 rounded-xl border p-3 focus:ring-2 focus:ring-[#4c9f5f] focus:border-[#4c9f5f] outline-none transition-all ${errors.gender ? 'border-red-400' : 'border-zinc-300'}`}
                                    >
                                        <option value="">Select gender...</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                    {errors.gender && <p className="text-red-500 text-xs mt-1 font-medium">{errors.gender}</p>}
                                </Field>
                                <Field label="NIC / Government ID Number *" error={errors.id_number}>
                                    <TextInput value={data.id_number} onChange={v => setData('id_number', v)} placeholder="PhilSys / PSN / UMID etc." error={errors.id_number} />
                                </Field>
                            </FieldRow>

                            <Field label="Additional Notes" full>
                                <textarea
                                    value={data.notes}
                                    onChange={e => setData('notes', e.target.value)}
                                    rows={3}
                                    placeholder="Any additional remarks about the applicant..."
                                    className="w-full text-zinc-900 bg-zinc-50 rounded-xl border border-zinc-300 p-3 focus:ring-2 focus:ring-[#4c9f5f] focus:border-[#4c9f5f] outline-none transition-all"
                                />
                            </Field>

                            <div className="flex justify-end pt-2">
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('comaker')}
                                    className="flex items-center gap-2 px-6 py-3 bg-[#2d4734] text-white rounded-xl font-bold hover:bg-[#1e3023] transition active:scale-95"
                                >
                                    Next: Co-Maker <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── SECTION 2: Co-Maker ── */}
                    {activeTab === 'comaker' && (
                        <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-5">
                            <h2 className="text-lg font-bold text-zinc-800 border-b border-zinc-100 pb-3">
                                Co-Maker Information
                            </h2>

                            <FieldRow>
                                <Field label="First Name *" error={errors['co_maker.first_name']}>
                                    <TextInput value={data.co_maker.first_name} onChange={v => setCoMakerField('first_name', v)} placeholder="First Name" error={errors['co_maker.first_name']} />
                                </Field>
                                <Field label="Middle Name" error={errors['co_maker.middle_name']}>
                                    <TextInput value={data.co_maker.middle_name} onChange={v => setCoMakerField('middle_name', v)} placeholder="Middle Name" />
                                </Field>
                            </FieldRow>
                            <FieldRow>
                                <Field label="Last Name *" error={errors['co_maker.last_name']}>
                                    <TextInput value={data.co_maker.last_name} onChange={v => setCoMakerField('last_name', v)} placeholder="Last Name" error={errors['co_maker.last_name']} />
                                </Field>
                                <Field label="Contact Number *" error={errors['co_maker.contact_number']}>
                                    <TextInput value={data.co_maker.contact_number} onChange={v => setCoMakerField('contact_number', v)} placeholder="09XX-XXX-XXXX" error={errors['co_maker.contact_number']} />
                                </Field>
                            </FieldRow>

                            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider pt-2">Complete Address</p>
                            <AddressFields
                                prefix="co_maker."
                                data={data.co_maker}
                                setField={(k, v) => setCoMakerField(k, v)}
                                errors={errors}
                            />

                            <FieldRow>
                                <Field label="Source of Income *" error={errors['co_maker.source_of_income']}>
                                    <TextInput value={data.co_maker.source_of_income} onChange={v => setCoMakerField('source_of_income', v)} placeholder="e.g. Farming, Livestock" error={errors['co_maker.source_of_income']} />
                                </Field>
                                <Field label="Relationship to Applicant *" error={errors['co_maker.relationship']}>
                                    <TextInput value={data.co_maker.relationship} onChange={v => setCoMakerField('relationship', v)} placeholder="e.g. Spouse, Father, Friend" error={errors['co_maker.relationship']} />
                                </Field>
                            </FieldRow>

                            <div className="flex justify-between pt-2">
                                <button type="button" onClick={() => setActiveTab('personal')} className="flex items-center gap-2 px-6 py-3 text-zinc-600 font-bold hover:bg-zinc-100 rounded-xl transition">
                                    <ChevronLeft className="w-4 h-4" /> Back
                                </button>
                                <button type="button" onClick={() => setActiveTab('beneficiaries')} className="flex items-center gap-2 px-6 py-3 bg-[#2d4734] text-white rounded-xl font-bold hover:bg-[#1e3023] transition active:scale-95">
                                    Next: Beneficiaries <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* ── SECTION 3: Beneficiaries ── */}
                    {activeTab === 'beneficiaries' && (
                        <div className="space-y-4">
                            {data.beneficiaries.map((b, idx) => (
                                <div key={idx} className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-5">
                                    <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                                        <h2 className="text-lg font-bold text-zinc-800">
                                            Beneficiary #{idx + 1}
                                        </h2>
                                        {data.beneficiaries.length > 1 && (
                                            <button
                                                type="button"
                                                onClick={() => removeBeneficiary(idx)}
                                                className="flex items-center gap-1.5 text-red-500 hover:text-red-700 text-sm font-semibold hover:bg-red-50 px-3 py-1.5 rounded-lg transition"
                                            >
                                                <Trash2 className="w-4 h-4" /> Remove
                                            </button>
                                        )}
                                    </div>

                                    <FieldRow>
                                        <Field label="First Name *" error={errors[`beneficiaries.${idx}.first_name`]}>
                                            <TextInput value={b.first_name} onChange={v => setBeneficiaryField(idx, 'first_name', v)} placeholder="First Name" error={errors[`beneficiaries.${idx}.first_name`]} />
                                        </Field>
                                        <Field label="Middle Name">
                                            <TextInput value={b.middle_name} onChange={v => setBeneficiaryField(idx, 'middle_name', v)} placeholder="Middle Name" />
                                        </Field>
                                    </FieldRow>
                                    <FieldRow>
                                        <Field label="Last Name *" error={errors[`beneficiaries.${idx}.last_name`]}>
                                            <TextInput value={b.last_name} onChange={v => setBeneficiaryField(idx, 'last_name', v)} placeholder="Last Name" error={errors[`beneficiaries.${idx}.last_name`]} />
                                        </Field>
                                        <Field label="Contact Number *" error={errors[`beneficiaries.${idx}.contact_number`]}>
                                            <TextInput value={b.contact_number} onChange={v => setBeneficiaryField(idx, 'contact_number', v)} placeholder="09XX-XXX-XXXX" error={errors[`beneficiaries.${idx}.contact_number`]} />
                                        </Field>
                                    </FieldRow>

                                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider pt-2">Complete Address</p>
                                    <AddressFields
                                        prefix={`beneficiaries.${idx}.`}
                                        data={b}
                                        setField={(k, v) => setBeneficiaryField(idx, k, v)}
                                        errors={errors}
                                    />

                                    <FieldRow>
                                        <Field label="Relationship to Applicant *" error={errors[`beneficiaries.${idx}.relationship`]}>
                                            <TextInput value={b.relationship} onChange={v => setBeneficiaryField(idx, 'relationship', v)} placeholder="e.g. Spouse, Father, Brother" error={errors[`beneficiaries.${idx}.relationship`]} />
                                        </Field>
                                    </FieldRow>
                                </div>
                            ))}

                            <button
                                type="button"
                                onClick={addBeneficiary}
                                className="flex items-center gap-2 px-5 py-3 border-2 border-dashed border-zinc-300 text-zinc-500 font-semibold rounded-2xl w-full justify-center hover:border-[#4c9f5f] hover:text-[#4c9f5f] transition"
                            >
                                <Plus className="w-4 h-4" /> Add Another Beneficiary
                            </button>

                            <div className="flex justify-between pt-2">
                                <button type="button" onClick={() => setActiveTab('comaker')} className="flex items-center gap-2 px-6 py-3 text-zinc-600 font-bold hover:bg-zinc-100 rounded-xl transition">
                                    <ChevronLeft className="w-4 h-4" /> Back
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-8 py-3 bg-[#4c9f5f] text-white rounded-xl font-bold hover:bg-[#3d814d] disabled:opacity-50 shadow-lg shadow-emerald-900/15 transition-all active:scale-95"
                                >
                                    {processing ? 'Submitting...' : 'Submit Registration'}
                                </button>
                            </div>
                        </div>
                    )}
                </form>
            </div>
        </>
    );
}
