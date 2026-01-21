import { useQuery } from "@tanstack/react-query";
import { getAllContactLists } from "../modules/contacts/service";

export const useGetAllContactLists = () => {
	return useQuery({
		queryKey: ["contact_lists"],
		queryFn: getAllContactLists,
		select: (data) => data ?? [],
	});
};
