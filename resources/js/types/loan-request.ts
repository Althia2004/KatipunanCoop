export interface LoanRequest {
    id: number;
    amount: string;
    purpose: string | null;
    status: 'pending' | 'for_bod_approval' | 'approved' | 'rejected';
    requested_at: string;
    term_months: number;
    interest_rate: number;
    rejection_reason: string | null;
    escalation_notes: string | null;
    reviewed_by: string | null;
    reviewed_at: string | null;
    requested_by: {
        id: number;
        name: string;
        email: string;
    };
}
