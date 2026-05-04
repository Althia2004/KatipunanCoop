export interface LoanRequest {
    id: number;
    amount: string;
    purpose: string | null;
    status: 'pending' | 'for_bod_approval' | 'approved';
    requested_at: string;
    term_months: number;
    interest_rate: number;
    requested_by: {
        id: number;
        name: string;
        email: string;
    };
}
