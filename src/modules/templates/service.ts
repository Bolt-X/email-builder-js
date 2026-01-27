import {
	createItem,
	deleteItem,
	readItem,
	readItems,
	updateItem,
} from "@directus/sdk";
import { directusClientWithRest } from "../../services/directus";
import { DirectusTemplate, Template } from "./types";
export type { Template };

/**
 * Transform Directus format to Template model
 */
function transformFromDirectus(directusTemplate: DirectusTemplate): Template {
	return {
		id: directusTemplate.id,
		campaignId: directusTemplate.campaign_id || "",
		name: directusTemplate.name,
		description: directusTemplate.subject,
		json:
			typeof directusTemplate.settings === "string"
				? JSON.parse(directusTemplate.settings)
				: directusTemplate.settings || {},
		html: directusTemplate.body || "",
		thumbnail: directusTemplate.thumbnail,
		createdAt: directusTemplate.date_created,
		updatedAt: directusTemplate.date_updated,
	};
}

/**
 * Transform Template model to Directus format
 */
function transformToDirectus(
	template: Partial<Template>,
): Partial<DirectusTemplate> {
	const directusTemplate: Partial<DirectusTemplate> = {};

	if (template.name !== undefined) directusTemplate.name = template.name;
	if (template.description !== undefined)
		directusTemplate.subject = template.description;
	if (template.html !== undefined) directusTemplate.body = template.html;
	if (template.json !== undefined)
		directusTemplate.settings = JSON.stringify(template.json);
	if (template.thumbnail !== undefined)
		directusTemplate.thumbnail = template.thumbnail;
	if (template.campaignId !== undefined)
		directusTemplate.campaign_id = template.campaignId;

	return directusTemplate;
}

/**
 * Get all templates for a specific campaign
 */
export async function getTemplatesByCampaign(
	campaignId: string | number,
): Promise<Template[]> {
	try {
		const res = await directusClientWithRest.request(
			readItems("templates", {
				fields: ["*"],
				filter: {
					campaign_id: {
						_eq: campaignId,
					},
				},
				sort: ["name"],
			}),
		);
		return (res as DirectusTemplate[]).map(transformFromDirectus);
	} catch (error) {
		console.error("Error fetching templates by campaign:", error);
		return [];
	}
}

/**
 * Get all templates
 */
export async function getAllTemplates(): Promise<Template[]> {
	try {
		const res = await directusClientWithRest.request(
			readItems("templates", {
				fields: ["*"],
				sort: ["name"],
			}),
		);
		return (res as DirectusTemplate[]).map(transformFromDirectus);
	} catch (error) {
		console.error("Error fetching templates:", error);
		return [];
	}
}

/**
 * Get template by ID
 */
export async function getTemplateById(
	id: string | number,
): Promise<Template | null> {
	try {
		const res = await directusClientWithRest.request(readItem("templates", id));
		return transformFromDirectus(res as DirectusTemplate);
	} catch (error) {
		console.error("Error fetching template:", error);
		return null;
	}
}

/**
 * Create a new template
 */
export async function createTemplate(
	campaignId: string | number,
	template: Omit<Template, "id" | "campaignId" | "createdAt" | "updatedAt">,
): Promise<Template> {
	try {
		const payload = transformToDirectus({
			...template,
			campaignId,
		});
		const res = await directusClientWithRest.request(
			createItem("templates", payload),
		);
		return transformFromDirectus(res as DirectusTemplate);
	} catch (error) {
		console.error("Error creating template:", error);
		throw error;
	}
}

/**
 * Update an existing template
 */
export async function updateTemplate(
	id: string | number,
	template: Partial<Omit<Template, "id" | "createdAt" | "updatedAt">>,
): Promise<Template> {
	try {
		const payload = transformToDirectus(template);
		const res = await directusClientWithRest.request(
			updateItem("templates", id, payload),
		);
		return transformFromDirectus(res as DirectusTemplate);
	} catch (error) {
		console.error("Error updating template:", error);
		throw error;
	}
}

/**
 * Delete a template
 */
export async function deleteTemplate(id: string | number): Promise<void> {
	try {
		await directusClientWithRest.request(deleteItem("templates", id));
	} catch (error) {
		console.error("Error deleting template:", error);
		throw error;
	}
}

/**
 * Duplicate a template
 */
export async function duplicateTemplate(
	id: string | number,
	newName?: string,
): Promise<Template> {
	try {
		const original = await getTemplateById(id);
		if (!original) {
			throw new Error("Template not found");
		}

		return await createTemplate(original.campaignId, {
			name: newName || `${original.name} (Copy)`,
			description: original.description,
			json: original.json,
			html: original.html,
			thumbnail: original.thumbnail,
		});
	} catch (error) {
		console.error("Error duplicating template:", error);
		throw error;
	}
}
