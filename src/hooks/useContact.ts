import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContact, getContactListById, getProvinces, getWardsByProvinceId } from "../services/contact";
import { Contact } from "../modules/contacts";

export const useCreateContact = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ contact, slug }: { contact: any, slug: string }) => createContact(contact, slug),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contact_list_by_id"] });
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

export const useGetContactListById = (slug: string, filter: any) => {
    return useQuery({
        queryKey: ["contact_list_by_id", slug, filter],
        queryFn: () => getContactListById(slug, filter),
        select: (data) => data ?? { subscribers: [], name: "" },
    });
};