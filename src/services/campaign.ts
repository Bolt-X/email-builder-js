import {
	createItem,
	deleteItem,
	readItem,
	readItems,
	updateItem,
} from "@directus/sdk";
import { directusClientWithRest } from "./directus";
import {
	Campaign,
	DirectusCampaign,
	transformFromDirectus,
	transformToDirectus,
} from "../modules/campaigns";

export const getAllCampaigns = async () => {
	try {
		const res = await directusClientWithRest.request(
			readItems("campaigns", {
				fields: [
					"*",
					"tags.*",
					"tags.tag.*",
					"contact_lists.contact_lists_slug.*",
				],
				sort: "-date_created",
			}),
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
