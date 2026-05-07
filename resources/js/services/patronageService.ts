import axios from 'axios';

interface PatronageRefund {
  id: number;
  member_id: number;
  fiscal_year: number;
  gross_patronage: number;
  tax_amount: number;
  net_refund: number;
  status: 'pending' | 'approved' | 'released' | 'cancelled';
  payment_date?: string;
  created_at: string;
  updated_at: string;
}

interface PatronageTransaction {
  id: number;
  refund_id: number;
  type: 'earned' | 'tax_deducted' | 'released';
  amount: number;
  description: string;
  transaction_date: string;
  reference_number?: string;
}

class PatronageService {
  private baseUrl = '/api/member';

  /**
   * Get all patronage refunds for the member
   */
  async getPatronageRefunds(): Promise<PatronageRefund[]> {
    try {
      const response = await axios.get<{ data: PatronageRefund[] }>(
        `${this.baseUrl}/patronage-refunds`
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch patronage refunds:', error);
      return [];
    }
  }

  /**
   * Get a specific patronage refund by ID
   */
  async getPatronageRefundById(refundId: number): Promise<PatronageRefund | null> {
    try {
      const response = await axios.get<{ data: PatronageRefund }>(
        `${this.baseUrl}/patronage-refunds/${refundId}`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch patronage refund ${refundId}:`, error);
      return null;
    }
  }

  /**
   * Get total patronage refund amount earned
   */
  async getTotalPatronageEarned(): Promise<number> {
    try {
      const refunds = await this.getPatronageRefunds();
      return refunds
        .filter((refund) => refund.status !== 'cancelled')
        .reduce((total, refund) => total + refund.gross_patronage, 0);
    } catch (error) {
      console.error('Failed to calculate total patronage:', error);
      return 0;
    }
  }

  /**
   * Get total patronage refunds already released
   */
  async getTotalPatronageReleased(): Promise<number> {
    try {
      const refunds = await this.getPatronageRefunds();
      return refunds
        .filter((refund) => refund.status === 'released')
        .reduce((total, refund) => total + refund.net_refund, 0);
    } catch (error) {
      console.error('Failed to calculate total released patronage:', error);
      return 0;
    }
  }

  /**
   * Get pending patronage refunds (approved but not yet released)
   */
  async getPendingPatronageRefunds(): Promise<PatronageRefund[]> {
    try {
      const refunds = await this.getPatronageRefunds();
      return refunds.filter((refund) => refund.status === 'approved');
    } catch (error) {
      console.error('Failed to fetch pending patronage refunds:', error);
      return [];
    }
  }

  /**
   * Get patronage refund history/transactions
   */
  async getPatronageTransactions(limit: number = 10): Promise<PatronageTransaction[]> {
    try {
      const response = await axios.get<{ data: PatronageTransaction[] }>(
        `${this.baseUrl}/patronage-refunds/transactions?limit=${limit}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch patronage transactions:', error);
      return [];
    }
  }

  /**
   * Get patronage transactions for a specific fiscal year
   */
  async getPatronageByYear(fiscalYear: number): Promise<PatronageRefund | null> {
    try {
      const refunds = await this.getPatronageRefunds();
      return refunds.find((refund) => refund.fiscal_year === fiscalYear) || null;
    } catch (error) {
      console.error(`Failed to fetch patronage for year ${fiscalYear}:`, error);
      return null;
    }
  }

  /**
   * Get patronage refund summary for dashboard
   */
  async getPatronageSummary(): Promise<{
    total_earned: number;
    total_released: number;
    pending_amount: number;
    last_fiscal_year: number | null;
  }> {
    try {
      const refunds = await this.getPatronageRefunds();

      const total_earned = refunds
        .filter((r) => r.status !== 'cancelled')
        .reduce((total, r) => total + r.gross_patronage, 0);

      const total_released = refunds
        .filter((r) => r.status === 'released')
        .reduce((total, r) => total + r.net_refund, 0);

      const pending_amount = refunds
        .filter((r) => r.status === 'approved')
        .reduce((total, r) => total + r.net_refund, 0);

      const last_fiscal_year =
        refunds.length > 0
          ? Math.max(...refunds.map((r) => r.fiscal_year))
          : null;

      return {
        total_earned,
        total_released,
        pending_amount,
        last_fiscal_year,
      };
    } catch (error) {
      console.error('Failed to fetch patronage summary:', error);
      return {
        total_earned: 0,
        total_released: 0,
        pending_amount: 0,
        last_fiscal_year: null,
      };
    }
  }
}

export default new PatronageService();
