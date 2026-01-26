import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContact, getProvinces, getWardsByProvinceId } from "../services/contact";
import { Contact } from "../modules/contacts";

export const useCreateContact = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ contact, slug }: { contact: any, slug: string }) => createContact(contact, slug),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contact"] });
        },
    });
};

export const useGetProvinces = () => {
    return useQuery({
        queryKey: ["provinces"],
        queryFn: getProvinces,
        select: (data) => data ?? [],
    });
};

export const useGetWardsByProvinceId = (provinceId: string | number) => {
    if (!provinceId) return { data: [] }
    return useQuery({
        queryKey: ["wards", provinceId],
        queryFn: () => getWardsByProvinceId(provinceId),
        select: (data) => data ?? [],
    });
};