import { create } from "zustand";

type TValue = {
	modalSearchOpen: boolean;
	searchTerm: string | null;
	drawerNoteOpen: boolean;
	message: string | null;
};

const appState = create<TValue>(() => ({
	modalSearchOpen: false,
	searchTerm: null,
	drawerNoteOpen: false,
	message: null
}));

export const useModalSearchOpen = () => {
	return appState((s) => s.modalSearchOpen);
};

export const toggleSearchModalOpen = () => {
	const currentState = appState.getState().modalSearchOpen;
	appState.setState({
		modalSearchOpen: !currentState,
	});
};

export const useSearchTerm = () => {
	return appState((s) => s.searchTerm);
};

export const useDrawerNoteOpen = () => {
	return appState((s) => s.drawerNoteOpen);
};

export const toggleDrawerNoteOpen = () => {
	const currentState = appState.getState().drawerNoteOpen;
	appState.setState({
		drawerNoteOpen: !currentState,
	});
};

export const useMessage = () => {
	return appState((s) => s.message);
};

export const setMessage = (errMsg: string) => {
	appState.setState({
		message: errMsg
	})
}
