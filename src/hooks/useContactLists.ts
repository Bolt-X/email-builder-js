import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContactList } from "../services/contacts";
import {
	deleteContactList,
	duplicateContactList,
	getAllContactLists,
	updateContactList,
} from "../modules/contacts";
import { s } from "vite/dist/node/types.d-aGj9QkWt";
import { toast } from "react-toastify";
import i18n from "../i18n";

export const useGetAllContactLists = (from?: string, to?: string, searchText?: string) => {
	return useQuery({
		queryKey: ["contact_lists", from, to, searchText],
		queryFn: () => getAllContactLists(from, to, searchText),
		select: (data) => data ?? [],
	});
};

export const useCreateContactList = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: any) => createContactList(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contact_lists"] });
			toast.success(i18n.t("contacts.create_contact_list_success"));
		},
		onError: () => {
			toast.error(i18n.t("contacts.create_contact_list_error"));
		},
	});
};

export const useUpdateContactList = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ slug, payload }: { slug: string; payload: any }) =>
			updateContactList(slug, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contact_lists"] });
			toast.success(i18n.t("contacts.update_contact_list_success"));
		},
		onError: () => {
			toast.error(i18n.t("contacts.update_contact_list_error"));
		},
	});
};

export const useDeleteContactList = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (slugs: string[]) => deleteContactList(slugs),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contact_lists"] });
			toast.success(i18n.t("contacts.delete_contact_list_success"));
		},
		onError: () => {
			toast.error(i18n.t("contacts.delete_contact_list_error"));
		},
	});
};

export const useDuplicateContactList = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ slug, newName }: { slug: string, newName?: string }) => duplicateContactList(slug, newName),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contact_lists"] });
			toast.success(i18n.t("contacts.duplicate_contact_list_success"));
		},
		onError: () => {
			toast.error(i18n.t("contacts.duplicate_contact_list_error"));
		},
	});
};
