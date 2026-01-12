import {
	createItem,
	readItems,
	readItem,
	updateItem,
	deleteItem,
} from "@directus/sdk";
import { directusClientWithRest } from "../../services/directus";
import { Contact, ContactList, Segment } from "./types";

export async function getAllContacts(): Promise<Contact[]> {
	try {
		const res = await directusClientWithRest.request(
			readItems("contacts", {
				fields: ["*"],
				sort: ["email"],
			})
		);
		return (res as any[]).map((item) => ({
			id: item.id,
			email: item.email,
			firstName: item.first_name,
			lastName: item.last_name,
			name: item.name || `${item.first_name || ""} ${item.last_name || ""}`.trim(),
			tags: item.tags ? JSON.parse(item.tags) : [],
			status: item.status || "subscribed",
			createdAt: item.date_created,
		}));
	} catch (error) {
		console.error("Error fetching contacts:", error);
		return [];
	}
}

/**
 * Transform Directus format to ContactList model
 */
function transformContactListFromDirectus(item: any): ContactList {
	const contactIds = item.contact_ids ? JSON.parse(item.contact_ids) : [];
	return {
		id: item.id,
		name: item.name,
		description: item.description,
		isDefault: item.is_default || false,
		isEnabled: item.is_enabled !== false, // Default to true
		contactCount: item.contact_count || contactIds.length,
		contactIds,
		tags: item.tags ? JSON.parse(item.tags) : [],
		createdAt: item.date_created,
		updatedAt: item.date_updated,
	};
}

/**
 * Transform ContactList model to Directus format
 */
function transformContactListToDirectus(
	list: Partial<ContactList>
): Partial<any> {
	const directusList: any = {};
	if (list.name !== undefined) directusList.name = list.name;
	if (list.description !== undefined)
		directusList.description = list.description;
	if (list.isDefault !== undefined) directusList.is_default = list.isDefault;
	if (list.isEnabled !== undefined) directusList.is_enabled = list.isEnabled;
	if (list.contactIds !== undefined)
		directusList.contact_ids = JSON.stringify(list.contactIds);
	if (list.tags !== undefined) directusList.tags = JSON.stringify(list.tags);
	return directusList;
}

export async function getAllContactLists(): Promise<ContactList[]> {
	try {
		const res = await directusClientWithRest.request(
			readItems("contact_lists", {
				fields: ["*"],
				sort: ["name"],
			})
		);
		return (res as any[]).map(transformContactListFromDirectus);
	} catch (error) {
		console.error("Error fetching contact lists:", error);
		return [];
	}
}

export async function getContactListById(
	id: string | number
): Promise<ContactList | null> {
	try {
		const res = await directusClientWithRest.request(
			readItem("contact_lists", id)
		);
		return transformContactListFromDirectus(res as any);
	} catch (error) {
		console.error("Error fetching contact list:", error);
		return null;
	}
}

export async function createContactList(
	list: Omit<ContactList, "id" | "createdAt" | "updatedAt" | "contactCount">
): Promise<ContactList> {
	try {
		const payload = transformContactListToDirectus(list);
		const res = await directusClientWithRest.request(
			createItem("contact_lists", payload)
		);
		return transformContactListFromDirectus(res as any);
	} catch (error) {
		console.error("Error creating contact list:", error);
		throw error;
	}
}

export async function updateContactList(
	id: string | number,
	list: Partial<Omit<ContactList, "id" | "createdAt" | "updatedAt">>
): Promise<ContactList> {
	try {
		const payload = transformContactListToDirectus(list);
		const res = await directusClientWithRest.request(
			updateItem("contact_lists", id, payload)
		);
		return transformContactListFromDirectus(res as any);
	} catch (error) {
		console.error("Error updating contact list:", error);
		throw error;
	}
}

export async function deleteContactList(id: string | number): Promise<void> {
	try {
		await directusClientWithRest.request(deleteItem("contact_lists", id));
	} catch (error) {
		console.error("Error deleting contact list:", error);
		throw error;
	}
}

export async function exportContactList(id: string | number): Promise<void> {
	try {
		// TODO: Implement actual CSV export
		// This is a placeholder - should fetch contacts and generate CSV
		const list = await getContactListById(id);
		if (!list) throw new Error("Contact list not found");

		// For now, just log
		console.log("Exporting contact list:", list.name);
		// In production, this would:
		// 1. Fetch all contacts in the list
		// 2. Filter only subscribed contacts (GDPR compliance)
		// 3. Generate CSV
		// 4. Trigger download
	} catch (error) {
		console.error("Error exporting contact list:", error);
		throw error;
	}
}

export async function duplicateContactList(
	id: string | number,
	newName?: string
): Promise<ContactList> {
	try {
		const original = await getContactListById(id);
		if (!original) throw new Error("Contact list not found");

		return await createContactList({
			name: newName || `${original.name} (Copy)`,
			description: original.description,
			isDefault: false,
			isEnabled: original.isEnabled,
			contactIds: original.contactIds,
			tags: original.tags,
		});
	} catch (error) {
		console.error("Error duplicating contact list:", error);
		throw error;
	}
}

// Segment functions
function transformSegmentFromDirectus(item: any): Segment {
	return {
		id: item.id,
		name: item.name,
		description: item.description,
		conditions: item.conditions ? JSON.parse(item.conditions) : [],
		logicOperator: item.logic_operator || "AND",
		estimatedCount: item.estimated_count,
		createdAt: item.date_created,
		updatedAt: item.date_updated,
	};
}

function transformSegmentToDirectus(
	segment: Partial<Segment>
): Partial<any> {
	const directusSegment: any = {};
	if (segment.name !== undefined) directusSegment.name = segment.name;
	if (segment.description !== undefined)
		directusSegment.description = segment.description;
	if (segment.conditions !== undefined)
		directusSegment.conditions = JSON.stringify(segment.conditions);
	if (segment.logicOperator !== undefined)
		directusSegment.logic_operator = segment.logicOperator;
	return directusSegment;
}

export async function getAllSegments(): Promise<Segment[]> {
	try {
		const res = await directusClientWithRest.request(
			readItems("segments", {
				fields: ["*"],
				sort: ["name"],
			})
		);
		return (res as any[]).map(transformSegmentFromDirectus);
	} catch (error) {
		console.error("Error fetching segments:", error);
		return [];
	}
}

export async function createSegment(
	segment: Omit<Segment, "id" | "createdAt" | "updatedAt" | "estimatedCount">
): Promise<Segment> {
	try {
		const payload = transformSegmentToDirectus(segment);
		const res = await directusClientWithRest.request(
			createItem("segments", payload)
		);
		return transformSegmentFromDirectus(res as any);
	} catch (error) {
		console.error("Error creating segment:", error);
		throw error;
	}
}

export async function updateSegment(
	id: string | number,
	segment: Partial<Omit<Segment, "id" | "createdAt" | "updatedAt">>
): Promise<Segment> {
	try {
		const payload = transformSegmentToDirectus(segment);
		const res = await directusClientWithRest.request(
			updateItem("segments", id, payload)
		);
		return transformSegmentFromDirectus(res as any);
	} catch (error) {
		console.error("Error updating segment:", error);
		throw error;
	}
}

export async function deleteSegment(id: string | number): Promise<void> {
	try {
		await directusClientWithRest.request(deleteItem("segments", id));
	} catch (error) {
		console.error("Error deleting segment:", error);
		throw error;
	}
}

export async function calculateSegmentCount(
	id: string | number
): Promise<number> {
	try {
		// TODO: Implement actual segment count calculation
		// This should evaluate the segment conditions against all contacts
		// For now, return a placeholder
		const res = await directusClientWithRest.request(
			readItem("segments", id)
		);
		const segment = transformSegmentFromDirectus(res as any);
		
		// Placeholder: In production, this would:
		// 1. Fetch all contacts
		// 2. Apply segment conditions
		// 3. Count matching contacts
		// 4. Return count
		
		return segment.estimatedCount || 0;
	} catch (error) {
		console.error("Error calculating segment count:", error);
		throw error;
	}
}
