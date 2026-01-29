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
	if (typeof window === "undefined")
		return ["description", "contactCount", "date_created"];
	const stored = localStorage.getItem("contactListColumns");
	return stored
		? JSON.parse(stored)
		: ["description", "contactCount", "date_created"];
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
export const useCurrentContactList = () =>
	contactListStore((s) => s.currentList);
export const useContactListsLoading = () => contactListStore((s) => s.loading);
export const useContactListsError = () => contactListStore((s) => s.error);
export const useContactListFilters = () =>
	contactListStore(
		(s) => ({
			searchQuery: s.searchQuery,
			sortBy: s.sortBy,
			sortOrder: s.sortOrder,
		}),
		shallow,
	);
export const useContactListPagination = () =>
	contactListStore(
		(s) => ({
			page: s.page,
			rowsPerPage: s.rowsPerPage,
		}),
		shallow,
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

export const setSort = (
	sortBy: ContactListState["sortBy"],
	sortOrder?: "asc" | "desc",
) => {
	contactListStore.setState((state) => ({
		sortBy,
		sortOrder:
			sortOrder ||
			(state.sortBy === sortBy && state.sortOrder === "asc" ? "desc" : "asc"),
	}));
};

export const setPage = (page: number) => {
	contactListStore.setState({ page });
};

export const setRowsPerPage = (rowsPerPage: number) => {
	contactListStore.setState({ rowsPerPage, page: 0 });
};

export const toggleSelectContactList = (slug: string) => {
	contactListStore.setState((state) => {
		const selectedIds = state.selectedIds.includes(slug)
			? state.selectedIds.filter((id) => id !== slug)
			: [...state.selectedIds, slug];
		return { selectedIds: selectedIds as string[] };
	});
};

export const selectAllContactLists = () => {
	contactListStore.setState((state) => ({
		selectedIds: state.contactLists.map((list) => list.slug),
	}));
};

export const clearSelection = () => {
	contactListStore.setState({ selectedIds: [] });
};

export const setSelectedIds = (ids: (string | number)[]) => {
	contactListStore.setState({ selectedIds: ids });
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
	list: Omit<
		ContactList,
		"slug" | "date_created" | "date_updated" | "contactCount"
	>,
): Promise<ContactList> => {
	try {
		contactListStore.setState({ loading: true, error: null });
		const newList = await createContactList({
			...list,
			slug: list.name.toLowerCase().replace(/ /g, "-"),
		});
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
	slug: string,
	list: Partial<Omit<ContactList, "slug" | "date_created" | "date_updated">>,
): Promise<ContactList> => {
	try {
		contactListStore.setState({ loading: true, error: null });
		const updatedList = await updateContactList(slug, list);
		contactListStore.setState((state) => ({
			contactLists: state.contactLists.map((l) =>
				l.slug === slug ? updatedList : l,
			),
			currentList:
				state.currentList?.slug === slug ? updatedList : state.currentList,
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

export const deleteContactListAction = async (slug: string): Promise<void> => {
	try {
		contactListStore.setState({ loading: true, error: null });
		await deleteContactList([slug]);
		contactListStore.setState((state) => ({
			contactLists: state.contactLists.filter((l) => l.slug !== slug),
			currentList: state.currentList?.slug === slug ? null : state.currentList,
			selectedIds: state.selectedIds.filter(
				(selectedId) => selectedId !== slug,
			),
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
	slug: string,
): Promise<ContactList> => {
	const list = contactListStore
		.getState()
		.contactLists.find((l) => l.slug === slug);
	if (!list) throw new Error("Contact list not found");
	const newStatus = list.status === "published" ? "draft" : "published";
	return updateContactListAction(slug, { status: newStatus as any });
};

export const exportContactListAction = async (slug: string): Promise<void> => {
	try {
		contactListStore.setState({ loading: true, error: null });
		await exportContactList(slug);
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
				list.status?.toLowerCase().includes(query),
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
					new Date(a.date_created || 0).getTime() -
					new Date(b.date_created || 0).getTime();
				break;
			case "contact_count":
				comparison = (a.contactCount || 0) - (b.contactCount || 0);
				break;
			case "last_updated":
				comparison =
					new Date(a.date_updated || a.date_created || 0).getTime() -
					new Date(b.date_updated || b.date_created || 0).getTime();
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
