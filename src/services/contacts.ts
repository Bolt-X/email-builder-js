import { createItem, readItems } from "@directus/sdk";
import { directusClientWithRest } from "./directus";

export const getAllContactLists = async () => {
    try {
        const res = await directusClientWithRest.request(readItems("contact_lists", {
            fields: ["*", "subscribers.subscriber.*"],
            sort: ["-date_created"],
        }));
        return res;
    } catch (error) {
        console.error("Error fetching contact lists:", error);
        throw error;
    }
}

export const createContactList = async (payload: any) => {
    try {
        const res = await directusClientWithRest.request(createItem("contact_lists", payload));
        return res;
    } catch (error) {
        console.error("Error creating contact list:", error);
        throw error;
    }
}