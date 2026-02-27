import { create } from "zustand";
import { resetDocument } from "../../../documents/editor/EditorContext";
import { Template } from "../../templates/types";
import {
	getTemplatesByCampaign,
	createTemplate,
	updateTemplate,
	getTemplateById,
} from "../../templates/service";

/**
 * Campaign Template Store
 * Manages template editor json, html, and dirty state for a specific campaign.
 * Each campaign has its own template (not global).
 */
type CampaignTemplateState = {
	campaignId: string | number | null;
	template: Template | null;
	editorJson: any; // EmailBuilderJSON
	html: string;
	dirty: boolean;
	loading: boolean;
	error: string | null;
};

const campaignTemplateStore = create<CampaignTemplateState>(() => ({
	campaignId: null,
	template: null,
	editorJson: null,
	html: "",
	dirty: false,
	loading: false,
	error: null,
}));

// --- Selectors ---
export const useCampaignTemplate = () =>
	campaignTemplateStore((s) => s.template);
export const useCampaignTemplateEditor = () =>
	campaignTemplateStore((s) => ({
		json: s.editorJson,
		html: s.html,
		dirty: s.dirty,
	}));
export const useCampaignTemplateLoading = () =>
	campaignTemplateStore((s) => s.loading);
export const useCampaignTemplateError = () =>
	campaignTemplateStore((s) => s.error);

// --- Actions ---
export const setCampaignTemplate = (campaignId: string | number | null) => {
	campaignTemplateStore.setState({ campaignId });
};

export const setEditorJson = (json: any) => {
	campaignTemplateStore.setState({ editorJson: json, dirty: true });
};

export const setHtml = (html: string) => {
	campaignTemplateStore.setState({ html, dirty: true });
};

export const setDirty = (dirty: boolean) => {
	campaignTemplateStore.setState({ dirty });
};

export const markSaved = () => {
	campaignTemplateStore.setState({ dirty: false });
};

/**
 * Fetch template for a campaign
 * Each campaign has only one template (or none if not created yet)
 * If template doesn't exist, returns null (will be created on first save)
 */
export const fetchCampaignTemplate = async (
	campaignId: string | number,
): Promise<Template | null> => {
	try {
		campaignTemplateStore.setState({ loading: true, error: null });
		const templates = await getTemplatesByCampaign(campaignId);
		// Each campaign has only one template
		const template = templates.length > 0 ? templates[0] : null;

		if (template) {
			campaignTemplateStore.setState({
				campaignId,
				template,
				editorJson: template.json,
				html: template.html,
				dirty: false,
				loading: false,
			});
			resetDocument(template.json);
		} else {
			campaignTemplateStore.setState({
				campaignId,
				template: null,
				editorJson: null,
				html: "",
				dirty: false,
				loading: false,
			});
		}
		return template;
	} catch (err: any) {
		campaignTemplateStore.setState({
			error: err.message,
			loading: false,
		});
		throw err;
	}
};

/**
 * Fetch a specific template by ID and load into store
 */
export const fetchTemplateById = async (
	templateId: string | number,
): Promise<Template | null> => {
	try {
		campaignTemplateStore.setState({ loading: true, error: null });
		const template = await getTemplateById(templateId);

		if (template) {
			campaignTemplateStore.setState({
				template,
				editorJson: template.json,
				html: template.html,
				dirty: false,
				loading: false,
			});
			resetDocument(template.json);
		} else {
			campaignTemplateStore.setState({
				loading: false,
			});
		}
		return template;
	} catch (err: any) {
		campaignTemplateStore.setState({
			error: err.message,
			loading: false,
		});
		return null;
	}
};

/**
 * Save template for a campaign
 * Creates template if it doesn't exist, updates otherwise
 */
export const saveCampaignTemplate = async (
	campaignId: string | number,
	json: any,
	html: string,
	name?: string,
): Promise<Template> => {
	try {
		campaignTemplateStore.setState({ loading: true, error: null });

		const state = campaignTemplateStore.getState();
		let savedTemplate: Template;

		if (state.template) {
			// Update existing template
			savedTemplate = await updateTemplate(state.template.id, {
				json,
				html,
				name: name || state.template.name,
			});
		} else {
			// Create new template
			savedTemplate = await createTemplate(campaignId, {
				name: name || "Campaign Template",
				json,
				html,
			});
		}

		campaignTemplateStore.setState({
			template: savedTemplate,
			editorJson: json,
			html,
			dirty: false,
			loading: false,
		});

		return savedTemplate;
	} catch (err: any) {
		campaignTemplateStore.setState({
			error: err.message,
			loading: false,
		});
		throw err;
	}
};

/**
 * Reset template store
 */
export const resetCampaignTemplate = () => {
	campaignTemplateStore.setState({
		campaignId: null,
		template: null,
		editorJson: null,
		html: "",
		dirty: false,
		loading: false,
		error: null,
	});
};
