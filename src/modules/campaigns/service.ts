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
import mockCampaigns from "./data/campaigns.json";

// Simulation of a local file/database using localStorage
const MOCK_STORAGE_KEY = "boltx_mock_campaigns";

function getMockCampaigns(): Campaign[] {
	const stored = localStorage.getItem(MOCK_STORAGE_KEY);
	if (stored) {
		try {
			return JSON.parse(stored);
		} catch (e) {
			console.error("Failed to parse mock campaigns from localStorage", e);
		}
	}
	// Initial dummy data from JSON file
	return mockCampaigns as Campaign[];
}

function saveMockCampaigns(campaigns: Campaign[]) {
	localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(campaigns));
	console.log("Mock data saved to simulated JSON storage (localStorage)");
}

/**
 * Transform Directus format to Campaign model
 */
function transformFromDirectus(directusCampaign: DirectusCampaign): Campaign {
	// Parse recipients (new format) or fallback to legacy contactListId
	let recipients: Recipient[] = [];
	if (directusCampaign.recipients) {
		try {
			recipients = JSON.parse(directusCampaign.recipients);
		} catch (e) {
			console.warn("Failed to parse recipients:", e);
		}
	}
	// Legacy support: if contact_list_id exists but no recipients, create a recipient
	if (recipients.length === 0 && directusCampaign.contact_list_id) {
		recipients = [
			{
				id: directusCampaign.contact_list_id,
				type: "list",
				name: "Contact List",
			},
		];
	}

	// Handle sendTime and scheduledAt
	const scheduleAt =
		directusCampaign.scheduled_at || directusCampaign.schedule_at;
	const sendTime =
		directusCampaign.send_time || (scheduleAt ? "schedule" : "now");

	return {
		id: directusCampaign.id,
		name: directusCampaign.name,
		description: directusCampaign.description,
		status: directusCampaign.status,
		templateId: directusCampaign.template_id,
		subject: directusCampaign.subject || "",
		fromAddress: directusCampaign.from_address || "",
		recipients,
		contactListId: directusCampaign.contact_list_id, // Legacy support
		tags: directusCampaign.tags ? JSON.parse(directusCampaign.tags) : [],
		sendTime: sendTime as "now" | "schedule",
		scheduledAt: scheduleAt,
		scheduleAt, // Legacy support
		stats: {
			sent: directusCampaign.stats_sent || 0,
			opened: directusCampaign.stats_opened || 0,
			clicked: directusCampaign.stats_clicked || 0,
			bounced: directusCampaign.stats_bounced || 0,
			total: directusCampaign.stats_total || 0,
		},
		createdAt: directusCampaign.date_created,
		updatedAt: directusCampaign.date_updated,
		lastEditedAt:
			directusCampaign.last_edited_at || directusCampaign.date_updated,
		startedAt: directusCampaign.started_at,
		endedAt: directusCampaign.ended_at,
	};
}

/**
 * Transform Campaign model to Directus format
 */
function transformToDirectus(
	campaign: Partial<Campaign>
): Partial<DirectusCampaign> {
	const directusCampaign: Partial<DirectusCampaign> = {};

	if (campaign.name !== undefined) directusCampaign.name = campaign.name;
	if (campaign.description !== undefined)
		directusCampaign.description = campaign.description;
	if (campaign.status !== undefined) directusCampaign.status = campaign.status;
	if (campaign.templateId !== undefined)
		directusCampaign.template_id = campaign.templateId;
	if (campaign.subject !== undefined)
		directusCampaign.subject = campaign.subject;
	if (campaign.fromAddress !== undefined)
		directusCampaign.from_address = campaign.fromAddress;
	if (campaign.recipients !== undefined)
		directusCampaign.recipients = JSON.stringify(campaign.recipients);
	// Legacy support
	if (campaign.contactListId !== undefined)
		directusCampaign.contact_list_id = campaign.contactListId;
	if (campaign.tags !== undefined)
		directusCampaign.tags = JSON.stringify(campaign.tags);
	if (campaign.sendTime !== undefined)
		directusCampaign.send_time = campaign.sendTime;
	if (campaign.scheduledAt !== undefined) {
		directusCampaign.scheduled_at = campaign.scheduledAt;
		directusCampaign.schedule_at = campaign.scheduledAt; // Legacy support
	} else if (campaign.scheduleAt !== undefined) {
		directusCampaign.schedule_at = campaign.scheduleAt; // Legacy support
		directusCampaign.scheduled_at = campaign.scheduleAt;
	}
	if (campaign.stats) {
		directusCampaign.stats_sent = campaign.stats.sent;
		directusCampaign.stats_opened = campaign.stats.opened;
		directusCampaign.stats_clicked = campaign.stats.clicked;
		directusCampaign.stats_bounced = campaign.stats.bounced;
		directusCampaign.stats_total = campaign.stats.total;
	}
	if (campaign.startedAt !== undefined)
		directusCampaign.started_at = campaign.startedAt;
	if (campaign.endedAt !== undefined)
		directusCampaign.ended_at = campaign.endedAt;
	// Update lastEditedAt on any update
	directusCampaign.last_edited_at = new Date().toISOString();

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
		filter.contact_list_id = { _eq: filters.contactListId };
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
	filters?: CampaignFilters
): Promise<Campaign[]> {
	try {
		// For development: Use mock data
		let filteredData = getMockCampaigns();

		if (filters) {
			const { searchQuery, status, contactListId, tags, dateRange } = filters;

			// Filter by search query (name or subject)
			if (searchQuery) {
				const query = searchQuery.toLowerCase();
				filteredData = filteredData.filter(
					(c) =>
						c.name.toLowerCase().includes(query) ||
						c.subject.toLowerCase().includes(query)
				);
			}

			// Filter by status (multiple)
			if (status && status.length > 0) {
				filteredData = filteredData.filter((c) => status.includes(c.status));
			}

			// Filter by contact list
			if (contactListId) {
				filteredData = filteredData.filter((c) =>
					c.recipients?.some((r) => String(r.id) === String(contactListId))
				);
			}

			// Filter by tags (any match)
			if (tags && tags.length > 0) {
				filteredData = filteredData.filter((c) =>
					c.tags?.some((tag) => tags.includes(tag))
				);
			}

			// Filter by date range (scheduleAt)
			if (dateRange) {
				const start = new Date(dateRange.start).getTime();
				const end = new Date(dateRange.end || new Date()).getTime();
				filteredData = filteredData.filter((c) => {
					if (!c.scheduleAt && !c.scheduledAt) return false;
					const campaignDate = new Date(
						c.scheduleAt || c.scheduledAt!
					).getTime();
					return campaignDate >= start && campaignDate <= end;
				});
			}
		}

		return filteredData;

		/* Later: API implementation
		const query: any = {
			fields: ["*"],
			sort: ["-date_created"],
		};

		if (filters) {
			const filterQuery = buildFilterQuery(filters);
			if (filterQuery) {
				query.filter = filterQuery;
			}
		}

		const res = await directusClientWithRest.request(
			readItems("campaigns", query)
		);
		return (res as DirectusCampaign[]).map(transformFromDirectus);
        */
	} catch (error) {
		console.error("Error fetching campaigns:", error);
		return getMockCampaigns();
	}
}

/**
 * Get campaign by ID
 */
export async function getCampaignById(
	id: string | number
): Promise<Campaign | null> {
	try {
		const mockData = getMockCampaigns();
		return mockData.find((c) => c.id.toString() === id.toString()) || null;

		/* Later: API implementation
		const res = await directusClientWithRest.request(
			readItem("campaigns", id)
		);
		return transformFromDirectus(res as DirectusCampaign);
        */
	} catch (error) {
		console.error("Error fetching campaign:", error);
		return null;
	}
}

/**
 * Create a new campaign
 */
export async function createCampaign(
	campaign: Omit<Campaign, "id" | "createdAt" | "updatedAt">
): Promise<Campaign> {
	try {
		const mockData = getMockCampaigns();
		const newCampaign: Campaign = {
			...campaign,
			id: `mock-${Date.now()}`,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		};

		const updatedData = [newCampaign, ...mockData];
		saveMockCampaigns(updatedData);

		return newCampaign;

		/* Later: API implementation
		const payload = transformToDirectus(campaign);
		const res = await directusClientWithRest.request(
			createItem("campaigns", payload)
		);
		return transformFromDirectus(res as DirectusCampaign);
        */
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
	campaign: Partial<Omit<Campaign, "id" | "createdAt" | "updatedAt">>
): Promise<Campaign> {
	try {
		const payload = transformToDirectus(campaign);
		const res = await directusClientWithRest.request(
			updateItem("campaigns", id, payload)
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
	sendNow: boolean = true
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
		startedAt: status === "running" ? new Date().toISOString() : undefined,
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
	newName?: string
): Promise<Campaign> {
	const campaign = await getCampaignById(id);
	if (!campaign) {
		throw new Error("Campaign not found");
	}

	const duplicatedCampaign: Omit<Campaign, "id" | "createdAt" | "updatedAt"> = {
		...campaign,
		name: newName || `${campaign.name} (Copy)`,
		status: "draft",
		sendTime: "now",
		scheduledAt: undefined,
		scheduleAt: undefined,
		stats: undefined,
		templateId: undefined, // Will be cloned separately
	};

	return createCampaign(duplicatedCampaign);
}

/**
 * Send test email for a campaign
 */
export async function sendTestEmail(
	id: string | number,
	testEmails: string[]
): Promise<void> {
	// This will be implemented with the sending service
	// For now, just a placeholder
	console.log("Sending test email for campaign", id, "to", testEmails);
}
