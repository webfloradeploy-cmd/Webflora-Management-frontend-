import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';
import {
    CreateEmployeeRequest,
    UpdateEmployeeRequest,
    EmployeeBackend,
    adaptEmployeeData,
} from '@/types/api';

export const employeeApi = {
    getAll: async () => {
        const response = await axiosInstance.get<{ employees: EmployeeBackend[] }>(
            API_ENDPOINTS.EMPLOYEE_BASE
        );
        return response.data.employees.map(adaptEmployeeData);
    },

    getProfile: async () => {
        const response = await axiosInstance.get<{ employee: EmployeeBackend }>('/api/employee/me');
        return adaptEmployeeData(response.data.employee);
    },

    create: async (data: CreateEmployeeRequest) => {
        const response = await axiosInstance.post(API_ENDPOINTS.EMPLOYEE_BASE, data);
        return response.data;
    },

    update: async (id: string, data: UpdateEmployeeRequest) => {
        const response = await axiosInstance.put(API_ENDPOINTS.EMPLOYEE_BY_ID(id), data);
        return response.data;
    },

    delete: async (id: string) => {
        const response = await axiosInstance.delete(API_ENDPOINTS.EMPLOYEE_BY_ID(id));
        return response.data;
    },

    login: async (credentials: { email: string; password: string }) => {
        const response = await axiosInstance.post(API_ENDPOINTS.EMPLOYEE_LOGIN, credentials);
        return response.data;
    },
    list: async () => {
        const response = await axiosInstance.get<{ employees: any[] }>('/api/employee/list');
        return response.data.employees;
    },
    toggleStatus: async (id: string) => {
        const response = await axiosInstance.patch<{ message: string; status: string; employee: any }>(
            `${API_ENDPOINTS.EMPLOYEE_BASE}/${id}/status`
        );
        return response.data;
    },
};
