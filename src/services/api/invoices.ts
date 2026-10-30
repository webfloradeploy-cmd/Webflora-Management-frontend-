import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';
import {
    CreateInvoiceRequest,
    UpdateInvoiceRequest,
    InvoiceBackend,
    adaptInvoiceData,
} from '@/types/api';

export const invoiceApi = {
    getAll: async () => {
        const response = await axiosInstance.get<{ invoices: InvoiceBackend[] }>(
            API_ENDPOINTS.INVOICE_BASE
        );
        return response.data.invoices.map(adaptInvoiceData);
    },

    getById: async (id: string) => {
        const response = await axiosInstance.get<{ invoices: InvoiceBackend[] }>(
            API_ENDPOINTS.INVOICE_BY_ID(id)
        );
        return response.data.invoices.map(adaptInvoiceData);
    },

    create: async (data: CreateInvoiceRequest) => {
        const response = await axiosInstance.post(API_ENDPOINTS.INVOICE_BASE, data);
        return response.data;
    },

    update: async (id: string, data: UpdateInvoiceRequest) => {
        const response = await axiosInstance.put(API_ENDPOINTS.INVOICE_UPDATE(id), data);
        return response.data;
    },

    recordPayment: async (id: string, data: { amount: number; method: string; date?: string; notes?: string }) => {
        const response = await axiosInstance.post(API_ENDPOINTS.INVOICE_RECORD_PAYMENT(id), data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await axiosInstance.delete(API_ENDPOINTS.INVOICE_DELETE(id));
        return response.data;
    },
};
