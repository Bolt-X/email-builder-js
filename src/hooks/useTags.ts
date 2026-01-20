import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createTag, getAllTags, updateTag } from "../services/tags";

export const useGetAllTags = () => {
    return useQuery({
        queryKey: ["tags"],
        queryFn: getAllTags,
        select: (data) => data ?? [],
    });
};

export const useCreateTag = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: any) => createTag(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tags"] });
        },
    });
};

export const useUpdateTag = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateTag,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tags"] });
        },
    });
};
