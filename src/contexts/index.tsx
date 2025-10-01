import { create } from "zustand";

type TValue = {
	modalSearchOpen: boolean;
	searchTerm: string | null;
};

const appState = create<TValue>(() => ({
	modalSearchOpen: false,
	searchTerm: null,
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
