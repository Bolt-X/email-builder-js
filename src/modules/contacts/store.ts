import { create } from "zustand";
import { Contact, ContactList } from "./types";
import { getAllContacts, getAllContactLists } from "./service";

type ContactState = {
	contacts: Contact[];
	loading: boolean;
	error: string | null;
	visibleColumns: string[];
};

const DEFAULT_COLUMNS = ["email", "status", "date_created"];

const getStoredColumns = (): string[] => {
	if (typeof window === "undefined") return DEFAULT_COLUMNS;
	const stored = localStorage.getItem("contact_columns");
	return stored ? JSON.parse(stored) : DEFAULT_COLUMNS;
};

const contactStore = create<ContactState>(() => ({
	contacts: [],
	loading: false,
	error: null,
	visibleColumns: getStoredColumns(),
}));

export const useContacts = () => contactStore((s) => s.contacts);
export const useContactsLoading = () => contactStore((s) => s.loading);
export const useContactsError = () => contactStore((s) => s.error);
export const useVisibleColumns = () => contactStore((s) => s.visibleColumns);

export const setVisibleColumns = (columns: string[]) => {
	contactStore.setState({ visibleColumns: columns });
	if (typeof window !== "undefined") {
		localStorage.setItem("contact_columns", JSON.stringify(columns));
	}
};

export const fetchContacts = async () => {
	try {
		contactStore.setState({ loading: true, error: null });
		const res = await getAllContacts();
		contactStore.setState({
			contacts: res ?? [],
			loading: false,
		});
	} catch (err: any) {
		contactStore.setState({
			error: err.message,
			loading: false,
		});
	}
};

// Re-export specific selectors/actions from contactList.store
export {
	useContactLists,
	useContactListsLoading,
	useContactListsError,
	useSelectedContactLists,
	useFilteredContactLists,
	toggleSelectContactList,
	selectAllContactLists,
	clearSelection,
	fetchContactLists,
	createContactListAction,
	updateContactListAction,
	deleteContactListAction,
	exportContactListAction,
} from "./stores/contactList.store";
