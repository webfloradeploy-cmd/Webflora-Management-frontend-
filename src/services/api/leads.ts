import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';

export const leadApi = {
    getAll: async () => {
        const response = await axiosInstance.get<{ leads: any[] }>(
            API_ENDPOINTS.LEAD_ALL
        );
        return response.data.leads;
    },

    create: async (data: any) => {
        const response = await axiosInstance.post(API_ENDPOINTS.LEAD_CREATE, data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await axiosInstance.put(API_ENDPOINTS.LEAD_UPDATE(id), data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await axiosInstance.delete(API_ENDPOINTS.LEAD_DELETE(id));
        return response.data;
    },

    requestQuotation: async (id: string, notes?: string) => {
        const response = await axiosInstance.put(API_ENDPOINTS.LEAD_REQUEST_QUOTATION(id), { notes });
        return response.data;
    },

    approveQuotation: async (id: string) => {
        const response = await axiosInstance.put(API_ENDPOINTS.LEAD_APPROVE_QUOTATION(id));
        return response.data;
    },

    rejectQuotation: async (id: string, reason?: string) => {
        const response = await axiosInstance.put(API_ENDPOINTS.LEAD_REJECT_QUOTATION(id), { reason });
        return response.data;
    },

    addFollowUp: async (id: string, data: { notes: string; interestStatus?: string; nextFollowUpDate?: string; conductedByName?: string; conductedById?: string }) => {
        const response = await axiosInstance.post(API_ENDPOINTS.LEAD_ADD_FOLLOW_UP(id), data);
        return response.data;
    },

    convertToCustomer: async (id: string) => {
        const response = await axiosInstance.post(API_ENDPOINTS.LEAD_CONVERT_TO_CUSTOMER(id));
        return response.data;
    },
};
