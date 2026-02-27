import {
	createItem,
	deleteItem,
	readItem,
	readItems,
	updateItem,
	deleteItems,
	updateItems,
} from "@directus/sdk";
import { directusClientWithRest } from "./directus";
import {
	Campaign,
	DirectusCampaign,
	transformFromDirectus,
	transformToDirectus,
} from "../modules/campaigns";

export const getAllCampaigns = async (filters?: any) => {
	try {
		const query: any = {
			fields: [
				"*",
				"tags.*",
				"tags.tag.*",
				"contact_lists.contact_lists_slug.*",
			],
			sort: "-date_created",
		};

		if (filters) {
			const filterConditions: any[] = [];

			if (filters.searchQuery) {
				filterConditions.push({
					name: { _icontains: filters.searchQuery },
				});
			}

			if (filters.status && filters.status.length > 0) {
				filterConditions.push({
					status: { _in: filters.status },
				});
			}

			if (filters.contactListId) {
				filterConditions.push({
					contact_lists: {
						contact_lists_slug: {
							_eq: filters.contactListId,
						},
					},
				});
			}

			// Add other filters as needed

			if (filterConditions.length > 0) {
				query.filter =
					filterConditions.length === 1
						? filterConditions[0]
						: { _and: filterConditions };
			}
		}

		const res = await directusClientWithRest.request(
			readItems("campaigns", query),
		);
		return (res as DirectusCampaign[]).map(transformFromDirectus);
	} catch (error) {
		console.error("Failed to fetch campaigns:", error);
		return [];
	}
};

export const getCampaignById = async (id: string | number) => {
	try {
		const res = await directusClientWithRest.request(
			readItem("campaigns", id, {
				fields: [
					"*",
					"tags.*",
					"tags.tag.*",
					"contact_lists.contact_lists_slug.*",
				],
			}),
		);
		return transformFromDirectus(res as DirectusCampaign);
	} catch (error) {
		console.error("Failed to fetch campaign:", error);
		return null;
	}
};

export const createCampaign = async (data: Campaign) => {
	try {
		const payload = transformToDirectus(data);
		const res = await directusClientWithRest.request(
			createItem("campaigns", payload as any, {
				fields: [
					"*",
					"tags.*",
					"tags.tag.*",
					"contact_lists.contact_lists_slug.*",
				],
			}),
		);
		console.log("Create Campaign Response:", res);
		return transformFromDirectus(res as DirectusCampaign);
	} catch (error) {
		console.error("Failed to create campaign:", error);
		throw error;
	}
};

export const updateCampaign = async (id: string, data: Partial<Campaign>) => {
	try {
		const payload = transformToDirectus(data);
		const res = await directusClientWithRest.request(
			updateItem("campaigns", id, payload as any, {
				fields: [
					"*",
					"tags.*",
					"tags.tag.*",
					"contact_lists.contact_lists_slug.*",
				],
			}),
		);
		return transformFromDirectus(res as DirectusCampaign);
	} catch (error) {
		console.error("Failed to update campaign:", error);
		throw error;
	}
};

export const updateMutipleCampaigns = async (
	ids: string[],
	data: Partial<Campaign>,
) => {
	try {
		const payload = transformToDirectus(data);
		const res = await directusClientWithRest.request(
			updateItems("campaigns", ids, payload as any, {
				fields: [
					"*",
					"tags.*",
					"tags.tag.*",
					"contact_lists.contact_lists_slug.*",
				],
			}),
		);
		return res ?? null;
	} catch (error) {
		console.error("Failed to update campaigns:", error);
		throw error;
	}
};

export const deleteCampaign = async (id: string | number) => {
	try {
		const res = await directusClientWithRest.request(
			deleteItem("campaigns", id),
		);
		return res ?? null;
	} catch (error) {
		console.error("Failed to delete campaign:", error);
		throw error;
	}
};

export const deleteMutipleCampaigns = async (ids: string[]) => {
	try {
		const res = await directusClientWithRest.request(
			deleteItems("campaigns", ids),
		);
		return res ?? null;
	} catch (error) {
		console.error("Failed to delete campaigns:", error);
		throw error;
	}
};
