import { createItem, createItems, readItem, readItems } from "@directus/sdk";
import { directusClientWithRest } from "./directus";
import { transformContactFromDirectus, transformContactListFromDirectus } from "../modules/contacts";

export const createContact = async (contact: any, slug: string) => {
    try {
        const { tags, ...subscriberData } = contact;
        const res = await directusClientWithRest.request(createItem("subscribers", subscriberData));
        await directusClientWithRest.request(createItem("contact_lists_subscribers", {
            list: slug,
            subscriber: res.id,
        }));
        const payload = contact.tags.map((tag) => ({
            subscribers_id: res.id,
            tags_slug: tag,
        }));
        await directusClientWithRest.request(createItems("subscribers_tags", payload))
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

export const getContactListById = async (slug: string, filter: any) => {
    try {
        const deepFilter: any = {};

        if (filter.from || filter.to) {
            deepFilter.date_created = {};
            if (filter.from) deepFilter.date_created._gte = filter.from;
            if (filter.to) deepFilter.date_created._lte = filter.to;
        }

        if (filter.status) {
            deepFilter.status = { _eq: filter.status };
        }

        if (filter.tags?.length) {
            deepFilter.tags = {
                tags_slug: { _in: filter.tags },
            };
        }

        const hasDeepFilter = Object.keys(deepFilter).length > 0;
        console.log("hasDeepFilter", deepFilter);

        const res = await directusClientWithRest.request(
            readItem("contact_lists", slug, {
                fields: ["*", "subscribers.subscriber.*"],
                ...(hasDeepFilter && {
                    deep: {
                        subscribers: {
                            _filter: {
                                subscriber: deepFilter,
                            }
                        },
                    },
                }),
            }),
        );

        return transformContactListFromDirectus(res);
    } catch (error) {
        console.error("error", error);
        throw error;
    }
};