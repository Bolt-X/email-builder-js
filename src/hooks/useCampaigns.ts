import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createCampaign,
  deleteMutipleCampaigns,
  getAllCampaigns,
  updateCampaign,
  updateMutipleCampaigns,
} from "../services/campaign";
import { deleteCampaign } from "../modules/campaigns";

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
    mutationFn: ({ slug, payload }: { slug: string; payload: any }) =>
      updateCampaign(slug, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
};

export const useUpdateMutipleCampaigns = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ids, payload }: { ids: string[]; payload: any }) => updateMutipleCampaigns(ids, payload),
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

export const useDeleteCampaign = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (slug: string) => deleteCampaign(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
};

export const useDeleteMutipleCampaigns = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => deleteMutipleCampaigns(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });
};