import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { internApi } from '@/services/api/additional';
import { toast } from 'sonner';

export const useInterns = (options?: { enabled?: boolean }) => {
    return useQuery({
        queryKey: ['interns'],
        queryFn: internApi.getAll,
        ...options
    });
};

export const useCreateIntern = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            name: string;
            email: string;
            password: string;
            phone: string;
            address: string;
            duration: string;
            salary: number;
        }) => internApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interns'] });
            toast.success('Intern added successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to add intern';
            toast.error(message);
        },
    });
};

export const useUpdateIntern = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            internApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interns'] });
            toast.success('Intern updated successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to update intern';
            toast.error(message);
        },
    });
};

export const useDeleteIntern = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => internApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['interns'] });
            toast.success('Intern deleted successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to delete intern';
            toast.error(message);
        },
    });
};

export const useToggleInternStatus = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => internApi.toggleStatus(id),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['interns'] });
            queryClient.invalidateQueries({ queryKey: ['handovers'] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success(data?.message || 'Intern status updated');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to update intern status';
            toast.error(message);
        },
    });
};
