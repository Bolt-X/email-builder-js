import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContactList } from "../services/contacts";
import { deleteContactList, duplicateContactList, getAllContactLists, updateContactList } from "../modules/contacts";
import { s } from "vite/dist/node/types.d-aGj9QkWt";

export const useGetAllContactLists = (from?: string, to?: string) => {
	return useQuery({
		queryKey: ["contact_lists", from, to],
		queryFn: () => getAllContactLists(from, to),
		select: (data) => data ?? [],
	});
};

export const useCreateContactList = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (payload: any) => createContactList(payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contact_lists"] });
		},
	});
};

export const useUpdateContactList = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({ slug, payload }: { slug: string; payload: any }) => updateContactList(slug, payload),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contact_lists"] });
		},
	});
}

export const useDeleteContactList = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (slug: string) => deleteContactList(slug),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contact_lists"] });
		},
	});
}

export const useDuplicateContactList = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: ({slug, newName}: {slug: string, newName?: string}) => duplicateContactList(slug, newName),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["contact_lists"] });
		},
	});
}