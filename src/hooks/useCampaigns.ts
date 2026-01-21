import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createCampaign, getAllCampaigns, updateCampaign } from "../services/campaign";

export const useGetAllCampaigns = () => {
  return useQuery({
    queryKey: ["campaigns"],
    queryFn: getAllCampaigns,
    select: (data) => data ?? [],
  });
};

export const useUpdateCampaign = () => {
    const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ slug, payload }: { slug: string, payload: any }) => updateCampaign(slug, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
};

export const useCreateCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => createCampaign(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
};