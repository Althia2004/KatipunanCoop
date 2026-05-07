import axios from 'axios';

interface SavingsAccount {
  id: number;
  member_id: number;
  balance: number;
  total_deposited: number;
  created_at: string;
  updated_at: string;
}

interface SavingsTransaction {
  id: number;
  savings_account_id: number;
  type: 'deposit' | 'withdrawal' | 'interest' | 'penalty';
  amount: number;
  description: string;
  transaction_date: string;
  reference_number?: string;
}

class SavingsService {
  private baseUrl = '/api/member';

  /**
   * Get member's savings account information
   */
  async getSavingsAccount(): Promise<SavingsAccount | null> {
    try {
      const response = await axios.get<{ data: SavingsAccount }>(
        `${this.baseUrl}/savings`
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch savings account:', error);
      return null;
    }
  }

  /**
   * Get current savings balance
   */
  async getSavingsBalance(): Promise<number> {
    try {
      const account = await this.getSavingsAccount();
      return account?.balance ?? 0;
    } catch (error) {
      console.error('Failed to fetch savings balance:', error);
      return 0;
    }
  }

  /**
   * Get savings transaction history
   */
  async getSavingsTransactions(limit: number = 10): Promise<SavingsTransaction[]> {
    try {
      const response = await axios.get<{ data: SavingsTransaction[] }>(
        `${this.baseUrl}/savings/transactions?limit=${limit}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch savings transactions:', error);
      return [];
    }
  }

  /**
   * Get filtered savings transactions by date range
   */
  async getSavingsTransactionsByDateRange(
    startDate: string,
    endDate: string
  ): Promise<SavingsTransaction[]> {
    try {
      const response = await axios.get<{ data: SavingsTransaction[] }>(
        `${this.baseUrl}/savings/transactions`,
        {
          params: {
            start_date: startDate,
            end_date: endDate,
          },
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch transactions for date range:', error);
      return [];
    }
  }

  /**
   * Get interest earned on savings
   */
  async getInterestEarned(): Promise<number> {
    try {
      const transactions = await this.getSavingsTransactions(1000);
      return transactions
        .filter((tx) => tx.type === 'interest')
        .reduce((total, tx) => total + tx.amount, 0);
    } catch (error) {
      console.error('Failed to calculate interest earned:', error);
      return 0;
    }
  }

  /**
   * Submit savings deposit request
   */
  async submitSavingsDeposit(data: {
    amount: number;
    payment_method: string;
    reference_number?: string;
  }): Promise<{ success: boolean; message: string; transaction_id?: number }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/savings/deposit`,
        data
      );
      return {
        success: true,
        message: 'Deposit submitted successfully',
        transaction_id: response.data.id,
      };
    } catch (error: any) {
      console.error('Failed to submit deposit:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit deposit',
      };
    }
  }

  /**
   * Submit savings withdrawal request
   */
  async submitSavingsWithdrawal(data: {
    amount: number;
    payment_method: string;
  }): Promise<{ success: boolean; message: string; transaction_id?: number }> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/savings/withdrawal`,
        data
      );
      return {
        success: true,
        message: 'Withdrawal submitted successfully',
        transaction_id: response.data.id,
      };
    } catch (error: any) {
      console.error('Failed to submit withdrawal:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit withdrawal',
      };
    }
  }

  /**
   * Get total deposits made
   */
  async getTotalDeposited(): Promise<number> {
    try {
      const account = await this.getSavingsAccount();
      return account?.total_deposited ?? 0;
    } catch (error) {
      console.error('Failed to fetch total deposited:', error);
      return 0;
    }
  }
}

export default new SavingsService();
