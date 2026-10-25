import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';

export const quotationApi = {
    getAll: async () => {
        const response = await axiosInstance.get<{ quotations: any[] }>(
            API_ENDPOINTS.QUOTATION_ALL
        );
        return response.data.quotations;
    },

    create: async (data: any) => {
        const response = await axiosInstance.post(API_ENDPOINTS.QUOTATION_CREATE, data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await axiosInstance.put(API_ENDPOINTS.QUOTATION_UPDATE(id), data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await axiosInstance.delete(API_ENDPOINTS.QUOTATION_DELETE(id));
        return response.data;
    },

    sendEmail: async (id: string, data: { email?: string; subject?: string; message?: string; pdfBase64?: string }) => {
        const response = await axiosInstance.post(API_ENDPOINTS.QUOTATION_SEND(id), data, {
            timeout: 60000
        });
        return response.data;
    },
};
