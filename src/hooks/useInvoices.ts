import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoiceApi } from '@/services/api';
import { CreateInvoiceRequest, UpdateInvoiceRequest } from '@/types/api';
import { toast } from 'sonner';

export const useInvoices = () => {
    return useQuery({
        queryKey: ['invoices'],
        queryFn: invoiceApi.getAll,
    });
};

export const useInvoice = (id: string) => {
    return useQuery({
        queryKey: ['invoice', id],
        queryFn: () => invoiceApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateInvoice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateInvoiceRequest) => invoiceApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Invoice created successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to create invoice';
            toast.error(message);
        },
    });
};

export const useUpdateInvoice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateInvoiceRequest }) =>
            invoiceApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Invoice updated successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to update invoice';
            toast.error(message);
        },
    });
};

export const useDeleteInvoice = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => invoiceApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Invoice deleted successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to delete invoice';
            toast.error(message);
        },
    });
};

export const useRecordPayment = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: { amount: number; method: string; date?: string; notes?: string } }) =>
            invoiceApi.recordPayment(id, data),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['invoices'] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            toast.success(data?.message || 'Payment recorded successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to record payment';
            toast.error(message);
        },
    });
};
