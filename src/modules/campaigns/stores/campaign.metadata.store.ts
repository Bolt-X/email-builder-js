import { create } from "zustand";
import { shallow } from "zustand/shallow";
import { Campaign, CampaignFilters, CampaignStatus } from "../types";
import {
	createCampaign,
	deleteCampaign,
	getCampaignById,
	getCampaigns,
	updateCampaign,
	duplicateCampaign,
} from "../service";

/**
 * Campaign Metadata Store
 * Manages campaign metadata: name, status, schedule, recipients, etc.
 * Separated from template and media stores.
 */
type CampaignMetadataState = {
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
	// Autosave state
	autosaveEnabled: boolean;
	lastSavedAt: string | null;
	isDirty: boolean;
	// Column visibility
	visibleColumns: string[];
};

const DEFAULT_COLUMNS = ["status", "contacts", "tags", "timestamps", "stats"];

const getStoredColumns = (): string[] => {
	const stored = localStorage.getItem("campaign_list_columns");
	return stored ? JSON.parse(stored) : DEFAULT_COLUMNS;
};

const campaignMetadataStore = create<CampaignMetadataState>(() => ({
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
	autosaveEnabled: false,
	lastSavedAt: null,
	isDirty: false,
	visibleColumns: getStoredColumns(),
}));

// --- Selectors ---
export const useCampaigns = () => campaignMetadataStore((s) => s.campaigns);
export const useCampaignsLoading = () =>
	campaignMetadataStore((s) => s.loading);
export const useCampaignsError = () => campaignMetadataStore((s) => s.error);
export const useCurrentCampaign = () =>
	campaignMetadataStore((s) => s.currentCampaign);
export const useCampaignFilters = () =>
	campaignMetadataStore(
		(s) => ({
			searchQuery: s.searchQuery,
			statusFilter: s.statusFilter,
			contactListFilter: s.contactListFilter,
			tagsFilter: s.tagsFilter,
			dateRangeFilter: s.dateRangeFilter,
		}),
		shallow,
	);
export const useCampaignViewMode = () =>
	campaignMetadataStore((s) => s.viewMode);
export const useAutosaveState = () =>
	campaignMetadataStore((s) => ({
		enabled: s.autosaveEnabled,
		lastSavedAt: s.lastSavedAt,
		isDirty: s.isDirty,
	}));
export const useVisibleColumns = () =>
	campaignMetadataStore((s) => s.visibleColumns);

// --- Actions ---
export const setCurrentCampaign = (campaign: Campaign | null) => {
	campaignMetadataStore.setState({ currentCampaign: campaign, isDirty: false });
};

export const updateCurrentCampaign = (updates: Partial<Campaign>) => {
	campaignMetadataStore.setState((state) => ({
		currentCampaign: state.currentCampaign
			? { ...state.currentCampaign, ...updates }
			: null,
		isDirty: true,
	}));
};

export const setSearchQuery = (query: string) => {
	campaignMetadataStore.setState({ searchQuery: query });
};

export const setStatusFilter = (statuses: CampaignStatus[]) => {
	campaignMetadataStore.setState({ statusFilter: statuses });
};

export const setContactListFilter = (contactListId: string | number | null) => {
	campaignMetadataStore.setState({ contactListFilter: contactListId });
};

export const setTagsFilter = (tags: string[]) => {
	campaignMetadataStore.setState({ tagsFilter: tags });
};

export const setDateRangeFilter = (
	range: { start: string; end: string } | null,
) => {
	campaignMetadataStore.setState({ dateRangeFilter: range });
};

export const setViewMode = (mode: "table" | "calendar") => {
	campaignMetadataStore.setState({ viewMode: mode });
};

export const setVisibleColumns = (columns: string[]) => {
	campaignMetadataStore.setState({ visibleColumns: columns });
	localStorage.setItem("campaign_list_columns", JSON.stringify(columns));
};

export const clearFilters = () => {
	campaignMetadataStore.setState({
		searchQuery: "",
		statusFilter: [],
		contactListFilter: null,
		tagsFilter: [],
		dateRangeFilter: null,
	});
};

export const setDirty = (dirty: boolean) => {
	campaignMetadataStore.setState({ isDirty: dirty });
};

export const markSaved = () => {
	campaignMetadataStore.setState({
		lastSavedAt: new Date().toISOString(),
		isDirty: false,
	});
};

export const fetchCampaigns = async (filters?: CampaignFilters) => {
	try {
		campaignMetadataStore.setState({ loading: true, error: null });
		const res = await getCampaigns(filters);
		campaignMetadataStore.setState({
			campaigns: res ?? [],
			loading: false,
		});
	} catch (err: any) {
		campaignMetadataStore.setState({
			error: err.message,
			loading: false,
		});
	}
};

export const fetchCampaignById = async (id: string | number) => {
	try {
		campaignMetadataStore.setState({ loading: true, error: null });
		const res = await getCampaignById(id);
		if (res) {
			campaignMetadataStore.setState({
				currentCampaign: res,
				loading: false,
				isDirty: false,
			});
		} else {
			throw new Error("Campaign not found");
		}
	} catch (err: any) {
		campaignMetadataStore.setState({
			error: err.message,
			loading: false,
		});
		throw err;
	}
};

export const createCampaignAction = async (
	campaign: Omit<Campaign, "id" | "createdAt" | "updatedAt">,
): Promise<Campaign> => {
	try {
		campaignMetadataStore.setState({ loading: true, error: null });
		const newCampaign = await createCampaign(campaign);
		campaignMetadataStore.setState((state) => ({
			campaigns: [newCampaign, ...state.campaigns],
			loading: false,
		}));
		markSaved();
		return newCampaign;
	} catch (err: any) {
		campaignMetadataStore.setState({
			error: err.message,
			loading: false,
		});
		throw err;
	}
};

export const updateCampaignMetadataAction = async (
	id: string | number,
	campaign: Partial<Omit<Campaign, "id" | "createdAt" | "updatedAt">>,
): Promise<Campaign> => {
	try {
		// Optimistic update
		campaignMetadataStore.setState((state) => ({
			error: null,
			campaigns: state.campaigns.map((c) =>
				c.slug === id ? { ...c, ...campaign } : c,
			),
			currentCampaign:
				state.currentCampaign?.slug === id
					? { ...state.currentCampaign, ...campaign }
					: state.currentCampaign,
		}));

		const updatedCampaign = await updateCampaign(id, campaign);

		// Sync with actual server data
		campaignMetadataStore.setState((state) => ({
			campaigns: state.campaigns.map((c) =>
				c.slug === id ? updatedCampaign : c,
			),
			currentCampaign:
				state.currentCampaign?.slug === id
					? updatedCampaign
					: state.currentCampaign,
		}));
		markSaved();
		return updatedCampaign;
	} catch (err: any) {
		campaignMetadataStore.setState({
			error: err.message,
			loading: false,
		});
		throw err;
	}
};

export const deleteCampaignAction = async (slug: string): Promise<void> => {
	try {
		campaignMetadataStore.setState({ loading: true, error: null });
		await deleteCampaign(slug);
		campaignMetadataStore.setState((state) => ({
			campaigns: state.campaigns.filter((c) => c.slug !== slug),
			currentCampaign:
				state.currentCampaign?.slug === slug ? null : state.currentCampaign,
			loading: false,
		}));
	} catch (err: any) {
		campaignMetadataStore.setState({
			error: err.message,
			loading: false,
		});
		throw err;
	}
};

export const duplicateCampaignAction = async (
	id: string | number,
	newName?: string,
): Promise<Campaign> => {
	try {
		campaignMetadataStore.setState({ loading: true, error: null });
		const newCampaign = await duplicateCampaign(id, newName);
		campaignMetadataStore.setState((state) => ({
			campaigns: [newCampaign, ...state.campaigns],
			loading: false,
		}));
		return newCampaign;
	} catch (err: any) {
		campaignMetadataStore.setState({
			error: err.message,
			loading: false,
		});
		throw err;
	}
};
