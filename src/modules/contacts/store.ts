import { create } from "zustand";
import { Contact, ContactList } from "./types";
import { getAllContacts, getAllContactLists } from "./service";

type ContactState = {
	contacts: Contact[];
	contactLists: ContactList[];
	loading: boolean;
	error: string | null;
};

const contactStore = create<ContactState>(() => ({
	contacts: [],
	contactLists: [],
	loading: false,
	error: null,
}));

export const useContacts = () => contactStore((s) => s.contacts);
export const useContactLists = () => contactStore((s) => s.contactLists);
export const useContactsLoading = () => contactStore((s) => s.loading);
export const useContactsError = () => contactStore((s) => s.error);

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

export const fetchContactLists = async () => {
	try {
		contactStore.setState({ loading: true, error: null });
		const res = await getAllContactLists();
		contactStore.setState({
			contactLists: res ?? [],
			loading: false,
		});
	} catch (err: any) {
		contactStore.setState({
			error: err.message,
			loading: false,
		});
	}
};
