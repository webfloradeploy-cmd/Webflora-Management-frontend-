import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi, SystemSettings } from "@/services/api/settings";
import { useToast } from "@/hooks/use-toast";

export const useSettings = () => {
    return useQuery({
        queryKey: ["settings"],
        queryFn: () => settingsApi.getSettings(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

export const useMyPermissions = () => {
    return useQuery({
        queryKey: ["my-permissions"],
        queryFn: () => settingsApi.getMyPermissions(),
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
};

export const useUpdateSettings = () => {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: (data: Partial<SystemSettings>) => settingsApi.updateSettings(data),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ["settings"] });
            queryClient.invalidateQueries({ queryKey: ["my-permissions"] });
            toast({
                title: "Settings Saved",
                description: res.message || "Permissions and preferences updated successfully.",
            });
        },
        onError: (error: any) => {
            toast({
                title: "Update Failed",
                description: error.response?.data?.message || "Failed to update settings.",
                variant: "destructive",
            });
        },
    });
};
