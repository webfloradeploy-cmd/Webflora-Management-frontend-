import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { leadApi } from "@/services/api";
import { toast } from "sonner";

export const useLeads = () => {
    return useQuery({
        queryKey: ["leads"],
        queryFn: leadApi.getAll,
    });
};

export const useCreateLead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => leadApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            toast.success("Lead created successfully");
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Failed to create lead";
            toast.error(message);
        },
    });
};

export const useUpdateLead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => leadApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            toast.success("Lead updated successfully");
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Failed to update lead";
            toast.error(message);
        },
    });
};

export const useDeleteLead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => leadApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            toast.success("Lead deleted successfully");
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Failed to delete lead";
            toast.error(message);
        },
    });
};

export const useRequestQuotation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, notes }: { id: string; notes?: string }) => leadApi.requestQuotation(id, notes),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            toast.success(res?.message || "Quotation request submitted to Admin");
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Failed to request quotation";
            toast.error(message);
        },
    });
};

export const useApproveQuotation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => leadApi.approveQuotation(id),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            toast.success(res?.message || "Quotation request approved! Quotation can now be created.");
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Failed to approve quotation request";
            toast.error(message);
        },
    });
};

export const useRejectQuotation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason?: string }) => leadApi.rejectQuotation(id, reason),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            toast.success(res?.message || "Quotation request rejected");
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Failed to reject quotation request";
            toast.error(message);
        },
    });
};

export const useAddFollowUp = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => leadApi.addFollowUp(id, data),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["leads"] });
            toast.success(res?.message || "Follow-up recorded successfully");
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Failed to record follow-up";
            toast.error(message);
        },
    });
};
