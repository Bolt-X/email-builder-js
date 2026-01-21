export type CampaignStatus =
	| "draft"
	| "scheduled"
	| "running"
	| "finished"
	| "cancelled";

export type SendTimeOption = "now" | "schedule";

export type RecipientType = "list" | "segment";

export interface Recipient {
	id: string | number;
	type: RecipientType;
	name: string;
	count?: number; // Preview recipient count
}

export interface Campaign {
	slug: string;
	name: string;
	description?: string | null;
	status: CampaignStatus;
	template?: number | null; // ID of the template (M2O)
	// Email settings
	subject?: string;
	fromAddress?: string; // Note: Not found in current schema snippet, but used in UI
	// Recipients
	recipients?: Recipient[];
	contact_lists?: any[]; // M2M relationship
	// Organization
	tags?: any[]; // M2M relationship
	// Send settings
	sendTime?: SendTimeOption;
	date_scheduled?: string; // ISO date string
	date_started?: string;
	date_ended?: string;
	// Stats
	views?: number | null;
	clicks?: number | null;
	sent?: number | null;
	bounces?: number | null;
	// Metadata
	date_created?: string | null;
	date_updated?: string | null;
	user_created?: string | null;
	user_updated?: string | null;
	sort?: number | null;
}

// Directus format (for API compatibility)
export interface DirectusCampaign {
	slug: string;
	name: string;
	description?: string;
	status: CampaignStatus;
	template?: number;
	subject?: string;
	from_address?: string; // Keeping for compatibility, though not in schema snippet
	contact_lists?: any; // M2M
	tags?: any; // M2M
	date_scheduled?: string;
	date_started?: string;
	date_ended?: string;
	views?: number;
	clicks?: number;
	sent?: number;
	bounces?: number;
	date_created?: string;
	date_updated?: string;
	user_created?: string;
	user_updated?: string;
	sort?: number;
}

// Filter types
export interface CampaignFilters {
	searchQuery?: string;
	status?: CampaignStatus[];
	contactListId?: string | number;
	tags?: string[];
	dateRange?: {
		start: string;
		end: string;
	};
}
