// stores/templateState.ts
import { create } from "zustand";
import { getAllTemplates, getTemplateById } from "../services/template";
import { Template } from "../types";
import { setDocument } from "../documents/editor/EditorContext";
import { setMessage } from ".";

type TemplateState = {
  templates: Template[];
  currentTemplate: Template | null;
  loading: boolean;
  error: string | null;
};

const templateState = create<TemplateState>(() => ({
  templates: [],
  currentTemplate: null,
  loading: false,
  error: null,
}));

// --- Selectors ---
export const useTemplates = () => templateState((s) => s.templates);
export const useTemplatesLoading = () => templateState((s) => s.loading);
export const useTemplatesError = () => templateState((s) => s.error);
export const useCurrentTemplate = () => templateState((s) => s.currentTemplate)

// --- Actions ---
export const setCurrentTemplate = (template: Partial<Template>) => {
  const currentTemplate = templateState.getState().currentTemplate
  return templateState.setState({
    currentTemplate: template ? { ...currentTemplate, ...template } : template
  })
}

export const useFetchTemplateDetail = async (id: string | number) => {
  try {
    templateState.setState({ loading: true, error: null });
    const res = await getTemplateById(id);
    if (res) {
      templateState.setState({
        currentTemplate: res,
        loading: false,
      });
      setDocument(res.settings)
    } else {
      throw new Error("Template with ID " + id + " not found!")
    }

  } catch (err) {
    setMessage(err.message)
    templateState.setState({
      error: err.message,
      loading: false,
    });
    window.location.href = "/"
  }
}

export const useFetchTemplates = async () => {
  try {
    templateState.setState({ loading: true, error: null });
    const res = await getAllTemplates();

    templateState.setState({
      templates: res ?? [],
      loading: false,
    });
  } catch (err: any) {
    templateState.setState({
      error: err.message,
      loading: false,
    });
  }
};
