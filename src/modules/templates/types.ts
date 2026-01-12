import { TEditorConfiguration } from "../../documents/editor/core";

export type EmailBuilderJSON = TEditorConfiguration;

export interface Template {
	id: string | number;
	campaignId: string | number; // REQUIRED - Template belongs to a campaign
	name: string;
	description?: string;
	json: EmailBuilderJSON; // Renamed from 'settings'
	html: string; // Renamed from 'body'
	thumbnail?: string;
	createdAt?: string;
	updatedAt?: string;
}

// Directus format (for API compatibility)
export interface DirectusTemplate {
	id: string | number;
	campaign_id?: string | number;
	name: string;
	subject?: string;
	body?: string;
	settings?: string; // JSON string
	thumbnail?: string;
	date_created?: string;
	date_updated?: string;
}
