import { createItem, readItem, readItems } from "@directus/sdk";
import { directusClientWithRest } from "./directus";

export const createContact = async (contact: any, slug: string) => {
    try {
        const res = await directusClientWithRest.request(createItem("subscribers", contact));
        await directusClientWithRest.request(createItem("contact_lists_subscribers", {
            list: slug,
            subscriber: res.id,
        }));
        return res;
    } catch (error) {
        console.error("Error creating contact:", error);
        throw error;
    }
}

export const getProvinces = async () => {
    try {
        const res = await directusClientWithRest.request(
            readItems("provinces", {
                fields: ["name", "slug"],
            })
        );

        return res as { name: string; slug: string }[];
    } catch (error) {
        console.error("Error fetching provinces:", error);
        throw error;
    }
};

export const getWardsByProvinceId = async (provinceId: string | number) => {
    if (!provinceId) return []
    try {
        const res = await directusClientWithRest.request(
            readItem("provinces", provinceId, {
                fields: ["wards.slug", "wards.name"],
            })
        );

        return (res as any).wards as { slug: string; name: string }[];
    } catch (error) {
        console.error("Error fetching wards:", error);
        throw error;
    }
};