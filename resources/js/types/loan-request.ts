export interface LoanRequest {
    id: number;
    amount: string;
    purpose: string | null;
    status: 'pending' | 'for_bod_approval' | 'approved';
    requested_at: string;
    requested_by: {
        id: number;
        name: string;
        email: string;
    };
}
