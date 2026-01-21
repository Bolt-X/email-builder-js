import {
	createItem,
	readItems,
	readItem,
	updateItem,
	deleteItem,
} from "@directus/sdk";
import { directusClientWithRest } from "../../services/directus";
import { Contact, ContactList, Segment } from "./types";

/**
 * Transform Directus Subscriber to Contact model
 */
export function transformContactFromDirectus(item: any): Contact {
	return {
		id: item.id,
		email: item.email,
		name: item.name,
		status: item.status,
		attribs: item.attribs,
		date_created: item.date_created,
		date_updated: item.date_updated,
	};
}

/**
 * Transform Contact model to Directus format
 */
export function transformContactToDirectus(contact: Partial<Contact>): any {
	const directusContact: any = {};
	if (contact.email !== undefined) directusContact.email = contact.email;
	if (contact.name !== undefined) directusContact.name = contact.name;
	if (contact.status !== undefined) directusContact.status = contact.status;
	if (contact.attribs !== undefined) directusContact.attribs = contact.attribs;
	return directusContact;
}

/**
 * Transform Directus Contact List to ContactList model
 */
export function transformContactListFromDirectus(item: any): ContactList {
	return {
		slug: item.slug,
		name: item.name,
		status: item.status,
		subscribers: item.subscribers?.map((s: any) => {
			// Directus uses 'subscriber' field in junction table
			return typeof s.subscriber === "object"
				? transformContactFromDirectus(s.subscriber)
				: ({ id: s.subscriber } as Contact);
		}),
		date_created: item.date_created,
		date_updated: item.date_updated,
		contactCount: item.subscribers?.length || 0,
		is_default: item.is_default,
	};
}

/**
 * Transform ContactList model to Directus format
 */
export function transformContactListToDirectus(
	list: Partial<ContactList>,
): any {
	const directusList: any = {};
	if (list.slug !== undefined) directusList.slug = list.slug;
	if (list.name !== undefined) directusList.name = list.name;
	if (list.status !== undefined) directusList.status = list.status;
	if (list.is_default !== undefined) directusList.is_default = list.is_default;
	return directusList;
}

export async function getAllContacts(): Promise<Contact[]> {
	try {
		const res = await directusClientWithRest.request(
			readItems("subscribers", {
				fields: ["*"],
				sort: ["-date_created"],
			}),
		);
		return (res as any[]).map(transformContactFromDirectus);
	} catch (error) {
		console.error("Error fetching subscribers:", error);
		return [];
	}
}

export async function getAllContactLists(): Promise<ContactList[]> {
	try {
		const res = await directusClientWithRest.request(
			readItems("contact_lists", {
				fields: ["*", "subscribers.subscriber.*"],
				sort: ["name"],
			}),
		);
		return (res as any[]).map(transformContactListFromDirectus);
	} catch (error) {
		console.error("Error fetching contact lists:", error);
		return [];
	}
}

export async function getContactListBySlug(
	slug: string,
): Promise<ContactList | null> {
	try {
		const res = await directusClientWithRest.request(
			readItem("contact_lists", slug, {
				fields: ["*", "subscribers.subscriber.*"],
			}),
		);
		return transformContactListFromDirectus(res as any);
	} catch (error) {
		console.error("Error fetching contact list:", error);
		return null;
	}
}

// Keeping these for now, may need updating if they use ID instead of Slug
export async function createContactList(
	list: Omit<ContactList, "createdAt" | "updatedAt" | "contactCount">,
): Promise<ContactList> {
	try {
		const payload = transformContactListToDirectus(list);
		const res = await directusClientWithRest.request(
			createItem("contact_lists", payload),
		);
		return transformContactListFromDirectus(res as any);
	} catch (error) {
		console.error("Error creating contact list:", error);
		throw error;
	}
}

export async function updateContactList(
	slug: string,
	list: Partial<Omit<ContactList, "createdAt" | "updatedAt">>,
): Promise<ContactList> {
	try {
		const payload = transformContactListToDirectus(list);
		const res = await directusClientWithRest.request(
			updateItem("contact_lists", slug, payload),
		);
		return transformContactListFromDirectus(res as any);
	} catch (error) {
		console.error("Error updating contact list:", error);
		throw error;
	}
}

export async function deleteContactList(slug: string): Promise<void> {
	try {
		await directusClientWithRest.request(deleteItem("contact_lists", slug));
	} catch (error) {
		console.error("Error deleting contact list:", error);
		throw error;
	}
}

export async function duplicateContactList(
	slug: string,
	newName?: string,
): Promise<ContactList> {
	try {
		const original = await getContactListBySlug(slug);
		if (!original) throw new Error("Contact list not found");

		return await createContactList({
			name: newName || `${original.name} (Copy)`,
			slug: `${original.slug}-copy-${Date.now()}`,
			status: "draft",
		});
	} catch (error) {
		console.error("Error duplicating contact list:", error);
		throw error;
	}
}

// Segment functions (keeping these separate but updated mappings if needed)
function transformSegmentFromDirectus(item: any): Segment {
	return {
		id: item.id,
		name: item.name,
		description: item.description,
		conditions: item.conditions
			? typeof item.conditions === "string"
				? JSON.parse(item.conditions)
				: item.conditions
			: [],
		logicOperator: item.logic_operator || "AND",
		estimatedCount: item.estimated_count,
		createdAt: item.date_created,
		updatedAt: item.date_updated,
	};
}

function transformSegmentToDirectus(segment: Partial<Segment>): Partial<any> {
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
			}),
		);
		return (res as any[]).map(transformSegmentFromDirectus);
	} catch (error) {
		console.error("Error fetching segments:", error);
		return [];
	}
}

export async function getContactListById(id: string | number) {
	return getContactListBySlug(String(id));
}

export async function exportContactList(slug: string | number): Promise<void> {
	console.log("Exporting contact list:", slug);
	// TODO: Implement actual export logic (CSV/Excel)
}
