import {
  createItem,
  createItems,
  deleteItems,
  readItem,
  readItems,
  updateItem
} from "@directus/sdk";
import * as XLSX from "xlsx";
import { directusClientWithRest } from "../../services/directus";
import { Contact, ContactList, Segment, ContactStatus } from "./types";

/**
 * Transform Directus Subscriber to Contact model
 */
export function transformContactFromDirectus(item: any): Contact {
  return {
    id: item?.id,
    email: item?.email,
    first_name: item?.first_name,
    last_name: item?.last_name,
    status: item?.status,
    date_created: item?.date_created,
    date_updated: item?.date_updated,
  };
}

/**
 * Transform Contact model to Directus format
 */
export function transformContactToDirectus(contact: Partial<Contact>): any {
  const directusContact: any = {};
  if (contact.email !== undefined) directusContact.email = contact.email;
  if (contact.first_name !== undefined) directusContact.first_name = contact.first_name;
  if (contact.last_name !== undefined) directusContact.last_name = contact.last_name;
  if (contact.status !== undefined) directusContact.status = contact.status;
  return directusContact;
}

/**
 * Transform Directus Contact List to ContactList model
 */
export function transformContactListFromDirectus(item: any): ContactList {
  return {
    slug: item.slug,
    name: item.name,
    status: item.status,
    subscribers: item.subscribers?.map((s: any) => {
      // Directus uses 'subscriber' field in junction table
      return typeof s.subscriber === "object"
        ? transformContactFromDirectus(s.subscriber)
        : ({ id: s.subscriber } as Contact);
    }),
    description: item.description,
    date_created: item.date_created,
    date_updated: item.date_updated,
    contactCount: item.subscribers?.length || 0,
    is_default: item.is_default,
  };
}

/**
 * Transform ContactList model to Directus format
 */
export function transformContactListToDirectus(
  list: Partial<ContactList>,
): any {
  const directusList: any = {};
  if (list.slug !== undefined) directusList.slug = list.slug;
  if (list.name !== undefined) directusList.name = list.name;
  if (list.status !== undefined) directusList.status = list.status;
  if (list.is_default !== undefined) directusList.is_default = list.is_default;
  return directusList;
}

export async function getAllContacts(): Promise<Contact[]> {
  try {
    const res = await directusClientWithRest.request(
      readItems("subscribers", {
        fields: ["*"],
        sort: ["-date_created"],
      }),
    );
    console.log("res", res);
    return (res as any[]).map(transformContactFromDirectus);
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    return [];
  }
}

export async function getAllContactLists(
  from?: string,
  to?: string,
  searchText?: string
): Promise<ContactList[]> {
  try {
    const filter =
      from || to
        ? {
          date_created: {
            ...(from && { _gte: from }),
            ...(to && { _lte: to }),
          },
        }
        : undefined;

    const res = await directusClientWithRest.request(
      readItems("contact_lists", {
        fields: ["*", "subscribers.subscriber.*"],
        sort: ["-date_created"],
        ...(filter && { filter }),
        ...(searchText && { search: searchText })
      }),
    );

    return (res as any[]).map(transformContactListFromDirectus);
  } catch (error) {
    console.error("Error fetching contact lists:", error);
    return [];
  }
}

export async function getContactListBySlug(
  slug: string,
): Promise<ContactList | null> {
  try {
    const res = await directusClientWithRest.request(
      readItem("contact_lists", slug, {
        fields: ["*", "subscribers.subscriber.*"],
      }),
    );
    return transformContactListFromDirectus(res as any);
  } catch (error) {
    console.error("Error fetching contact list:", error);
    return null;
  }
}

export async function getContactListSubscribers(): Promise<any[]> {
  try {
    const res = await directusClientWithRest.request(
      readItems("contact_lists_subscribers", {
        fields: ["*", "subscribers.subscriber.*", "contact_lists.*"],
      }),
    );
    return res as any[];
  } catch (error) {
    console.error("Error fetching contact list subscribers:", error);
    return [];
  }
}

// Keeping these for now, may need updating if they use ID instead of Slug
export async function createContactList(
  list: Omit<ContactList, "createdAt" | "updatedAt" | "contactCount">,
): Promise<ContactList> {
  try {
    const payload = transformContactListToDirectus(list);
    const res = await directusClientWithRest.request(
      createItem("contact_lists", payload),
    );
    return transformContactListFromDirectus(res as any);
  } catch (error) {
    console.error("Error creating contact list:", error);
    throw error;
  }
}

export async function updateContactList(
  slug: string,
  list: Partial<ContactList>,
): Promise<ContactList> {
  try {
    const payload = transformContactListToDirectus(list);
    const res = await directusClientWithRest.request(
      updateItem("contact_lists", slug, payload, {
        fields: ["*", "subscribers.subscriber.*", "campaigns.campaign.*"],
      }),
    );
    return transformContactListFromDirectus(res as any);
  } catch (error) {
    console.error("Error updating contact list:", error);
    throw error;
  }
}

export async function deleteContactList(slugs: string[]): Promise<void> {
  try {
    await directusClientWithRest.request(deleteItems("contact_lists", slugs));
  } catch (error) {
    console.error("Error deleting contact list:", error);
    throw error;
  }
}

const createContactListSubscriber = async (payload: any): Promise<any> => {
  try {
    const res = await directusClientWithRest.request(createItems("contact_lists_subscribers", payload));
    return res as any;
  } catch (error) {
    console.error("Error creating contact list subscriber:", error);
    throw error;
  }
}

/**
 * Tạo subscriber mới hoặc cập nhật subscriber đã tồn tại
 */
export async function createOrUpdateSubscriber(
  contact: Partial<Contact>,
  updateExisting: boolean = true
): Promise<Contact> {
  try {
    // Kiểm tra subscriber đã tồn tại chưa (theo email)
    if (contact.email) {
      const existing = await directusClientWithRest.request(
        readItems("subscribers", {
          filter: {
            email: {
              _eq: contact.email,
            },
          },
          limit: 1,
        })
      );

      if (existing && (existing as any[]).length > 0) {
        if (updateExisting) {
          // Update subscriber đã tồn tại
          const existingId = (existing as any[])[0].id;
          const updateData = transformContactToDirectus(contact);
          const updated = await directusClientWithRest.request(
            updateItem("subscribers", existingId, updateData)
          );
          return transformContactFromDirectus(updated as any);
        } else {
          // Trả về subscriber đã tồn tại mà không update
          return transformContactFromDirectus((existing as any[])[0]);
        }
      }
    }

    // Tạo subscriber mới
    const newSubscriber = transformContactToDirectus(contact);
    const created = await directusClientWithRest.request(
      createItem("subscribers", newSubscriber)
    );
    await getAllContacts()
    return transformContactFromDirectus(created as any);
  } catch (error) {
    console.error("Error creating or updating subscriber:", error);
    throw error;
  }
}

/**
 * Parse CSV file - xử lý đúng các trường hợp có dấu phẩy trong giá trị
 */
function parseCSV(csvText: string): any[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) return [];

  // Hàm parse một dòng CSV
  const parseCSVLine = (line: string): string[] => {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Escaped quote
          current += '"';
          i++; // Skip next quote
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // End of field
        result.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }

    // Add last field
    result.push(current.trim());
    return result;
  };

  // Parse header
  const headers = parseCSVLine(lines[0]).map(h => h.replace(/^"|"$/g, ""));

  // Parse rows
  const rows: any[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]).map(v => v.replace(/^"|"$/g, ""));
    const row: any = {};
    headers.forEach((header, index) => {
      row[header] = values[index] || "";
    });
    rows.push(row);
  }

  return rows;
}

/**
 * Parse XLSX file sử dụng thư viện xlsx
 */
async function parseXLSX(file: File): Promise<any[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          reject(new Error("Failed to read file"));
          return;
        }

        // Đọc workbook từ file
        const workbook = XLSX.read(data, { type: "binary" });

        // Lấy sheet đầu tiên
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Chuyển đổi sheet thành JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" });

        // Chuyển đổi về format giống CSV (array of objects với keys là header)
        resolve(jsonData as any[]);
      } catch (error) {
        reject(new Error(`Failed to parse XLSX file: ${error instanceof Error ? error.message : "Unknown error"}`));
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    // Đọc file dưới dạng binary string
    reader.readAsBinaryString(file);
  });
}

/**
 * Import contacts từ file CSV hoặc XLSX
 */
export interface ImportContactsOptions {
  file: File;
  contactListSlug: string;
  status?: string;
  updateExisting?: string;
  tags?: any[];
}

export async function importContacts(options: ImportContactsOptions): Promise<{
  success: number;
  failed: number;
  errors: Array<{ row: number; email: string; error: string }>;
}> {
  const { file, contactListSlug, status = "subscribed", updateExisting = "both", tags = [] } = options;

  let rows: any[] = [];
  const errors: Array<{ row: number; email: string; error: string }> = [];
  let successCount = 0;
  let failedCount = 0;

  try {
    // Parse file
    if (file.name.endsWith(".csv") || file.name.endsWith(".txt")) {
      const text = await file.text();
      rows = parseCSV(text);
    } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
      rows = await parseXLSX(file);
    } else {
      throw new Error("Unsupported file format. Please use CSV or XLSX.");
    }

    if (rows.length === 0) {
      throw new Error("File is empty or could not be parsed.");
    }

    // Map columns - tìm các cột email, first_name, last_name
    const firstRow = rows[0];
    const emailColumn = Object.keys(firstRow).find(
      key => key.toLowerCase().includes("email")
    );

    if (!emailColumn) {
      throw new Error("Email column not found in file.");
    }

    const firstNameColumn = Object.keys(firstRow).find(
      key => key.toLowerCase().includes("first") && key.toLowerCase().includes("name")
    );
    const lastNameColumn = Object.keys(firstRow).find(
      key => key.toLowerCase().includes("last") && key.toLowerCase().includes("name")
    );

    // Xử lý từng row
    const subscriberIds: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const email = row[emailColumn]?.trim();

      if (!email) {
        failedCount++;
        errors.push({
          row: i + 2, // +2 vì có header và index bắt đầu từ 0
          email: "",
          error: "Email is required",
        });
        continue;
      }

      try {
        // Tạo hoặc update subscriber
        const contactData: Partial<Contact> = {
          email,
          first_name: firstNameColumn ? row[firstNameColumn]?.trim() : undefined,
          last_name: lastNameColumn ? row[lastNameColumn]?.trim() : undefined,
          status: status as ContactStatus,
        };


        const subscriber = await createOrUpdateSubscriber(contactData, updateExisting === "both" ? true : updateExisting === "add" ? false : true);
        const payload = tags.map((tag) => ({
          subscribers_id: subscriber.id,
          tags_slug: tag,
        }));
        await directusClientWithRest.request(createItems("subscribers_tags", payload))
        subscriberIds.push(subscriber.id!);
        successCount++;
      } catch (error: any) {
        failedCount++;
        errors.push({
          row: i + 2,
          email,
          error: error.message || "Failed to create subscriber",
        });
      }
    }

    // Tạo records trong contact_lists_subscribers (chỉ những subscriber chưa có trong list)
    if (subscriberIds.length > 0) {
      try {
        // Kiểm tra các subscriber đã có trong list chưa
        const existingRelations = await directusClientWithRest.request(
          readItems("contact_lists_subscribers", {
            filter: {
              list: {
                _eq: contactListSlug,
              },
              subscriber: {
                _in: subscriberIds,
              },
            },
            fields: ["subscriber"],
          })
        );

        const existingSubscriberIds = (existingRelations as any[]).map(
          (rel) => rel.subscriber
        );
        const newSubscriberIds = subscriberIds.filter(
          (id) => !existingSubscriberIds.includes(id)
        );

        if (newSubscriberIds.length > 0) {
          const payload = newSubscriberIds.map((subscriberId) => ({
            list: contactListSlug,
            subscriber: subscriberId,
          }));

          await createContactListSubscriber(payload);
        }
      } catch (error) {
        console.error("Error creating contact list subscribers:", error);
        // Không throw error ở đây vì subscribers đã được tạo
      }
    }

    return {
      success: successCount,
      failed: failedCount,
      errors,
    };
  } catch (error: any) {
    console.error("Error importing contacts:", error);
    throw error;
  }
}

export async function duplicateContactList(
  slug: string,
  newName?: string,
): Promise<ContactList> {
  try {
    const original = await getContactListBySlug(slug);
    if (!original) throw new Error("Contact list not found");

    // Generate unique slug with timestamp and random string
    const randomStr = Math.random().toString(36).substring(2, 8);
    const newSlug = `${original.slug}-copy-${Date.now()}-${randomStr}`;

    // Create the new contact list
    const newList = await createContactList({
      name: newName || `${original.name} (Copy)`,
      status: "draft",
    });

    const payload = original.subscribers.map((subscriber) => ({
      list: newList.slug,
      subscriber: subscriber.id,
    }));

    await createContactListSubscriber(payload);

    const completeList = await getContactListBySlug(newSlug);
    return completeList || newList;
  } catch (error) {
    console.error("Error duplicating contact list:", error);
    throw error;
  }
}

// Segment functions (keeping these separate but updated mappings if needed)
function transformSegmentFromDirectus(item: any): Segment {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    conditions: item.conditions
      ? typeof item.conditions === "string"
        ? JSON.parse(item.conditions)
        : item.conditions
      : [],
    logicOperator: item.logic_operator || "AND",
    estimatedCount: item.estimated_count,
    createdAt: item.date_created,
    updatedAt: item.date_updated,
  };
}

function transformSegmentToDirectus(segment: Partial<Segment>): Partial<any> {
  const directusSegment: any = {};
  if (segment.name !== undefined) directusSegment.name = segment.name;
  if (segment.description !== undefined)
    directusSegment.description = segment.description;
  if (segment.conditions !== undefined)
    directusSegment.conditions = JSON.stringify(segment.conditions);
  if (segment.logicOperator !== undefined)
    directusSegment.logic_operator = segment.logicOperator;
  return directusSegment;
}

export async function getAllSegments(): Promise<Segment[]> {
  try {
    const res = await directusClientWithRest.request(
      readItems("segments", {
        fields: ["*"],
        sort: ["name"],
      }),
    );
    return (res as any[]).map(transformSegmentFromDirectus);
  } catch (error) {
    console.error("Error fetching segments:", error);
    return [];
  }
}

export async function getContactListById(id: string | number) {
  return getContactListBySlug(String(id));
}

export async function exportContactList(slug: string | number): Promise<void> {
  console.log("Exporting contact list:", slug);

}

/**
 * Download contact list as CSV file
 */
export async function downloadContactListAsCSV(slug: string): Promise<void> {
  try {
    // Lấy contact list với tất cả subscribers
    const contactList = await getContactListBySlug(slug);
    if (!contactList) {
      throw new Error("Contact list not found");
    }

    // Lấy tất cả subscribers từ contact list
    const subscribersData = await getContactListBySlugWithSubscribers(slug);

    // Chuyển đổi subscribers thành format Contact
    const subscribers: Contact[] = subscribersData
      .map((item: any) => {
        const subscriber = item.subscriber;
        // Nếu subscriber là object thì transform, nếu là string/ID thì bỏ qua (cần fetch riêng)
        if (subscriber && typeof subscriber === "object") {
          return transformContactFromDirectus(subscriber);
        }
        return null;
      })
      .filter((contact): contact is Contact => contact !== null);

    // Tạo CSV content
    const headers = ["Email", "First Name", "Last Name", "Status", "Date Created", "Date Updated"];
    const rows = subscribers.map((subscriber) => {
      return [
        subscriber.email || "",
        subscriber.first_name || "",
        subscriber.last_name || "",
        subscriber.status || "",
        subscriber.date_created ? new Date(subscriber.date_created).toLocaleString() : "",
        subscriber.date_updated ? new Date(subscriber.date_updated).toLocaleString() : "",
      ];
    });

    // Escape CSV values (xử lý dấu phẩy và dấu ngoặc kép)
    const escapeCSV = (value: string | undefined | null): string => {
      const strValue = value?.toString() || "";
      if (strValue.includes(",") || strValue.includes('"') || strValue.includes("\n")) {
        return `"${strValue.replace(/"/g, '""')}"`;
      }
      return strValue;
    };

    // Tạo CSV string
    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row) => row.map(escapeCSV).join(",")),
    ].join("\n");

    // Tạo BOM để hỗ trợ UTF-8 trong Excel
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + csvContent], { type: "text/csv;charset=utf-8;" });

    // Tạo link download
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);

    // Tên file: sanitize tên contact list
    const fileName = `${slug}.csv`;
    link.setAttribute("download", fileName);

    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading contact list as CSV:", error);
    throw error;
  }
}

export const getContactListBySlugWithSubscribers = async (slug: string) => {
  try {
    const res = await directusClientWithRest.request(
      readItems("contact_lists_subscribers", {
        filter: {
          list: {
            _eq: slug,
          },
        },
        fields: ["*", "subscriber.*"], // thường là subscriber chứ không phải subscribers
        limit: -1, // -1 để lấy tất cả records, không giới hạn
      })
    );

    return res;
  } catch (error) {
    console.error("Error fetching contact list with subscribers:", error);
    throw error;
  }
};
