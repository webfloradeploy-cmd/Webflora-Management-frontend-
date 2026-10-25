import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quotationApi } from "@/services/api";
import { toast } from "sonner";

export const useQuotations = () => {
    return useQuery({
        queryKey: ["quotations"],
        queryFn: quotationApi.getAll,
    });
};

export const useCreateQuotation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => quotationApi.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["quotations"] });
            toast.success("Quotation created successfully");
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Failed to create quotation";
            toast.error(message);
        },
    });
};

export const useUpdateQuotation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => quotationApi.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["quotations"] });
            toast.success("Quotation updated successfully");
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Failed to update quotation";
            toast.error(message);
        },
    });
};

export const useDeleteQuotation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => quotationApi.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["quotations"] });
            toast.success("Quotation deleted successfully");
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Failed to delete quotation";
            toast.error(message);
        },
    });
};

export const useSendQuotationEmail = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => quotationApi.sendEmail(id, data),
        onSuccess: (res: any) => {
            queryClient.invalidateQueries({ queryKey: ["quotations"] });
            toast.success(res?.message || "Quotation sent via email successfully");
        },
        onError: (error: any) => {
            const message = error.response?.data?.message || "Failed to send quotation email";
            toast.error(message);
        },
    });
};
