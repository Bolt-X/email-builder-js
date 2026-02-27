import { create } from "zustand";
import { shallow } from "zustand/shallow";
import {
	Campaign,
	CampaignFilters,
	CampaignStatus,
} from "./types";
import {
	createCampaign,
	deleteCampaign,
	getCampaignById,
	getCampaigns,
	startCampaign,
	stopCampaign,
	updateCampaign,
} from "./service";

type CampaignState = {
	campaigns: Campaign[];
	currentCampaign: Campaign | null;
	loading: boolean;
	error: string | null;
	// Filter state
	searchQuery: string;
	statusFilter: CampaignStatus[];
	contactListFilter: string | number | null;
	tagsFilter: string[];
	dateRangeFilter: { start: string; end: string } | null;
	// View mode
	viewMode: "table" | "calendar";
};

const campaignStore = create<CampaignState>(() => ({
	campaigns: [],
	currentCampaign: null,
	loading: false,
	error: null,
	searchQuery: "",
	statusFilter: [],
	contactListFilter: null,
	tagsFilter: [],
	dateRangeFilter: null,
	viewMode: "table",
}));

// --- Selectors ---
export const useCampaigns = () => campaignStore((s) => s.campaigns);
export const useCampaignsLoading = () => campaignStore((s) => s.loading);
export const useCampaignsError = () => campaignStore((s) => s.error);
export const useCurrentCampaign = () =>
	campaignStore((s) => s.currentCampaign);
// Use shallow comparison to avoid creating new objects on every render
export const useCampaignFilters = () =>
	campaignStore(
		(s) => ({
			searchQuery: s.searchQuery,
			statusFilter: s.statusFilter,
			contactListFilter: s.contactListFilter,
			tagsFilter: s.tagsFilter,
			dateRangeFilter: s.dateRangeFilter,
		}),
		shallow
	);
export const useCampaignViewMode = () => campaignStore((s) => s.viewMode);

// --- Actions ---
export const setCurrentCampaign = (campaign: Campaign | null) => {
	campaignStore.setState({ currentCampaign: campaign });
};

export const setSearchQuery = (query: string) => {
	campaignStore.setState({ searchQuery: query });
};

export const setStatusFilter = (statuses: CampaignStatus[]) => {
	campaignStore.setState({ statusFilter: statuses });
};

export const setContactListFilter = (contactListId: string | number | null) => {
	campaignStore.setState({ contactListFilter: contactListId });
};

export const setTagsFilter = (tags: string[]) => {
	campaignStore.setState({ tagsFilter: tags });
};

export const setDateRangeFilter = (
	range: { start: string; end: string } | null
) => {
	campaignStore.setState({ dateRangeFilter: range });
};

export const setViewMode = (mode: "table" | "calendar") => {
	campaignStore.setState({ viewMode: mode });
};

export const clearFilters = () => {
	campaignStore.setState({
		searchQuery: "",
		statusFilter: [],
		contactListFilter: null,
		tagsFilter: [],
		dateRangeFilter: null,
	});
};

export const fetchCampaigns = async (filters?: CampaignFilters) => {
	try {
		campaignStore.setState({ loading: true, error: null });
		const res = await getCampaigns(filters);
		campaignStore.setState({
			campaigns: res ?? [],
			loading: false,
		});
	} catch (err: any) {
		campaignStore.setState({
			error: err.message,
			loading: false,
		});
	}
};

export const fetchCampaignById = async (id: string | number) => {
	try {
		campaignStore.setState({ loading: true, error: null });
		const res = await getCampaignById(id);
		if (res) {
			campaignStore.setState({
				currentCampaign: res,
				loading: false,
			});
		} else {
			throw new Error("Campaign not found");
		}
	} catch (err: any) {
		campaignStore.setState({
			error: err.message,
			loading: false,
		});
		throw err;
	}
};

export const createCampaignAction = async (
	campaign: Omit<Campaign, "id" | "createdAt" | "updatedAt">
): Promise<Campaign> => {
	try {
		campaignStore.setState({ loading: true, error: null });
		const newCampaign = await createCampaign(campaign);
		campaignStore.setState((state) => ({
			campaigns: [newCampaign, ...state.campaigns],
			loading: false,
		}));
		return newCampaign;
	} catch (err: any) {
		campaignStore.setState({
			error: err.message,
			loading: false,
		});
		throw err;
	}
};

export const updateCampaignAction = async (
	id: string | number,
	campaign: Partial<Omit<Campaign, "id" | "createdAt" | "updatedAt">>
): Promise<Campaign> => {
	try {
		campaignStore.setState({ loading: true, error: null });
		const updatedCampaign = await updateCampaign(id, campaign);
		campaignStore.setState((state) => ({
			campaigns: state.campaigns.map((c) =>
				c.id === id ? updatedCampaign : c
			),
			currentCampaign:
				state.currentCampaign?.id === id
					? updatedCampaign
					: state.currentCampaign,
			loading: false,
		}));
		return updatedCampaign;
	} catch (err: any) {
		campaignStore.setState({
			error: err.message,
			loading: false,
		});
		throw err;
	}
};

export const deleteCampaignAction = async (
	id: string | number
): Promise<void> => {
	try {
		campaignStore.setState({ loading: true, error: null });
		await deleteCampaign(id);
		campaignStore.setState((state) => ({
			campaigns: state.campaigns.filter((c) => c.id !== id),
			currentCampaign:
				state.currentCampaign?.id === id ? null : state.currentCampaign,
			loading: false,
		}));
	} catch (err: any) {
		campaignStore.setState({
			error: err.message,
			loading: false,
		});
		throw err;
	}
};

export const startCampaignAction = async (
	id: string | number
): Promise<Campaign> => {
	try {
		campaignStore.setState({ loading: true, error: null });
		const updatedCampaign = await startCampaign(id);
		campaignStore.setState((state) => ({
			campaigns: state.campaigns.map((c) =>
				c.id === id ? updatedCampaign : c
			),
			currentCampaign:
				state.currentCampaign?.id === id
					? updatedCampaign
					: state.currentCampaign,
			loading: false,
		}));
		return updatedCampaign;
	} catch (err: any) {
		campaignStore.setState({
			error: err.message,
			loading: false,
		});
		throw err;
	}
};

export const stopCampaignAction = async (
	id: string | number
): Promise<Campaign> => {
	try {
		campaignStore.setState({ loading: true, error: null });
		const updatedCampaign = await stopCampaign(id);
		campaignStore.setState((state) => ({
			campaigns: state.campaigns.map((c) =>
				c.id === id ? updatedCampaign : c
			),
			currentCampaign:
				state.currentCampaign?.id === id
					? updatedCampaign
					: state.currentCampaign,
			loading: false,
		}));
		return updatedCampaign;
	} catch (err: any) {
		campaignStore.setState({
			error: err.message,
			loading: false,
		});
		throw err;
	}
};
