export interface CoMaker {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    contact_number: string;
    address_street: string;
    address_barangay: string;
    address_city: string;
    address_province: string;
    source_of_income: string;
    relationship: string;
}

export interface Beneficiary {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    contact_number: string;
    address_street: string;
    address_barangay: string;
    address_city: string;
    address_province: string;
    relationship: string;
}

export type RegistrationStatus =
    | 'pending'
    | 'seminar_scheduled'
    | 'seminar_attended'
    | 'for_bod_approval'
    | 'approved'
    | 'rejected';

export interface MemberRegistrationSummary {
    id: number;
    full_name: string;
    contact_number: string;
    status: RegistrationStatus;
    seminar: { id: number; title: string; scheduled_at: string } | null;
    registered_by: string | null;
    created_at: string;
}

export interface MemberRegistration {
    id: number;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    contact_number: string;
    address_street: string;
    address_barangay: string;
    address_city: string;
    address_province: string;
    source_of_income: string;
    date_of_birth: string;
    gender: 'male' | 'female';
    id_number: string;
    status: RegistrationStatus;
    notes: string | null;
    seminar_id: number | null;
    seminar: {
        id: number;
        title: string;
        scheduled_at: string;
        location: string;
        speaker_name: string | null;
        status: string;
    } | null;
    co_maker: CoMaker | null;
    beneficiaries: Beneficiary[];
    registered_by: string | null;
    created_at: string;
}

export interface AvailableSeminar {
    id: number;
    title: string;
    scheduled_at: string;
    location: string;
}
