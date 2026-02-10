import {
    createItem,
    createItems,
    deleteItems,
    readItem,
    readItems,
    updateItem,
} from "@directus/sdk";
import { directusClientWithRest } from "./directus";
import {
    transformContactFromDirectus,
    transformContactListFromDirectus,
} from "../modules/contacts";

export const createContact = async (contact: any, slug: string) => {
    try {
        const { tags, ...subscriberData } = contact;
        const res = await directusClientWithRest.request(
            createItem("subscribers", subscriberData),
        );
        await directusClientWithRest.request(
            createItem("contact_lists_subscribers", {
                list: slug,
                subscriber: res.id,
            }),
        );
        if (tags && tags.length > 0) {
            const payload = tags.map((tag: string) => ({
                subscribers_id: res.id,
                tags_slug: tag,
            }));
            await directusClientWithRest.request(
                createItems("subscribers_tags", payload),
            );
        }
        return res;
    } catch (error) {
        console.error("Error creating contact:", error);
        throw error;
    }
};

export const updateContact = async (
    contactId: string | number,
    contact: any,
) => {
    try {
        const { tags, ...subscriberData } = contact;

        // 1. Update subscriber basic info
        const res = await directusClientWithRest.request(
            updateItem("subscribers", contactId, subscriberData),
        );

        // 2. Update tags if provided
        if (tags) {
            // First delete existing tags
            const existingTags = await directusClientWithRest.request(
                readItems("subscribers_tags", {
                    filter: {
                        subscribers_id: {
                            _eq: contactId,
                        },
                    },
                    fields: ["id"],
                }),
            );

            if (existingTags && existingTags.length > 0) {
                const idsToDelete = existingTags.map((item: any) => item.id);
                await directusClientWithRest.request(
                    deleteItems("subscribers_tags", idsToDelete),
                );
            }

            // Then add new tags
            if (tags.length > 0) {
                const payload = tags.map((tag: string) => ({
                    subscribers_id: contactId,
                    tags_slug: tag,
                }));
                await directusClientWithRest.request(
                    createItems("subscribers_tags", payload),
                );
            }
        }

        return res;
    } catch (error) {
        console.error("Error updating contact:", error);
        throw error;
    }
};

export const getProvinces = async () => {
    try {
        const res = await directusClientWithRest.request(
            readItems("provinces", {
                fields: ["name", "slug"],
            }),
        );

        return res as { name: string; slug: string }[];
    } catch (error) {
        console.error("Error fetching provinces:", error);
        throw error;
    }
};

export const getWardsByProvinceId = async (provinceId: string | number) => {
    if (!provinceId) return [];
    try {
        const res = await directusClientWithRest.request(
            readItem("provinces", provinceId, {
                fields: ["wards.slug", "wards.name"],
            }),
        );

        return (res as any).wards as { slug: string; name: string }[];
    } catch (error) {
        console.error("Error fetching wards:", error);
        throw error;
    }
};

export const getContactListById = async (slug: string, filter?: any) => {
    try {
        const subscriberFilter: any = {};
        const otherFilters: any = {};

        // Filter theo ngày tạo
        if (filter?.from || filter?.to) {
            const dateFilter: any = {};
            if (filter.from) dateFilter._gte = filter.from;
            if (filter.to) dateFilter._lte = filter.to;
            otherFilters.date_created = dateFilter;
        }

        // Filter theo status (có thể là array hoặc single value)
        if (filter?.status) {
            if (Array.isArray(filter.status) && filter.status.length > 0) {
                otherFilters.status = { _in: filter.status };
            } else if (typeof filter.status === 'string' && filter.status) {
                otherFilters.status = { _eq: filter.status };
            }
        }

        // Filter theo tags
        if (filter?.tags?.length) {
            otherFilters.tags = {
                tags_slug: { _in: filter.tags },
            };
        }

        // Filter theo text search
        if (filter?.text && filter.text.trim()) {
            const isValidDate = (value: string) =>
                /^\d{4}-\d{2}-\d{2}$/.test(value);
            otherFilters._or = [
                { email: { _icontains: filter.text } },
                { first_name: { _icontains: filter.text } },
                { last_name: { _icontains: filter.text } },
                { address: { _icontains: filter.text } },
                { phone_number: { _icontains: filter.text } },
                { company: { _icontains: filter.text } },
                ...(isValidDate(filter.text)
                    ? [{ birthday: { _eq: filter.text } }]
                    : []),
            ];
        }

        // Kết hợp tất cả các filter
        const filterKeys = Object.keys(otherFilters);
        if (filterKeys.length > 0) {
            if (filterKeys.length === 1) {
                // Chỉ có một điều kiện
                Object.assign(subscriberFilter, otherFilters);
            } else {
                // Có nhiều điều kiện, cần dùng _and
                const andConditions: any[] = [];
                Object.keys(otherFilters).forEach(key => {
                    andConditions.push({ [key]: otherFilters[key] });
                });
                subscriberFilter._and = andConditions;
            }
        }

        const hasFilter = Object.keys(subscriberFilter).length > 0;

        const queryOptions: any = {
            fields: ["*", "subscribers.subscriber.*", "subscribers.subscriber.tags.*"],
        };

        if (hasFilter) {
            queryOptions.deep = {
                subscribers: {
                    _filter: {
                        subscriber: subscriberFilter,
                    }
                },
            };
        }

        const res = await directusClientWithRest.request(
            readItem("contact_lists", slug, queryOptions),
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
    oldListId: string,
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
            }),
        );

        // 2. Xóa record cũ nếu tìm thấy
        if (existingRelations && (existingRelations as any[]).length > 0) {
            const relationIds = (existingRelations as any[]).map((rel) => rel.id);
            await directusClientWithRest.request(
                deleteItems("contact_lists_subscribers", relationIds),
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
            }),
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
        return { message: "Contact already in new list, removed from old list" };
    } catch (error) {
        console.error("Error moving contact to list:", error);
        throw error;
    }
}

export const addContactToList = async (
    contactIds: string[],
    listId: string,
) => {
    try {
        const res = await directusClientWithRest.request(
            createItems(
                "contact_lists_subscribers",
                contactIds.map((contactId) => ({
                    list: listId,
                    subscriber: contactId,
                })),
            ),
        );
        return res;
    } catch (error) {
        console.error("Error adding contacts to list:", error);
        throw error;
    }
};

export const deleteContatsFromList = async (contactIds: string[]) => {
    try {
        const res = await directusClientWithRest.request(
            deleteItems("subscribers", contactIds),
        );
        return res;
    } catch (error) {
        console.error("Error deleting contacts from list:", error);
        throw error;
    }
};
