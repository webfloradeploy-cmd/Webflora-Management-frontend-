import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { employeeApi } from '@/services/api';
import { CreateEmployeeRequest, UpdateEmployeeRequest } from '@/types/api';
import { toast } from 'sonner';

export const useEmployees = (options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ['employees'],
        queryFn: employeeApi.getAll,
        ...options
    });
};

export const useCreateEmployee = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateEmployeeRequest) => employeeApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            toast.success('Employee created successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to create employee';
            toast.error(message);
        },
    });
};

export const useUpdateEmployee = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeRequest }) =>
            employeeApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            toast.success('Employee updated successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to update employee';
            toast.error(message);
        },
    });
};

export const useDeleteEmployee = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => employeeApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            toast.success('Employee deleted successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to delete employee';
            toast.error(message);
        },
    });
};

export const useToggleEmployeeStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => employeeApi.toggleStatus(id),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['employees'] });
            toast.success(data.message || 'Status updated');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to update employee status';
            toast.error(message);
        },
    });
};
