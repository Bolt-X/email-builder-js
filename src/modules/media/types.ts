export type MediaType = "image" | "file";

export interface Media {
	id: string | number;
	campaignId: string | number; // REQUIRED - Media belongs to a campaign
	type: MediaType;
	url: string;
	name: string;
	size: number;
	mimeType?: string;
	createdAt?: string;
}
