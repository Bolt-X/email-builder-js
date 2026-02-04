import { createItem, createItems, deleteItems, readItem, readItems } from "@directus/sdk";
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

export const getContactListById = async (slug: string, filter?: any) => {
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

export const moveContactToList = async (
    contactId: string,
    newListId: string,
    oldListId: string
) => {
    try {
        // 1. Tìm record trong junction table để xóa (contact đang ở list cũ)
        const existingRelations = await directusClientWithRest.request(
            readItems("contact_lists_subscribers", {
                filter: {
                    list: {
                        _eq: oldListId,
                    },
                    subscriber: {
                        _eq: contactId,
                    },
                },
                fields: ["id"],
            })
        );

        // 2. Xóa record cũ nếu tìm thấy
        if (existingRelations && (existingRelations as any[]).length > 0) {
            const relationIds = (existingRelations as any[]).map((rel) => rel.id);
            await directusClientWithRest.request(
                deleteItems("contact_lists_subscribers", relationIds)
            );
        }

        // 3. Kiểm tra xem contact đã có trong list mới chưa (tránh duplicate)
        const existingInNewList = await directusClientWithRest.request(
            readItems("contact_lists_subscribers", {
                filter: {
                    list: {
                        _eq: newListId,
                    },
                    subscriber: {
                        _eq: contactId,
                    },
                },
                fields: ["id"],
            })
        );

        // 4. Chỉ thêm vào list mới nếu chưa có
        if (!existingInNewList || (existingInNewList as any[]).length === 0) {
            const res = await directusClientWithRest.request(
                createItem("contact_lists_subscribers", {
                    list: newListId,
                    subscriber: contactId,
                })
            );
            return res;
        }
        await getContactListById(oldListId)
        // Nếu đã có trong list mới rồi thì chỉ cần xóa khỏi list cũ (đã làm ở bước 2)
        return { message: "Contact already in new list, removed from old list" };
    } catch (error) {
        console.error("Error moving contact to list:", error);
        throw error;
    }
}

export const addContactToList = async (contactIds: string[], listId: string) => {
    try {
        const res = await directusClientWithRest.request(createItems("contact_lists_subscribers", contactIds.map((contactId) => ({
            list: listId,
            subscriber: contactId,
        })))
        );
        return res;
    } catch (error) {
        console.error("Error adding contacts to list:", error);
        throw error;
    }
}

export const deleteContatsFromList = async (contactIds: string[]) => {
    try {
        const res = await directusClientWithRest.request(deleteItems("subscribers", contactIds))
        return res;
    } catch (error) {
        console.error("Error deleting contacts from list:", error);
        throw error;
    }
}