import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { handoverApi } from '@/services/api';
import { CreateHandoverRequest, UpdateHandoverRequest } from '@/types/api';
import { toast } from 'sonner';

export const useHandovers = () => {
    return useQuery({
        queryKey: ['handovers'],
        queryFn: handoverApi.getAll,
    });
};

export const useHandover = (id: string) => {
    return useQuery({
        queryKey: ['handover', id],
        queryFn: () => handoverApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateHandover = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateHandoverRequest) => handoverApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['handovers'] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Handover created successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to create handover';
            toast.error(message);
        },
    });
};

export const useUpdateHandover = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdateHandoverRequest }) =>
            handoverApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['handovers'] });
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Handover updated successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to update handover';
            toast.error(message);
        },
    });
};

export const useDeleteHandover = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => handoverApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['handovers'] });
            toast.success('Handover deleted successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to delete handover';
            toast.error(message);
        },
    });
};
