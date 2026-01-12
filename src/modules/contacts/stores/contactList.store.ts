import { create } from "zustand";
import { shallow } from "zustand/shallow";
import { ContactList } from "../types";
import {
	getAllContactLists,
	createContactList,
	updateContactList,
	deleteContactList,
	exportContactList,
} from "../service";

type ContactListState = {
	contactLists: ContactList[];
	currentList: ContactList | null;
	loading: boolean;
	error: string | null;
	// Filter & search
	searchQuery: string;
	sortBy: "name" | "date_created" | "contact_count" | "last_updated";
	sortOrder: "asc" | "desc";
	// Pagination
	page: number;
	rowsPerPage: number;
	// Selection
	selectedIds: (string | number)[];
	// Column visibility (persisted in localStorage)
	visibleColumns: string[];
};

const getStoredColumns = (): string[] => {
	if (typeof window === "undefined") return ["name", "description", "contactCount", "createdAt", "actions"];
	const stored = localStorage.getItem("contactListColumns");
	return stored ? JSON.parse(stored) : ["name", "description", "contactCount", "createdAt", "actions"];
};

const contactListStore = create<ContactListState>(() => ({
	contactLists: [],
	currentList: null,
	loading: false,
	error: null,
	searchQuery: "",
	sortBy: "date_created",
	sortOrder: "desc",
	page: 0,
	rowsPerPage: 25,
	selectedIds: [],
	visibleColumns: getStoredColumns(),
}));

// --- Selectors ---
export const useContactLists = () => contactListStore((s) => s.contactLists);
export const useCurrentContactList = () => contactListStore((s) => s.currentList);
export const useContactListsLoading = () => contactListStore((s) => s.loading);
export const useContactListsError = () => contactListStore((s) => s.error);
export const useContactListFilters = () =>
	contactListStore(
		(s) => ({
			searchQuery: s.searchQuery,
			sortBy: s.sortBy,
			sortOrder: s.sortOrder,
		}),
		shallow
	);
export const useContactListPagination = () =>
	contactListStore(
		(s) => ({
			page: s.page,
			rowsPerPage: s.rowsPerPage,
		}),
		shallow
	);
export const useSelectedContactLists = () =>
	contactListStore((s) => s.selectedIds);
export const useVisibleColumns = () =>
	contactListStore((s) => s.visibleColumns);

// --- Actions ---
export const setCurrentContactList = (list: ContactList | null) => {
	contactListStore.setState({ currentList: list });
};

export const setSearchQuery = (query: string) => {
	contactListStore.setState({ searchQuery: query, page: 0 });
};

export const setSort = (sortBy: ContactListState["sortBy"], sortOrder?: "asc" | "desc") => {
	contactListStore.setState((state) => ({
		sortBy,
		sortOrder: sortOrder || (state.sortBy === sortBy && state.sortOrder === "asc" ? "desc" : "asc"),
	}));
};

export const setPage = (page: number) => {
	contactListStore.setState({ page });
};

export const setRowsPerPage = (rowsPerPage: number) => {
	contactListStore.setState({ rowsPerPage, page: 0 });
};

export const toggleSelectContactList = (id: string | number) => {
	contactListStore.setState((state) => {
		const selectedIds = state.selectedIds.includes(id)
			? state.selectedIds.filter((selectedId) => selectedId !== id)
			: [...state.selectedIds, id];
		return { selectedIds };
	});
};

export const selectAllContactLists = () => {
	contactListStore.setState((state) => ({
		selectedIds: state.contactLists.map((list) => list.id),
	}));
};

export const clearSelection = () => {
	contactListStore.setState({ selectedIds: [] });
};

export const setVisibleColumns = (columns: string[]) => {
	contactListStore.setState({ visibleColumns: columns });
	if (typeof window !== "undefined") {
		localStorage.setItem("contactListColumns", JSON.stringify(columns));
	}
};

// --- API Actions ---
export const fetchContactLists = async () => {
	try {
		contactListStore.setState({ loading: true, error: null });
		const res = await getAllContactLists();
		contactListStore.setState({
			contactLists: res ?? [],
			loading: false,
		});
	} catch (err: any) {
		contactListStore.setState({
			error: err.message,
			loading: false,
		});
	}
};

export const createContactListAction = async (
	list: Omit<ContactList, "id" | "createdAt" | "updatedAt" | "contactCount">
): Promise<ContactList> => {
	try {
		contactListStore.setState({ loading: true, error: null });
		const newList = await createContactList(list);
		contactListStore.setState((state) => ({
			contactLists: [newList, ...state.contactLists],
			loading: false,
		}));
		return newList;
	} catch (err: any) {
		contactListStore.setState({
			error: err.message,
			loading: false,
		});
		throw err;
	}
};

export const updateContactListAction = async (
	id: string | number,
	list: Partial<Omit<ContactList, "id" | "createdAt" | "updatedAt">>
): Promise<ContactList> => {
	try {
		contactListStore.setState({ loading: true, error: null });
		const updatedList = await updateContactList(id, list);
		contactListStore.setState((state) => ({
			contactLists: state.contactLists.map((l) => (l.id === id ? updatedList : l)),
			currentList:
				state.currentList?.id === id ? updatedList : state.currentList,
			loading: false,
		}));
		return updatedList;
	} catch (err: any) {
		contactListStore.setState({
			error: err.message,
			loading: false,
		});
		throw err;
	}
};

export const deleteContactListAction = async (
	id: string | number
): Promise<void> => {
	try {
		contactListStore.setState({ loading: true, error: null });
		await deleteContactList(id);
		contactListStore.setState((state) => ({
			contactLists: state.contactLists.filter((l) => l.id !== id),
			currentList: state.currentList?.id === id ? null : state.currentList,
			selectedIds: state.selectedIds.filter((selectedId) => selectedId !== id),
			loading: false,
		}));
	} catch (err: any) {
		contactListStore.setState({
			error: err.message,
			loading: false,
		});
		throw err;
	}
};

export const toggleContactListEnabled = async (
	id: string | number
): Promise<ContactList> => {
	const list = contactListStore.getState().contactLists.find((l) => l.id === id);
	if (!list) throw new Error("Contact list not found");
	return updateContactListAction(id, { isEnabled: !list.isEnabled });
};

export const exportContactListAction = async (
	id: string | number
): Promise<void> => {
	try {
		contactListStore.setState({ loading: true, error: null });
		await exportContactList(id);
		contactListStore.setState({ loading: false });
	} catch (err: any) {
		contactListStore.setState({
			error: err.message,
			loading: false,
		});
		throw err;
	}
};

// Computed selectors
export const useFilteredContactLists = () => {
	const state = contactListStore();
	const { searchQuery, sortBy, sortOrder, page, rowsPerPage } = state;

	let filtered = [...state.contactLists];

	// Search filter
	if (searchQuery) {
		const query = searchQuery.toLowerCase();
		filtered = filtered.filter(
			(list) =>
				list.name.toLowerCase().includes(query) ||
				list.description?.toLowerCase().includes(query)
		);
	}

	// Sort
	filtered.sort((a, b) => {
		let comparison = 0;
		switch (sortBy) {
			case "name":
				comparison = a.name.localeCompare(b.name);
				break;
			case "date_created":
				comparison =
					new Date(a.createdAt || 0).getTime() -
					new Date(b.createdAt || 0).getTime();
				break;
			case "contact_count":
				comparison = a.contactCount - b.contactCount;
				break;
			case "last_updated":
				comparison =
					new Date(a.updatedAt || a.createdAt || 0).getTime() -
					new Date(b.updatedAt || b.createdAt || 0).getTime();
				break;
		}
		return sortOrder === "asc" ? comparison : -comparison;
	});

	// Pagination
	const startIndex = page * rowsPerPage;
	const paginated = filtered.slice(startIndex, startIndex + rowsPerPage);

	return {
		filtered: paginated,
		total: filtered.length,
		page,
		rowsPerPage,
	};
};
