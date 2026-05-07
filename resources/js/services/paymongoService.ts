import axios from 'axios';

export interface PaymentIntent {
    id: string;
    amount: number;
    currency: string;
    status: string;
    clientKey: string;
}

export interface PaymentMethod {
    type: 'gcash' | 'bank_transfer';
    details?: {
        accountNumber?: string;
        bankCode?: string;
    };
}

class PayMongoService {
    private baseUrl = '/api/payments';

    /**
     * Create a payment intent for a loan payment
     */
    async createPaymentIntent(
        loanId: number,
        amount: number,
        paymentMethod: PaymentMethod
    ): Promise<PaymentIntent> {
        try {
            const response = await axios.post<PaymentIntent>(
                `${this.baseUrl}/create-intent`,
                {
                    loan_id: loanId,
                    amount,
                    payment_method: paymentMethod.type,
                }
            );
            return response.data;
        } catch (error) {
            console.error('Failed to create payment intent:', error);
            throw error;
        }
    }

    /**
     * Verify a payment transaction
     */
    async verifyPayment(paymentIntentId: string, sourceId: string): Promise<{ success: boolean; message: string }> {
        try {
            const response = await axios.post<{ success: boolean; message: string }>(
                `${this.baseUrl}/verify`,
                {
                    payment_intent_id: paymentIntentId,
                    source_id: sourceId,
                }
            );
            return response.data;
        } catch (error) {
            console.error('Failed to verify payment:', error);
            throw error;
        }
    }

    /**
     * Get payment status
     */
    async getPaymentStatus(paymentIntentId: string): Promise<{ status: string; amount: number }> {
        try {
            const response = await axios.get<{ status: string; amount: number }>(
                `${this.baseUrl}/${paymentIntentId}/status`
            );
            return response.data;
        } catch (error) {
            console.error('Failed to get payment status:', error);
            throw error;
        }
    }

    /**
     * Get available payment methods
     */
    async getPaymentMethods(): Promise<string[]> {
        try {
            const response = await axios.get<{ methods: string[] }>(
                `${this.baseUrl}/methods`
            );
            return response.data.methods;
        } catch (error) {
            console.error('Failed to get payment methods:', error);
            throw error;
        }
    }

    /**
     * Cancel a pending payment
     */
    async cancelPayment(paymentIntentId: string): Promise<{ success: boolean }> {
        try {
            const response = await axios.post<{ success: boolean }>(
                `${this.baseUrl}/${paymentIntentId}/cancel`
            );
            return response.data;
        } catch (error) {
            console.error('Failed to cancel payment:', error);
            throw error;
        }
    }
}

export const paymongoService = new PayMongoService();
export default paymongoService;
