import { useQuery } from "@tanstack/react-query";
import { getAllTemplates } from "../modules/templates";

export const useGetAllTemplates = () => {
    return useQuery({
        queryKey: ["templates"],
        queryFn: getAllTemplates,
        select: (data) => data ?? [],
        refetchOnWindowFocus: false,
    });
}