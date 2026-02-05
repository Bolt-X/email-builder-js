import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	createCampaign,
	deleteMutipleCampaigns,
	updateCampaign,
	updateMutipleCampaigns,
} from "../services/campaign";
import { deleteCampaign, getCampaigns } from "../modules/campaigns";
import i18n from "../i18n";
import { toast } from "react-toastify";
import { duplicateCampaignAction } from "../modules/campaigns/stores";

export const useGetAllCampaigns = (filters?: any) => {
	return useQuery({
		queryKey: ["campaigns", filters],
		queryFn: () => getCampaigns(filters),
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
			toast.success(i18n.t("campaigns.update_success"));
		},
		onError: () => {
			toast.error(i18n.t("campaigns.update_error"));
		},
	});
};

export const useUpdateMutipleCampaigns = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ ids, payload }: { ids: string[]; payload: any }) =>
			updateMutipleCampaigns(ids, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["campaigns"] });
			toast.success(i18n.t("campaigns.update_success"));
		},
		onError: () => {
			toast.error(i18n.t("campaigns.update_error"));
		},
	});
};

export const useCreateCampaign = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: any) => createCampaign(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["campaigns"] });
			toast.success(i18n.t("campaigns.create_success"));
		},
		onError: () => {
			toast.error(i18n.t("campaigns.create_error"));
		},
	});
};

export const useDeleteCampaign = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (slug: string) => deleteCampaign(slug),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["campaigns"] });
			toast.success(i18n.t("campaigns.delete_success"));
		},
		onError: () => {
			toast.error(i18n.t("campaigns.delete_error"));
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

export const useDuplicateCampaign = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (slug: string) => duplicateCampaignAction(slug),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["campaigns"] });
		},
	});
};
