export interface Loan {
    id: number;
    member: {
        id: number;
        name: string;
        email: string;
    };
    loan_request_id: number;
    principal_amount: string;
    interest_rate: string;
    total_payable: string;
    remaining_balance: string;
    status: 'active' | 'fully_paid' | 'defaulted';
}
