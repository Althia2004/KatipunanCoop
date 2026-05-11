import { apiClient } from '@/lib/api-client';

export type CopraSalesQuery = {
    year?: number;
    month?: number;
    classification?: string;
    search?: string;
    sale_date?: string;
    type?: 'annual' | 'monthly' | 'member_contribution';
};

export const getSales = (params?: CopraSalesQuery) =>
    apiClient.get('/superadmin/copra-sales', { params });

export const getMemberSales = () =>
    apiClient.get('/member/copra-sales/history');

export const createSale = (memberId: number, payload: Record<string, unknown>) =>
    apiClient.post(`/superadmin/copra-sales/${memberId}`, payload);

export const updateSale = (saleId: number, payload: Record<string, unknown>) =>
    apiClient.put(`/superadmin/copra-sales/${saleId}`, payload);

export const deleteSale = (saleId: number) =>
    apiClient.delete(`/superadmin/copra-sales/${saleId}`);

export const generateReport = (params?: CopraSalesQuery) =>
    apiClient.get('/superadmin/copra-sales/report', {
        params,
        responseType: 'blob',
    });
