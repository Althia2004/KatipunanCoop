import axios from 'axios';

interface Loan {
  id: number;
  principal_amount: number;
  interest_rate: number;
  term_months: number;
  total_payable: number;
  remaining_balance: number;
  status: 'active' | 'fully_paid' | 'defaulted';
  created_at: string;
}

interface LoanWithPayments extends Loan {
  payments: LoanPayment[];
}

interface LoanPayment {
  id: number;
  amount_paid: number;
  payment_date: string;
  payment_method: string;
  reference_number: string;
  remarks?: string;
}

interface LoanAmortization {
  id: number;
  due_date: string;
  principal: number;
  interest: number;
  total: number;
  paid_amount: number;
  status: 'pending' | 'paid' | 'overdue';
}

class MemberLoanService {
  private baseUrl = '/api/member';

  /**
   * Get all loans for the current member
   */
  async getLoans(): Promise<Loan[]> {
    try {
      const response = await axios.get<{ data: Loan[] }>(`${this.baseUrl}/loans`);
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch loans:', error);
      return [];
    }
  }

  /**
   * Get a specific loan by ID with detailed information
   */
  async getLoanById(loanId: number): Promise<LoanWithPayments | null> {
    try {
      const response = await axios.get<{ data: LoanWithPayments }>(
        `${this.baseUrl}/loans/${loanId}`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch loan ${loanId}:`, error);
      return null;
    }
  }

  /**
   * Get amortization schedule for a loan
   */
  async getLoanAmortization(loanId: number): Promise<LoanAmortization[]> {
    try {
      const response = await axios.get<{ data: LoanAmortization[] }>(
        `${this.baseUrl}/loans/${loanId}/amortization`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch amortization for loan ${loanId}:`, error);
      return [];
    }
  }

  /**
   * Get pending loans (not yet fully paid)
   */
  async getPendingLoans(): Promise<Loan[]> {
    try {
      const response = await axios.get<{ data: Loan[] }>(
        `${this.baseUrl}/loans?status=active`
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch pending loans:', error);
      return [];
    }
  }

  /**
   * Get payment history for a loan
   */
  async getLoanPayments(loanId: number): Promise<LoanPayment[]> {
    try {
      const response = await axios.get<{ data: LoanPayment[] }>(
        `${this.baseUrl}/loans/${loanId}/payments`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch payments for loan ${loanId}:`, error);
      return [];
    }
  }

  /**
   * Submit a new loan request
   */
  async submitLoanRequest(data: {
    amount: number;
    purpose: string;
    loan_term: number;
  }): Promise<{ success: boolean; message: string; loan_request_id?: number }> {
    try {
      const response = await axios.post(`${this.baseUrl}/loan-requests`, data);
      return {
        success: true,
        message: 'Loan request submitted successfully',
        loan_request_id: response.data.id,
      };
    } catch (error: any) {
      console.error('Failed to submit loan request:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit loan request',
      };
    }
  }

  /**
   * Get active loan count
   */
  async getActiveLoanCount(): Promise<number> {
    try {
      const loans = await this.getLoans();
      return loans.filter(
        (loan) => loan.status === 'active'
      ).length;
    } catch (error) {
      console.error('Failed to get active loan count:', error);
      return 0;
    }
  }

  /**
   * Get total pending payments across all loans
   */
  async getPendingPaymentsTotal(): Promise<number> {
    try {
      const loans = await this.getLoans();
      return loans.reduce((total, loan) => total + loan.remaining_balance, 0);
    } catch (error) {
      console.error('Failed to calculate pending payments:', error);
      return 0;
    }
  }
}

export default new MemberLoanService();
