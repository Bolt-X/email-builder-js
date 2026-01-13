import {
	createItem,
	readItems,
	readItem,
	updateItem,
	deleteItem,
} from "@directus/sdk";
import { directusClientWithRest } from "../../services/directus";
import { Contact, ContactList, Segment } from "./types";

import contactListsData from "./data/contact-lists.json";

export async function getAllContacts(): Promise<Contact[]> {
	// Mock contacts for now
	return [
		{
			id: "contact-1",
			email: "info@example.com",
			firstName: "Linh",
			lastName: "Cao Thai",
			address: "456 Lac Long Quan, Hanoi",
			tags: ["insight", "marketing", "vip"],
			status: "subscribed",
			createdAt: "2025-10-25T00:00:00Z",
		},
		{
			id: "contact-2",
			email: "reach@horizon.solutions",
			firstName: "Thanh",
			lastName: "Dinh Van",
			address: "321 Tran Phu, Da Nang",
			tags: ["sales", "support"],
			status: "unsubscribed",
			createdAt: "2025-10-25T10:00:00Z",
		},
		{
			id: "contact-3",
			email: "connect@apex.tech",
			firstName: "Nam",
			lastName: "Ly Thi",
			address: "789 Le Loi, HCM",
			tags: ["analysis", "marketing"],
			status: "subscribed",
			createdAt: "2025-10-25T11:00:00Z",
		},
		{
			id: "contact-4",
			email: "sales@globex.org",
			firstName: "Huy",
			lastName: "Vu Van",
			address: "101 Ly Thuong Kiet, Hanoi",
			tags: ["sales", "vip"],
			status: "non-subscribed",
			createdAt: "2025-10-25T12:00:00Z",
		},
		{
			id: "contact-5",
			email: "engage@summit.plus",
			firstName: "Quang",
			lastName: "Thai Tu",
			address: "234 Nguyen Trai, HCM",
			tags: ["insight", "support"],
			status: "subscribed",
			createdAt: "2025-10-25T13:00:00Z",
		},
		{
			id: "contact-6",
			email: "hella@pinnacle.co",
			firstName: "Duc",
			lastName: "Ho Cong",
			address: "567 Hai Ba Trung, Da Nang",
			tags: ["marketing"],
			status: "unsubscribed",
			createdAt: "2025-10-25T14:00:00Z",
		},
		{
			id: "contact-7",
			email: "team@vanguard.biz",
			firstName: "Thao",
			lastName: "Huynh The",
			address: "890 Ba Trieu, Hanoi",
			tags: ["analysis", "vip"],
			status: "unsubscribed",
			createdAt: "2025-10-25T15:00:00Z",
		},
		{
			id: "contact-8",
			email: "contact@innovate.io",
			firstName: "Tuan",
			lastName: "Truong Dinh",
			address: "123 Dien Bien Phu, HCM",
			tags: ["insight", "sales"],
			status: "non-subscribed",
			createdAt: "2025-10-25T16:00:00Z",
		},
		{
			id: "contact-9",
			email: "support@company.net",
			firstName: "Lan",
			lastName: "Pham Thi",
			address: "456 Hung Vuong, Da Nang",
			tags: ["support"],
			status: "non-subscribed",
			createdAt: "2025-10-25T17:00:00Z",
		},
		{
			id: "contact-10",
			email: "ceo@startup.vn",
			firstName: "Minh",
			lastName: "Nguyen Van",
			address: "12 Hoang Dieu, Hanoi",
			tags: ["vip", "insight"],
			status: "subscribed",
			createdAt: "2025-10-26T09:00:00Z",
		},
		{
			id: "contact-11",
			email: "hr@globalcorp.com",
			firstName: "Anh",
			lastName: "Tran Thi",
			address: "99 Nguyen Hue, HCM",
			tags: ["recruitment", "hr"],
			status: "subscribed",
			createdAt: "2025-10-26T10:30:00Z",
		},
		{
			id: "contact-12",
			email: "dev@techstack.io",
			firstName: "Binh",
			lastName: "Le Van",
			address: "55 Duy Tan, Hanoi",
			tags: ["developer", "tech"],
			status: "subscribed",
			createdAt: "2025-10-26T11:45:00Z",
		},
		{
			id: "contact-13",
			email: "marketing@brand.co",
			firstName: "Phuong",
			lastName: "Hoang Thi",
			address: "88 Le Thanh Ton, HCM",
			tags: ["marketing", "creative"],
			status: "bounced",
			createdAt: "2025-10-26T14:20:00Z",
		},
		{
			id: "contact-14",
			email: "hello@freelancer.com",
			firstName: "Dung",
			lastName: "Nguyen Duc",
			address: "77 Vo Van Kiet, Da Nang",
			tags: ["freelance"],
			status: "subscribed",
			createdAt: "2025-10-27T08:15:00Z",
		},
		{
			id: "contact-15",
			email: "partner@enterprise.com",
			firstName: "Khanh",
			lastName: "Vu Thi",
			address: "22 Phan Chu Trinh, Hanoi",
			tags: ["partner", "corporate"],
			status: "unsubscribed",
			createdAt: "2025-10-27T09:40:00Z",
		},
	];
}

/**
 * Transform Directus format to ContactList model
 */
function transformContactListFromDirectus(item: any): ContactList {
	const contactIds = item.contact_ids
		? typeof item.contact_ids === "string"
			? JSON.parse(item.contact_ids)
			: item.contact_ids
		: [];
	return {
		id: item.id,
		name: item.name,
		description: item.description,
		isDefault: item.is_default || false,
		isEnabled: item.is_enabled !== false, // Default to true
		contactCount: item.contact_count || contactIds.length,
		contactIds,
		tags: item.tags
			? typeof item.tags === "string"
				? JSON.parse(item.tags)
				: item.tags
			: [],
		createdAt: item.date_created,
		updatedAt: item.date_updated,
	};
}

// ... existing transform functions ...
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
		// Try Directus first
		const res = await directusClientWithRest.request(
			readItems("contact_lists", {
				fields: ["*"],
				sort: ["name"],
			})
		);
		return (res as any[]).map(transformContactListFromDirectus);
	} catch (error) {
		console.warn("Directus failed, using mock data for contact lists");
		return (contactListsData as any[]).map(transformContactListFromDirectus);
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
		const mock = contactListsData.find((l) => l.id === id);
		return mock ? transformContactListFromDirectus(mock) : null;
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
		const res = await directusClientWithRest.request(readItem("segments", id));
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
