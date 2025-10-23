import { create } from "zustand";

import getConfiguration from "../../getConfiguration";

import { TEditorConfiguration } from "./core";

type TValue = {
	document: TEditorConfiguration;

	pastDocument: TEditorConfiguration[];
	futureDocument: TEditorConfiguration[];

	selectedBlockId: string | null;
	selectedSidebarTab: "block-configuration" | "styles";
	selectedMainTab: "editor" | "preview" | "json" | "html";
	selectedScreenSize: "desktop" | "mobile";

	inspectorDrawerOpen: boolean;
	samplesDrawerOpen: boolean;
};

const editorStateStore = create<TValue>(() => ({
	document: getConfiguration(window.location.hash),
	pastDocument: [],
	futureDocument: [],

	selectedBlockId: null,
	selectedSidebarTab: "styles",
	selectedMainTab: "editor",
	selectedScreenSize: "desktop",

	inspectorDrawerOpen: true,
	samplesDrawerOpen: true,
}));

export function useDocument() {
	return editorStateStore((s) => s.document);
}

export function useSelectedBlockId() {
	return editorStateStore((s) => s.selectedBlockId);
}

export function useSelectedScreenSize() {
	return editorStateStore((s) => s.selectedScreenSize);
}

export function useSelectedMainTab() {
	return editorStateStore((s) => s.selectedMainTab);
}

export function setSelectedMainTab(selectedMainTab: TValue["selectedMainTab"]) {
	return editorStateStore.setState({ selectedMainTab });
}

export function useSelectedSidebarTab() {
	return editorStateStore((s) => s.selectedSidebarTab);
}

export function useInspectorDrawerOpen() {
	return editorStateStore((s) => s.inspectorDrawerOpen);
}

export function useSamplesDrawerOpen() {
	return editorStateStore((s) => s.samplesDrawerOpen);
}

export function setSelectedBlockId(selectedBlockId: TValue["selectedBlockId"]) {
	const selectedSidebarTab =
		selectedBlockId === null ? "styles" : "block-configuration";
	const options: Partial<TValue> = {};
	if (selectedBlockId !== null) {
		options.inspectorDrawerOpen = true;
	}
	return editorStateStore.setState({
		selectedBlockId,
		selectedSidebarTab,
		...options,
	});
}

export function setSidebarTab(
	selectedSidebarTab: TValue["selectedSidebarTab"]
) {
	return editorStateStore.setState({ selectedSidebarTab });
}

export function resetDocument(document: TValue["document"]) {
	editorStateStore.setState({
		document,
		pastDocument: [],
		futureDocument: [],
		selectedSidebarTab: "styles",
		selectedBlockId: null,
	});
}

export function setDocument(document: TValue["document"]) {
	const { document: current, pastDocument } = editorStateStore.getState();

	// lưu document hiện tại vào past trước khi set document mới
	editorStateStore.setState({
		pastDocument: [...pastDocument, current],
		document: { ...current, ...document },
		futureDocument: [], // clear future khi có action mới
	});
}

export function toggleInspectorDrawerOpen() {
	const inspectorDrawerOpen = !editorStateStore.getState().inspectorDrawerOpen;
	return editorStateStore.setState({ inspectorDrawerOpen });
}

export function toggleSamplesDrawerOpen() {
	const samplesDrawerOpen = !editorStateStore.getState().samplesDrawerOpen;
	return editorStateStore.setState({ samplesDrawerOpen });
}

export function setSelectedScreenSize(
	selectedScreenSize: TValue["selectedScreenSize"]
) {
	return editorStateStore.setState({ selectedScreenSize });
}

// ====== Undo / Redo ======
export function undo() {
	const { pastDocument, document, futureDocument } =
		editorStateStore.getState();
	if (pastDocument.length === 0) return;

	const previous = pastDocument[pastDocument.length - 1];
	const newPast = pastDocument.slice(0, -1);

	editorStateStore.setState({
		pastDocument: newPast,
		document: previous,
		futureDocument: [document, ...futureDocument],
	});
}

export function redo() {
	const { pastDocument, document, futureDocument } =
		editorStateStore.getState();
	if (futureDocument.length === 0) return;

	const next = futureDocument[0];
	const newFuture = futureDocument.slice(1);

	editorStateStore.setState({
		pastDocument: [...pastDocument, document],
		document: next,
		futureDocument: newFuture,
	});
}

// ====== Hook Undo/Redo ======
export function useUndoRedo() {
	return editorStateStore((s) => ({
		canUndo: s.pastDocument.length > 0,
		canRedo: s.futureDocument.length > 0,
		undo,
		redo,
	}));
}
