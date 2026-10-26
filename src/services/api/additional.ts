import axiosInstance from '@/lib/axios';
import { adaptInternData } from '@/types/api';

// Notices API
export const noticeApi = {
    getAll: async () => {
        const response = await axiosInstance.get('/api/notice/get');
        return response.data.notices || [];
    },

    getById: async (id: string) => {
        const response = await axiosInstance.get(`/api/notice/get/${id}`);
        return response.data.notice;
    },

    create: async (data: {
        title: string;
        content: string;
        date?: string;
        audienceType?: 'all' | 'employee' | 'intern' | 'individual';
        targetId?: string;
        targetModel?: 'employee' | 'intern';
    }) => {
        const response = await axiosInstance.post('/api/notice/create', data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await axiosInstance.delete(`/api/notice/delete/${id}`);
        return response.data;
    },
};

// Interns API
export const internApi = {
    getAll: async () => {
        const response = await axiosInstance.get('/api/intern');
        return (response.data.interns || []).map(adaptInternData);
    },

    getProfile: async () => {
        const response = await axiosInstance.get<{ intern: any }>('/api/intern/me');
        return adaptInternData(response.data.intern);
    },

    create: async (data: {
        name: string;
        email: string;
        password: string;
        phone: string;
        address: string;
        duration: string;
        salary: number;
    }) => {
        const response = await axiosInstance.post('/api/intern', data);
        return response.data;
    },

    update: async (id: string, data: any) => {
        const response = await axiosInstance.put(`/api/intern/update/${id}`, data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await axiosInstance.delete(`/api/intern/delete/${id}`);
        return response.data;
    },
    toggleStatus: async (id: string) => {
        const response = await axiosInstance.patch(`/api/intern/${id}/status`);
        return response.data;
    },
    list: async () => {
        const response = await axiosInstance.get<{ interns: any[] }>('/api/intern/list');
        return response.data.interns;
    },
};

// Communications API
export const communicationApi = {
    getAll: async () => {
        const response = await axiosInstance.get('/api/communication');
        return response.data.communications || [];
    },

    getById: async (id: string) => {
        const response = await axiosInstance.get(`/api/communication/${id}`);
        return response.data.communication;
    },

    create: async (data: { title: string; description: string }) => {
        const response = await axiosInstance.post('/api/communication', data);
        return response.data;
    },

    reply: async (id: string, reply: string, status: string = "resolved") => {
        const response = await axiosInstance.put(`/api/communication/${id}/reply`, { reply, status });
        return response.data;
    },

    delete: async (id: string) => {
        const response = await axiosInstance.delete(`/api/communication/${id}`);
        return response.data;
    },
};
