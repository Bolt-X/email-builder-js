import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createContact, deleteContatsFromList, getContactListById, getProvinces, getWardsByProvinceId, moveContactToList } from "../services/contact";
import { Contact } from "../modules/contacts";
import { toast } from "react-toastify";
import i18n from "../i18n";

export const useCreateContact = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ contact, slug }: { contact: any, slug: string }) => createContact(contact, slug),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contact_list_by_id"] });
            toast.success(i18n.t("contacts.create_contact_success"));
        },
        onError: () => {
            toast.error(i18n.t("contacts.create_contact_error"));
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

export const useGetContactListById = (slug: string, filter?: any) => {
    return useQuery({
        queryKey: ["contact_list_by_id", slug, filter],
        queryFn: () => getContactListById(slug, filter),
        select: (data) => data ?? { subscribers: [], name: "" },
    });
};

export const useDeleteContatsFromList = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (contactIds: string[]) => deleteContatsFromList(contactIds),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contact_list_by_id"] });
            toast.success(i18n.t("contacts.delete_contact_success"));
        },
        onError: () => {
            toast.error(i18n.t("contacts.delete_contact_error"));
        },
    });
};

export const useMoveContactToList = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ contactId, newListId, oldListId }: { contactId: string, newListId: string, oldListId: string }) => moveContactToList(contactId, newListId, oldListId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["contact_list_by_id"] });
            toast.success(i18n.t("contacts.move_contact_success"));
        },
        onError: () => {
            toast.error(i18n.t("contacts.move_contact_error"));
        },
    });
};