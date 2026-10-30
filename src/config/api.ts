// API Configuration
console.log("VITE_API_BASE_URL resolved from environment:", import.meta.env.VITE_API_BASE_URL);

let baseUrl = import.meta.env.VITE_API_BASE_URL !== undefined && import.meta.env.VITE_API_BASE_URL !== '' 
    ? import.meta.env.VITE_API_BASE_URL 
    : 'https://webflora-management-backend-seven.vercel.app';

// Localhost override
if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '::1')) {
    baseUrl = 'http://localhost:4002';
    console.log("Self-healing: Overrode API_BASE_URL to localhost backend:", baseUrl);
}

// Production fallback for Vercel deployment or custom domain
if (typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('webfloratechnologies.com'))) {
    if (!baseUrl || baseUrl.includes('localhost') || baseUrl.includes('webflora-management-backend.vercel.app')) {
        baseUrl = 'https://webflora-management-backend-seven.vercel.app';
        console.log("Production fallback: API_BASE_URL set to:", baseUrl);
    }
}

export const API_BASE_URL = baseUrl;
export const API_TIMEOUT = parseInt(import.meta.env.VITE_API_TIMEOUT || '45000');

// API Endpoints
export const API_ENDPOINTS = {
    // Admin
    ADMIN_REGISTER: '/api/admin/register',
    ADMIN_LOGIN: '/api/admin/login',
    ADMIN_GET: '/api/admin/get',

    // Employee
    EMPLOYEE_BASE: '/api/employee',
    EMPLOYEE_LOGIN: '/api/employee/login',
    EMPLOYEE_BY_ID: (id: string) => `/api/employee/${id}`,

    // Client
    CLIENT_BASE: '/api/client',
    CLIENT_UPDATE: (id: string) => `/api/client/update/${id}`,
    CLIENT_DELETE: (id: string) => `/api/client/delete/${id}`,

    // Invoice
    INVOICE_BASE: '/api/invoice',
    INVOICE_BY_ID: (id: string) => `/api/invoice/${id}`,
    INVOICE_UPDATE: (id: string) => `/api/invoice/update/${id}`,
    INVOICE_RECORD_PAYMENT: (id: string) => `/api/invoice/${id}/pay`,
    INVOICE_DELETE: (id: string) => `/api/invoice/delete/${id}`,

    // Communication
    COMMUNICATION_BASE: '/api/communication',
    COMMUNICATION_BY_ID: (id: string) => `/api/communication/${id}`,

    // Notice
    NOTICE_BASE: '/api/notice',
    NOTICE_BY_ID: (id: string) => `/api/notice/${id}`,

    // Attendance
    ATTENDANCE_BASE: '/api/attendance',
    ATTENDANCE_BY_ID: (id: string) => `/api/attendance/${id}`,

    // Intern
    INTERN_BASE: '/api/intern',
    INTERN_LOGIN: '/api/intern/login',
    INTERN_BY_ID: (id: string) => `/api/intern/${id}`,

    // Project
    PROJECT_BASE: '/api/project',
    PROJECT_UPDATE: (id: string) => `/api/project/update/${id}`,
    PROJECT_DELETE: (id: string) => `/api/project/delete/${id}`,

    // Handover
    HANDOVER_BASE: '/api/handover/all',
    HANDOVER_ADD: '/api/handover/add',
    HANDOVER_BY_ID: (id: string) => `/api/handover/${id}`,
    HANDOVER_UPDATE: (id: string) => `/api/handover/update/${id}`,
    HANDOVER_DELETE: (id: string) => `/api/handover/delete/${id}`,

    // Auth
    AUTH_LOGIN: '/api/auth/login',
    AUTH_FORGOT_PASSWORD: '/api/auth/forgot-password',
    AUTH_VERIFY_OTP: '/api/auth/verify-otp',
    AUTH_RESET_PASSWORD: '/api/auth/reset-password',

    // Expense
    EXPENSE_BASE: '/api/expense',
    EXPENSE_ALL: '/api/expense/all',
    EXPENSE_ADD: '/api/expense/add',
    EXPENSE_DELETE: (id: string) => `/api/expense/${id}`,
    EXPENSE_UPDATE_STATUS: (id: string) => `/api/expense/${id}/return-status`,

    // Lead
    LEAD_BASE: '/api/lead',
    LEAD_ALL: '/api/lead/all',
    LEAD_CREATE: '/api/lead/create',
    LEAD_UPDATE: (id: string) => `/api/lead/update/${id}`,
    LEAD_DELETE: (id: string) => `/api/lead/delete/${id}`,
    LEAD_REQUEST_QUOTATION: (id: string) => `/api/lead/${id}/request-quotation`,
    LEAD_APPROVE_QUOTATION: (id: string) => `/api/lead/${id}/approve-quotation`,
    LEAD_REJECT_QUOTATION: (id: string) => `/api/lead/${id}/reject-quotation`,
    LEAD_ADD_FOLLOW_UP: (id: string) => `/api/lead/${id}/follow-up`,
    LEAD_CONVERT_TO_CUSTOMER: (id: string) => `/api/lead/${id}/convert-to-customer`,

    // Quotation
    QUOTATION_BASE: '/api/quotation',
    QUOTATION_ALL: '/api/quotation/all',
    QUOTATION_CREATE: '/api/quotation/create',
    QUOTATION_UPDATE: (id: string) => `/api/quotation/update/${id}`,
    QUOTATION_DELETE: (id: string) => `/api/quotation/delete/${id}`,
    QUOTATION_SEND: (id: string) => `/api/quotation/send/${id}`,

    // Agreement
    AGREEMENT_BASE: '/api/agreement',
    AGREEMENT_ALL: '/api/agreement/all',
    AGREEMENT_CREATE: '/api/agreement/create',
    AGREEMENT_UPDATE: (id: string) => `/api/agreement/update/${id}`,
    AGREEMENT_DELETE: (id: string) => `/api/agreement/delete/${id}`,
    AGREEMENT_DUPLICATE: (id: string) => `/api/agreement/duplicate/${id}`,
    AGREEMENT_SEND: (id: string) => `/api/agreement/send/${id}`,
    AGREEMENT_ESIGN: (id: string) => `/api/agreement/esign/${id}`,

    // Settings & Permissions
    SETTINGS_BASE: '/api/settings',
    SETTINGS_MY_PERMISSIONS: '/api/settings/my-permissions',
} as const;
