import { create } from "zustand";
import { CampaignStats } from "./types";

type AnalyticsState = {
	stats: Record<string | number, CampaignStats>;
	loading: boolean;
	error: string | null;
};

const analyticsStore = create<AnalyticsState>(() => ({
	stats: {},
	loading: false,
	error: null,
}));

export const useCampaignStats = (campaignId: string | number) =>
	analyticsStore((s) => s.stats[campaignId]);
export const useAnalyticsLoading = () => analyticsStore((s) => s.loading);
