import { createItem, readItems, deleteItem } from "@directus/sdk";
import { directusClientWithRest } from "../../services/directus";
import { Media } from "./types";

export async function getMediaByCampaign(
	campaignId: string | number
): Promise<Media[]> {
	try {
		const res = await directusClientWithRest.request(
			readItems("media", {
				fields: ["*"],
				filter: {
					campaign_id: {
						_eq: campaignId,
					},
				},
				sort: ["-date_created"],
			})
		);
		// Transform Directus format to Media model
		return (res as any[]).map((item) => ({
			id: item.id,
			campaignId: item.campaign_id || campaignId,
			type: item.type || "file",
			url: item.url || "",
			name: item.name || "",
			size: item.size || 0,
			mimeType: item.mime_type,
			createdAt: item.date_created,
		}));
	} catch (error) {
		console.error("Error fetching media:", error);
		return [];
	}
}

export async function uploadMedia(
	campaignId: string | number,
	file: File
): Promise<Media> {
	try {
		// TODO: Implement actual file upload to Directus
		// This is a placeholder
		const formData = new FormData();
		formData.append("file", file);
		formData.append("campaign_id", campaignId.toString());

		// For now, return a mock response
		return {
			id: Date.now(),
			campaignId,
			type: file.type.startsWith("image/") ? "image" : "file",
			url: URL.createObjectURL(file),
			name: file.name,
			size: file.size,
			mimeType: file.type,
			createdAt: new Date().toISOString(),
		};
	} catch (error) {
		console.error("Error uploading media:", error);
		throw error;
	}
}

export async function deleteMedia(id: string | number): Promise<void> {
	try {
		await directusClientWithRest.request(deleteItem("media", id));
	} catch (error) {
		console.error("Error deleting media:", error);
		throw error;
	}
}
