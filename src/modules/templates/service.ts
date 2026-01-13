import {
	createItem,
	deleteItem,
	readItem,
	readItems,
	updateItem,
} from "@directus/sdk";
import { directusClientWithRest } from "../../services/directus";
import { DirectusTemplate, Template } from "./types";

// Mock storage for templates
const MOCK_TEMPLATES_KEY = "boltx_mock_templates";

function getMockTemplates(): Template[] {
	const stored = localStorage.getItem(MOCK_TEMPLATES_KEY);
	if (stored) {
		try {
			return JSON.parse(stored);
		} catch (e) {
			console.error("Failed to parse mock templates", e);
		}
	}
	// Initial default samples for development
	return [
		{
			id: "mock-sample-1",
			campaignId: "mock-campaign-id",
			name: "Welcome Email",
			description: "Standard welcome message for new users",
			json: {} as any, // Placeholder or import from sample files
			html: "<h1>Welcome!</h1>",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		},
		{
			id: "mock-sample-2",
			campaignId: "mock-campaign-id",
			name: "Password Reset",
			description: "Instructions to reset account password",
			json: {} as any,
			html: "<h1>Reset Password</h1>",
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
		},
	];
}

function saveMockTemplates(templates: Template[]) {
	localStorage.setItem(MOCK_TEMPLATES_KEY, JSON.stringify(templates));
}

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
	template: Partial<Template>
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
	campaignId: string | number
): Promise<Template[]> {
	try {
		if (campaignId.toString().startsWith("mock-")) {
			const mockTemplates = getMockTemplates();
			return mockTemplates.filter(
				(t) => t.campaignId.toString() === campaignId.toString()
			);
		}

		const res = await directusClientWithRest.request(
			readItems("templates", {
				fields: ["*"],
				filter: {
					campaign_id: {
						_eq: campaignId,
					},
				},
				sort: ["name"],
			})
		);
		return (res as DirectusTemplate[]).map(transformFromDirectus);
	} catch (error) {
		console.error("Error fetching templates by campaign:", error);
		return [];
	}
}

/**
 * Get all templates (for backward compatibility - will be filtered by campaign in future)
 */
export async function getAllTemplates(): Promise<Template[]> {
	try {
		const mockTemplates = getMockTemplates();
		const res = await directusClientWithRest.request(
			readItems("templates", {
				fields: ["*"],
				sort: ["name"],
			})
		);
		const directusTemplates = (res as DirectusTemplate[]).map(
			transformFromDirectus
		);
		return [...mockTemplates, ...directusTemplates];
	} catch (error) {
		console.error("Error fetching templates:", error);
		return getMockTemplates();
	}
}

/**
 * Get template by ID
 */
export async function getTemplateById(
	id: string | number
): Promise<Template | null> {
	try {
		if (id.toString().startsWith("mock-")) {
			const mockTemplates = getMockTemplates();
			return (
				mockTemplates.find((t) => t.id.toString() === id.toString()) || null
			);
		}

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
	template: Omit<Template, "id" | "campaignId" | "createdAt" | "updatedAt">
): Promise<Template> {
	try {
		if (campaignId.toString().startsWith("mock-")) {
			const mockTemplates = getMockTemplates();
			const newTemplate: Template = {
				...template,
				id: `mock-template-${Date.now()}`,
				campaignId: campaignId,
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			};
			saveMockTemplates([newTemplate, ...mockTemplates]);
			return newTemplate;
		}

		const payload = transformToDirectus({
			...template,
			campaignId,
		});
		const res = await directusClientWithRest.request(
			createItem("templates", payload)
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
	template: Partial<Omit<Template, "id" | "createdAt" | "updatedAt">>
): Promise<Template> {
	try {
		if (id.toString().startsWith("mock-")) {
			const mockTemplates = getMockTemplates();
			const updatedTemplates = mockTemplates.map((t) => {
				if (t.id.toString() === id.toString()) {
					return { ...t, ...template, updatedAt: new Date().toISOString() };
				}
				return t;
			});
			saveMockTemplates(updatedTemplates);
			return updatedTemplates.find((t) => t.id.toString() === id.toString())!;
		}

		const payload = transformToDirectus(template);
		const res = await directusClientWithRest.request(
			updateItem("templates", id, payload)
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
	newName?: string
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
