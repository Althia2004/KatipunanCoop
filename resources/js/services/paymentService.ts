import axios from 'axios';

export type PaymentMethod = 'gcash' | 'bank_transfer' | 'onsite_payment';

interface PaymentRequest {
  id: number;
  loan_id: number;
  amount: number;
  payment_method: PaymentMethod;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  reference_number?: string;
  created_at: string;
  updated_at: string;
}

interface PaymentIntentResponse {
  client_secret: string;
  payment_intent_id: string;
  amount: number;
}

interface PaymentMethodOption {
  id: PaymentMethod;
  name: string;
  icon: string;
  description: string;
}

class PaymentService {
  private baseUrl = '/api/member';

  /**
   * Get available payment methods for member
   */
  getAvailablePaymentMethods(): PaymentMethodOption[] {
    return [
      {
        id: 'gcash',
        name: 'GCash',
        icon: 'Smartphone',
        description: 'Pay via GCash mobile money',
      },
      {
        id: 'bank_transfer',
        name: 'Bank Transfer',
        icon: 'Building2',
        description: 'Direct bank transfer',
      },
      {
        id: 'onsite_payment',
        name: 'Onsite Payment',
        icon: 'Store',
        description: 'Pay at the cooperative office',
      },
    ];
  }

  /**
   * Create a payment intent (for online payments)
   */
  async createPaymentIntent(data: {
    loan_id: number;
    amount: number;
    payment_method: PaymentMethod;
  }): Promise<{ success: boolean; data?: PaymentIntentResponse; message: string }> {
    try {
      const response = await axios.post<{
        data: PaymentIntentResponse;
      }>(`${this.baseUrl}/payments/intent`, data);

      return {
        success: true,
        data: response.data.data,
        message: 'Payment intent created successfully',
      };
    } catch (error: any) {
      console.error('Failed to create payment intent:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create payment intent',
      };
    }
  }

  /**
   * Submit a loan payment
   */
  async submitPayment(data: {
    loan_id: number;
    amount: number;
    payment_method: PaymentMethod;
    reference_number?: string;
    remarks?: string;
  }): Promise<{ success: boolean; payment_id?: number; message: string }> {
    try {
      const response = await axios.post<{ id: number }>(
        `${this.baseUrl}/payments`,
        data
      );

      return {
        success: true,
        payment_id: response.data.id,
        message: 'Payment submitted successfully',
      };
    } catch (error: any) {
      console.error('Failed to submit payment:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to submit payment',
      };
    }
  }

  /**
   * Get payment history for a loan
   */
  async getLoanPaymentHistory(loanId: number): Promise<any[]> {
    try {
      const response = await axios.get<{ data: any[] }>(
        `${this.baseUrl}/loans/${loanId}/payments`
      );
      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch payment history for loan ${loanId}:`, error);
      return [];
    }
  }

  /**
   * Get all recent payments
   */
  async getRecentPayments(limit: number = 10): Promise<PaymentRequest[]> {
    try {
      const response = await axios.get<{ data: PaymentRequest[] }>(
        `${this.baseUrl}/payments?limit=${limit}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Failed to fetch recent payments:', error);
      return [];
    }
  }

  /**
   * Verify a payment (typically after redirect from payment gateway)
   */
  async verifyPayment(
    paymentId: string,
    paymentMethod: PaymentMethod
  ): Promise<{ success: boolean; message: string }> {
    try {
      await axios.post(`${this.baseUrl}/payments/${paymentId}/verify`, {
        payment_method: paymentMethod,
      });

      return {
        success: true,
        message: 'Payment verified successfully',
      };
    } catch (error: any) {
      console.error(`Failed to verify payment ${paymentId}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to verify payment',
      };
    }
  }

  /**
   * Cancel a pending payment
   */
  async cancelPayment(paymentId: number): Promise<{ success: boolean; message: string }> {
    try {
      await axios.post(`${this.baseUrl}/payments/${paymentId}/cancel`);

      return {
        success: true,
        message: 'Payment cancelled successfully',
      };
    } catch (error: any) {
      console.error(`Failed to cancel payment ${paymentId}:`, error);
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to cancel payment',
      };
    }
  }

  /**
   * Get next payment due for a loan
   */
  async getNextPaymentDue(loanId: number): Promise<{
    due_date: string;
    amount: number;
    is_overdue: boolean;
  } | null> {
    try {
      const response = await axios.get<{
        data: {
          due_date: string;
          amount: number;
          is_overdue: boolean;
        };
      }>(`${this.baseUrl}/loans/${loanId}/next-payment`);

      return response.data.data;
    } catch (error) {
      console.error(`Failed to fetch next payment for loan ${loanId}:`, error);
      return null;
    }
  }
}

export default new PaymentService();
