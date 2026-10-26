import axiosInstance from '@/lib/axios';
import { API_ENDPOINTS } from '@/config/api';

export interface EmployeePermissions {
    projects: boolean;
    invoices: boolean;
    clients: boolean;
    leads: boolean;
    quotations: boolean;
    agreements: boolean;
    expenses: boolean;
    salaries: boolean;
    handovers: boolean;
    notices: boolean;
    communications: boolean;
    activity: boolean;
    reports: boolean;
}

export interface EmployeeOverride {
    employeeId: any;
    permissions: Partial<EmployeePermissions>;
}

export interface SystemSettings {
    _id?: string;
    key: string;
    companyInfo: {
        companyName: string;
        website: string;
        email: string;
        phone: string;
        address: string;
        gstNumber: string;
    };
    employeePermissions: EmployeePermissions;
    employeeOverrides: EmployeeOverride[];
}

export const settingsApi = {
    getSettings: async (): Promise<SystemSettings> => {
        const response = await axiosInstance.get(API_ENDPOINTS.SETTINGS_BASE);
        return response.data;
    },

    updateSettings: async (data: Partial<SystemSettings>): Promise<{ message: string; settings: SystemSettings }> => {
        const response = await axiosInstance.put(API_ENDPOINTS.SETTINGS_BASE, data);
        return response.data;
    },

    getMyPermissions: async (): Promise<{ role: string; permissions: EmployeePermissions }> => {
        const response = await axiosInstance.get(API_ENDPOINTS.SETTINGS_MY_PERMISSIONS);
        return response.data;
    }
};
