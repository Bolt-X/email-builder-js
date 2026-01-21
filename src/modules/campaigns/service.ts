import {
	createItem,
	deleteItem,
	readItem,
	readItems,
	updateItem,
} from "@directus/sdk";
import { directusClientWithRest } from "../../services/directus";
import {
	Campaign,
	CampaignFilters,
	DirectusCampaign,
	Recipient,
} from "./types";

/**
 * Transform Directus format to Campaign model
 */
export function transformFromDirectus(
	directusCampaign: DirectusCampaign,
): Campaign {
	return {
		slug: directusCampaign.slug,
		name: directusCampaign.name,
		description: directusCampaign.description,
		status: directusCampaign.status,
		template: directusCampaign.template,
		subject: directusCampaign.subject || "",
		fromAddress: directusCampaign.from_address || "",
		recipients: (directusCampaign.contact_lists || []).map((t: any) => {
			if (typeof t === "object" && t.contact_lists_slug) {
				const list = t.contact_lists_slug;
				if (typeof list === "object") {
					return {
						id: list.slug || list.id,
						type: "list" as const,
						name: list.name || list.slug,
						count: list.contactCount || 0,
					};
				}
				return {
					id: list,
					type: "list" as const,
					name: list,
					count: 0,
				};
			}
			return t;
		}),
		tags: (directusCampaign.tags || []).map((t: any) => {
			if (typeof t === "object") {
				// If it's a junction object with a nested tag object
				if (t.tag && typeof t.tag === "object") {
					return {
						slug: t.tag.slug || t.tag.id,
						title: t.tag.title || t.tag.id,
					};
				}
				// If it's a junction object with the slug directly in the 'tag' field
				if (t.tag) {
					return {
						slug: t.tag,
						title: t.tag, // Fallback to slug for title if not joined
					};
				}
				// If it's already a tag object
				if (t.slug || t.title) {
					return t;
				}
			}
			return t; // Return as is (could be an ID)
		}),
		// Send settings logic
		sendTime: directusCampaign.date_scheduled ? "schedule" : "now",
		date_scheduled: directusCampaign.date_scheduled,
		date_started: directusCampaign.date_started,
		date_ended: directusCampaign.date_ended,
		// Stats
		views: directusCampaign.views,
		clicks: directusCampaign.clicks,
		sent: directusCampaign.sent,
		bounces: directusCampaign.bounces,
		// Metadata
		date_created: directusCampaign.date_created,
		date_updated: directusCampaign.date_updated,
		user_created: directusCampaign.user_created,
		user_updated: directusCampaign.user_updated,
		sort: directusCampaign.sort,
	};
}

/**
 * Transform Campaign model to Directus format
 */
export function transformToDirectus(
	campaign: Partial<Campaign>,
): Partial<DirectusCampaign> {
	const directusCampaign: Partial<DirectusCampaign> = {};

	if (campaign.slug !== undefined) directusCampaign.slug = campaign.slug;
	if (campaign.name !== undefined) directusCampaign.name = campaign.name;
	if (campaign.description !== undefined)
		directusCampaign.description = campaign.description;
	if (campaign.status !== undefined) directusCampaign.status = campaign.status;
	if (campaign.template !== undefined)
		directusCampaign.template = campaign.template as number;
	if (campaign.subject !== undefined)
		directusCampaign.subject = campaign.subject;
	if (campaign.fromAddress !== undefined)
		directusCampaign.from_address = campaign.fromAddress;

	if (campaign.recipients !== undefined) {
		const listRecipients = (campaign.recipients || []).filter(
			(r) => r.type === "list",
		);
		directusCampaign.contact_lists = listRecipients.map((r) => ({
			contact_lists_slug: r.id,
		}));
	}

	if (campaign.tags !== undefined) {
		// Map M2M tags to junction objects
		directusCampaign.tags = (campaign.tags || []).map((t: any) => {
			const slug = t.slug || (typeof t === "string" ? t : undefined);
			if (slug) {
				return {
					tag: slug,
				};
			}
			return t;
		});
	}

	if (campaign.date_scheduled !== undefined)
		directusCampaign.date_scheduled = campaign.date_scheduled;

	if (campaign.date_started !== undefined)
		directusCampaign.date_started = campaign.date_started;
	if (campaign.date_ended !== undefined)
		directusCampaign.date_ended = campaign.date_ended;

	if (campaign.views !== undefined) directusCampaign.views = campaign.views;
	if (campaign.clicks !== undefined) directusCampaign.clicks = campaign.clicks;
	if (campaign.sent !== undefined) directusCampaign.sent = campaign.sent;
	if (campaign.bounces !== undefined)
		directusCampaign.bounces = campaign.bounces;

	return directusCampaign;
}

/**
 * Build filter query for Directus
 */
function buildFilterQuery(filters: CampaignFilters) {
	const filter: any = {};

	if (filters.searchQuery) {
		filter._or = [
			{ name: { _icontains: filters.searchQuery } },
			{ description: { _icontains: filters.searchQuery } },
		];
	}

	if (filters.status && filters.status.length > 0) {
		filter.status = { _in: filters.status };
	}

	if (filters.contactListId) {
		filter.contact_lists = {
			contact_lists_slug: { _eq: filters.contactListId },
		};
	}

	if (filters.tags && filters.tags.length > 0) {
		// Tags are stored as JSON string, so we need to search within the JSON
		// This is a simplified approach - may need adjustment based on Directus capabilities
		filter.tags = { _contains: JSON.stringify(filters.tags[0]) };
	}

	if (filters.dateRange) {
		filter.schedule_at = {
			_gte: filters.dateRange.start,
			_lte: filters.dateRange.end,
		};
	}

	return Object.keys(filter).length > 0 ? filter : undefined;
}

/**
 * Get all campaigns with optional filters
 */
export async function getCampaigns(
	filters?: CampaignFilters,
): Promise<Campaign[]> {
	try {
		const query: any = {
			fields: [
				"*",
				"tags.*",
				"tags.tag.*",
				"contact_lists.*",
				"contact_lists.contact_lists_slug.*",
			],
			sort: "-date_created",
		};

		if (filters) {
			const directusFilter: any = {};

			if (filters.searchQuery) {
				directusFilter._or = [
					{ name: { _icontains: filters.searchQuery } },
					{ subject: { _icontains: filters.searchQuery } },
				];
			}

			if (filters.status && filters.status.length > 0) {
				directusFilter.status = { _in: filters.status };
			}

			if (filters.contactListId) {
				directusFilter.contact_lists = {
					contact_lists_slug: { _eq: filters.contactListId },
				};
			}

			if (filters.tags && filters.tags.length > 0) {
				directusFilter.tags = {
					tag: { _in: filters.tags },
				};
			}

			if (filters.dateRange) {
				directusFilter.date_created = {
					_gte: filters.dateRange.start,
					_lte: filters.dateRange.end,
				};
			}

			if (Object.keys(directusFilter).length > 0) {
				query.filter = directusFilter;
			}
		}

		const res = await directusClientWithRest.request(
			readItems("campaigns", query),
		);
		return (res as DirectusCampaign[]).map(transformFromDirectus);
	} catch (error) {
		console.error("Error fetching campaigns:", error);
		return [];
	}
}

/**
 * Get campaign by ID (using slug as ID)
 */
export async function getCampaignById(
	id: string | number,
): Promise<Campaign | null> {
	try {
		const res = await directusClientWithRest.request(
			readItem("campaigns", id, {
				fields: [
					"*",
					"tags.*",
					"tags.tag.*",
					"contact_lists.*",
					"contact_lists.contact_lists_slug.*",
				],
			}),
		);
		return transformFromDirectus(res as DirectusCampaign);
	} catch (error) {
		console.error("Error fetching campaign:", error);
		return null;
	}
}

/**
 * Create a new campaign
 */
export async function createCampaign(
	campaign: Omit<Campaign, "date_created" | "date_updated">,
): Promise<Campaign> {
	try {
		const payload = transformToDirectus(campaign);
		const res = await directusClientWithRest.request(
			createItem("campaigns", payload, {
				fields: [
					"*",
					"tags.*",
					"tags.tag.*",
					"contact_lists.*",
					"contact_lists.contact_lists_slug.*",
				],
			}),
		);
		return transformFromDirectus(res as DirectusCampaign);
	} catch (error) {
		console.error("Error creating campaign:", error);
		throw error;
	}
}

/**
 * Update an existing campaign
 */
export async function updateCampaign(
	id: string | number,
	campaign: Partial<Omit<Campaign, "date_created" | "date_updated">>,
): Promise<Campaign> {
	try {
		const payload = transformToDirectus(campaign);
		const res = await directusClientWithRest.request(
			updateItem("campaigns", id, payload, {
				fields: [
					"*",
					"tags.*",
					"tags.tag.*",
					"contact_lists.*",
					"contact_lists.contact_lists_slug.*",
				],
			}),
		);
		return transformFromDirectus(res as DirectusCampaign);
	} catch (error) {
		console.error("Error updating campaign:", error);
		throw error;
	}
}

/**
 * Delete a campaign
 */
export async function deleteCampaign(id: string | number): Promise<void> {
	try {
		await directusClientWithRest.request(deleteItem("campaigns", id));
	} catch (error) {
		console.error("Error deleting campaign:", error);
		throw error;
	}
}

/**
 * Start a campaign (change status to 'sending' or 'scheduled')
 */
export async function startCampaign(
	id: string | number,
	sendNow: boolean = true,
): Promise<Campaign> {
	const campaign = await getCampaignById(id);
	if (!campaign) {
		throw new Error("Campaign not found");
	}

	// If scheduled for later, set status to 'scheduled', otherwise 'running'
	const status =
		sendNow || campaign.sendTime === "now" ? "running" : "scheduled";
	return updateCampaign(id, {
		status,
		date_started: status === "running" ? new Date().toISOString() : undefined,
	});
}

/**
 * Stop/Pause a campaign (change status to 'cancelled' or back to 'scheduled')
 */
export async function stopCampaign(id: string | number): Promise<Campaign> {
	const campaign = await getCampaignById(id);
	if (!campaign) {
		throw new Error("Campaign not found");
	}

	// If it was scheduled, revert to draft. If sending, cancel it.
	const status = campaign.status === "scheduled" ? "draft" : "cancelled";
	return updateCampaign(id, { status });
}

/**
 * Duplicate a campaign (clone campaign with its template and media)
 */
export async function duplicateCampaign(
	id: string | number,
	newName?: string,
): Promise<Campaign> {
	const campaign = await getCampaignById(id);
	if (!campaign) {
		throw new Error("Campaign not found");
	}

	const duplicatedCampaign: Omit<Campaign, "date_created" | "date_updated"> = {
		...campaign,
		name: newName || `${campaign.name} (Copy)`,
		status: "draft",
		sendTime: "now",
		date_scheduled: undefined,
		views: 0,
		clicks: 0,
		sent: 0,
		bounces: 0,
		template: undefined, // Will be cloned separately
	};

	return createCampaign(duplicatedCampaign);
}

/**
 * Send test email for a campaign
 */
export async function sendTestEmail(payload: {
	to: string;
	subject: string;
	template: string;
}): Promise<void> {
	try {
		const response = await fetch(
			`${import.meta.env.VITE_SEND_TEST_EMAIL_URL}`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(payload),
			},
		);

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			throw new Error(errorData.message || "Failed to send test email");
		}
	} catch (error) {
		console.error("Error sending test email:", error);
		throw error;
	}
}
