export type ContactStatus =
	| "subscribed"
	| "unsubscribed"
	| "non-subscribed"
	| "bounced";

export interface Contact {
	id: string | number;
	email: string;
	firstName?: string;
	lastName?: string;
	address?: string;
	tags: string[];
	status: ContactStatus;
	createdAt?: string;
}

export interface ContactList {
	id: string | number;
	name: string;
	description?: string;
	isDefault: boolean;
	isEnabled: boolean;
	contactCount: number; // Computed from contactIds length
	contactIds: (string | number)[]; // For backward compatibility
	tags?: string[];
	createdAt?: string;
	updatedAt?: string;
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
