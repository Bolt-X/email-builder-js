import {
  createItem,
  deleteItem,
  readItem,
  readItems,
  updateItem,
} from "@directus/sdk";
import { directusClientWithRest } from "./directus";
import { Campaign } from "../modules/campaigns";

export const getAllCampaigns = async () => {
  try {
    const res = await directusClientWithRest.request(
      readItems("campaigns", {
        fields: ["*"],
        sort: "-date_created",
      })
    );
    return res ?? [];
  } catch (error) {
    console.error("Failed to fetch campaigns:", error);
    return [];
  }
};

export const getCampaignById = async (id: string | number) => {
  try {
    const res = await directusClientWithRest.request(readItem("campaigns", id));
    return res ?? null;
  } catch (error) {
    console.error("Failed to fetch campaign:", error);
    return null;
  }
};

export const createCampaign = async (payload: Campaign) => {
  try {
    const res = await directusClientWithRest.request(
      createItem("campaigns", payload)
    );
    return res ?? null;
  } catch (error) {
    console.error("Failed to create campaign:", error);
    throw error;
  }
};

export const updateCampaign = async (
  id: string,
  payload: Campaign
) => {
  try {
    const res = await directusClientWithRest.request(
      updateItem("campaigns", id, payload)
    );
    return res ?? null;
  } catch (error) {
    console.error("Failed to update campaign:", error);
    throw error;
  }
};

export const deleteCampaign = async (id: string | number) => {
  try {
    const res = await directusClientWithRest.request(
      deleteItem("campaigns", id)
    );
    return res ?? null;
  } catch (error) {
    console.error("Failed to delete campaign:", error);
    throw error;
  }
};
