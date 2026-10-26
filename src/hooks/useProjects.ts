import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectApi } from '@/services/api';
import { CreateProjectRequest } from '@/types/api';
import { toast } from 'sonner';

export const useProjects = () => {
    return useQuery({
        queryKey: ['projects'],
        queryFn: projectApi.getAll,
    });
};

export const useProject = (id: string) => {
    return useQuery({
        queryKey: ['project', id],
        queryFn: () => projectApi.getById(id),
        enabled: !!id,
    });
};

export const useCreateProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: CreateProjectRequest) => projectApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['handovers'] });
            toast.success('Project created successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to create project';
            toast.error(message);
        },
    });
};

export const useUpdateProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) =>
            projectApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['handovers'] });
            toast.success('Project updated successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to update project';
            toast.error(message);
        },
    });
};

export const useDeleteProject = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (id: string) => projectApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            toast.success('Project deleted successfully');
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || 'Failed to delete project';
            toast.error(message);
        },
    });
};
