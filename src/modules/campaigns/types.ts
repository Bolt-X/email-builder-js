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
	templateId?: string | number; // Selected template for sending (from campaign's templates)
	// Email settings
	subject?: string;
	fromAddress?: string; // Sender identity
	// Recipients (can be lists or segments)
	recipients?: Recipient[];
	// Legacy support - will be deprecated in favor of recipients
	contactListId?: string | number;
	// Organization
	tags?: string[]; // Tags for filtering and organization
	// Send settings
	sendTime?: SendTimeOption;
	scheduledAt?: string; // ISO date string - when scheduleAt is set, sendTime should be "schedule"
	// Legacy support
	scheduleAt?: string; // ISO date string
	// Stats (individual fields from API)
	bounces?: number | null;
	clicks?: number | null;
	sent?: number | null;
	views?: number | null;
	// Stats object (for backward compatibility and computed values)
	stats?: {
		sent: number;
		opened: number;
		clicked: number;
		bounced: number;
		total: number; // Total target recipients
	};
	// Timestamps (API format: snake_case)
	date_created?: string | null;
	date_updated?: string | null;
	date_started?: string | null;
	date_ended?: string | null;
	// Timestamps (camelCase for backward compatibility)
	createdAt?: string;
	updatedAt?: string;
	lastEditedAt?: string; // Last edit time for display
	startedAt?: string; // When the campaign started sending
	endedAt?: string; // When the campaign finished
	// User tracking
	user_created?: string | null;
	user_updated?: string | null;
	// Sort order
	sort?: number | null;
}

// Directus format (for API compatibility)
export interface DirectusCampaign {
	id: string | number;
	name: string;
	description?: string;
	status: CampaignStatus;
	template_id?: string | number;
	subject?: string;
	from_address?: string;
	recipients?: string; // JSON string array of Recipient
	contact_list_id?: string | number; // Legacy support
	tags?: string; // JSON string in Directus
	send_time?: string; // "now" | "schedule"
	scheduled_at?: string;
	schedule_at?: string; // Legacy support
	stats_sent?: number;
	stats_opened?: number;
	stats_clicked?: number;
	stats_bounced?: number;
	stats_total?: number;
	date_created?: string;
	date_updated?: string;
	last_edited_at?: string;
	started_at?: string;
	ended_at?: string;
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
