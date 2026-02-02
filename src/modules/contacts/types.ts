export type ContactStatus = "subscribed" | "non_subscribed" | "unsubscribed";

export interface Contact {
	id?: string;
	email: string;
	first_name?: string;
	last_name?: string;
	status: ContactStatus;
	date_created?: string;
	date_updated?: string;
}

export type ContactListStatus = "published" | "draft" | "archived";

export interface ContactList {
	slug?: string;
	name: string;
	status?: ContactListStatus;
	subscribers?: Contact[];
	date_created?: string;
	date_updated?: string;
	// Helper field for UI
	contactCount?: number;
	is_default?: boolean;
	description?: string;
	campaigns?: string[];
}

export interface DirectusSubscriber {
	id: string;
	email: string;
	name?: string;
	status: ContactStatus;
	date_created?: string;
	date_updated?: string;
}

export interface DirectusContactList {
	slug: string;
	name: string;
	status: ContactListStatus;
	subscribers?: {
		subscribers_id: DirectusSubscriber | string;
	}[];
	date_created?: string;
	date_updated?: string;
}

// Segment types
export type SegmentConditionOperator =
	| "equals"
	| "not_equals"
	| "contains"
	| "not_contains"
	| "in"
	| "not_in"
	| "greater_than"
	| "less_than"
	| "after"
	| "before";

export type SegmentConditionField =
	| "tag"
	| "status"
	| "joined_date"
	| "in_list";

export interface SegmentCondition {
	id: string;
	field: SegmentConditionField;
	operator: SegmentConditionOperator;
	value: string | string[] | number | Date;
}

export type SegmentLogicOperator = "AND" | "OR";

export interface Segment {
	id: string | number;
	name: string;
	description?: string;
	conditions: SegmentCondition[];
	logicOperator: SegmentLogicOperator; // AND or OR between condition groups
	estimatedCount?: number; // Realtime count
	createdAt?: string;
	updatedAt?: string;
}
