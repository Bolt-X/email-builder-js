import { createItem, readItems, updateItem } from "@directus/sdk";
import { directusClientWithRest } from "./directus";

export const getAllTags = async () => {
    try {
        const res = await directusClientWithRest.request(
            readItems("tags", {
                fields: ["*"],
                sort: "title",
            }),
        );
        return res;
    } catch (error) { }
};

export const createTag = async (name: any) => {
    try {
        const res = await directusClientWithRest.request(
            createItem("tags", { title: name }),
        );
        return res;
    } catch (error) { }
};

export const updateTag = async (id: string, payload: any) => {
    try {
        const res = await directusClientWithRest.request(
            updateItem("tags", id, payload),
        );
        return res;
    } catch (error) { }
};
