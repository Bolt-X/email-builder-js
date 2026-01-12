import { create } from "zustand";
import { resetDocument } from "../../documents/editor/EditorContext";
import { setMessage } from "../../contexts";
import {
	createTemplate,
	deleteTemplate,
	duplicateTemplate,
	getAllTemplates,
	getTemplateById,
	getTemplatesByCampaign,
	updateTemplate,
	Template,
} from "./service";

type TemplateState = {
	templates: Template[];
	currentTemplate: Template | null;
	activeTemplateId: string | number | null;
	loading: boolean;
	error: string | null;
};

const templateStore = create<TemplateState>(() => ({
	templates: [],
	currentTemplate: null,
	activeTemplateId: null,
	loading: false,
	error: null,
}));

// --- Selectors ---
export const useTemplates = () => templateStore((s) => s.templates);
export const useTemplatesLoading = () => templateStore((s) => s.loading);
export const useTemplatesError = () => templateStore((s) => s.error);
export const useCurrentTemplate = () => templateStore((s) => s.currentTemplate);
export const useActiveTemplateId = () =>
	templateStore((s) => s.activeTemplateId);

// --- Actions ---
export const setCurrentTemplate = (template: Partial<Template> | null) => {
	const currentTemplate = templateStore.getState().currentTemplate;
	if (template === null) {
		templateStore.setState({
			currentTemplate: null,
			activeTemplateId: null,
		});
	} else {
		templateStore.setState({
			currentTemplate: currentTemplate
				? { ...currentTemplate, ...template }
				: (template as Template),
			activeTemplateId: template.id || null,
		});
	}
};

export const fetchTemplateDetail = async (id: string | number) => {
	try {
		templateStore.setState({ loading: true, error: null });
		const res = await getTemplateById(id);
		if (res) {
			templateStore.setState({
				currentTemplate: res,
				activeTemplateId: res.id,
				loading: false,
			});
			resetDocument(res.json);
		} else {
			throw new Error("Template with ID " + id + " not found!");
		}
	} catch (err: any) {
		setMessage(err.message);
		templateStore.setState({
			error: err.message,
			loading: false,
		});
		window.location.href = "/";
	}
};

export const fetchTemplates = async () => {
	try {
		templateStore.setState({ loading: true, error: null });
		const res = await getAllTemplates();

		templateStore.setState({
			templates: res ?? [],
			loading: false,
		});
	} catch (err: any) {
		templateStore.setState({
			error: err.message,
			loading: false,
		});
	}
};

export const fetchTemplatesByCampaign = async (
	campaignId: string | number
) => {
	try {
		templateStore.setState({ loading: true, error: null });
		const res = await getTemplatesByCampaign(campaignId);

		templateStore.setState({
			templates: res ?? [],
			loading: false,
		});
	} catch (err: any) {
		templateStore.setState({
			error: err.message,
			loading: false,
		});
	}
};

export const createTemplateAction = async (
	campaignId: string | number,
	template: Omit<Template, "id" | "campaignId" | "createdAt" | "updatedAt">
): Promise<Template> => {
	try {
		templateStore.setState({ loading: true, error: null });
		const newTemplate = await createTemplate(campaignId, template);
		templateStore.setState((state) => ({
			templates: [...state.templates, newTemplate],
			loading: false,
		}));
		return newTemplate;
	} catch (err: any) {
		templateStore.setState({
			error: err.message,
			loading: false,
		});
		throw err;
	}
};

export const updateTemplateAction = async (
	id: string | number,
	template: Partial<Omit<Template, "id" | "createdAt" | "updatedAt">>
): Promise<Template> => {
	try {
		templateStore.setState({ loading: true, error: null });
		const updatedTemplate = await updateTemplate(id, template);
		templateStore.setState((state) => ({
			templates: state.templates.map((t) =>
				t.id === id ? updatedTemplate : t
			),
			currentTemplate:
				state.currentTemplate?.id === id
					? updatedTemplate
					: state.currentTemplate,
			loading: false,
		}));
		return updatedTemplate;
	} catch (err: any) {
		templateStore.setState({
			error: err.message,
			loading: false,
		});
		throw err;
	}
};

export const deleteTemplateAction = async (
	id: string | number
): Promise<void> => {
	try {
		templateStore.setState({ loading: true, error: null });
		await deleteTemplate(id);
		templateStore.setState((state) => ({
			templates: state.templates.filter((t) => t.id !== id),
			currentTemplate:
				state.currentTemplate?.id === id ? null : state.currentTemplate,
			activeTemplateId:
				state.activeTemplateId === id ? null : state.activeTemplateId,
			loading: false,
		}));
	} catch (err: any) {
		templateStore.setState({
			error: err.message,
			loading: false,
		});
		throw err;
	}
};

export const duplicateTemplateAction = async (
	id: string | number,
	newName?: string
): Promise<Template> => {
	try {
		templateStore.setState({ loading: true, error: null });
		const duplicatedTemplate = await duplicateTemplate(id, newName);
		templateStore.setState((state) => ({
			templates: [...state.templates, duplicatedTemplate],
			loading: false,
		}));
		return duplicatedTemplate;
	} catch (err: any) {
		templateStore.setState({
			error: err.message,
			loading: false,
		});
		throw err;
	}
};

// Backward compatibility exports
export const useFetchTemplateDetail = fetchTemplateDetail;
export const useFetchTemplates = fetchTemplates;
