import { createItem, deleteItem, readItem, readItems, updateItem } from "@directus/sdk"
import { directusClientWithRest } from "./directus"
import { Template } from "../types"

export const getAllTemplates = async () => {
  try {
    const res = await directusClientWithRest.request(readItems('templates', {
      fields: ["*"],
      sort: "name"
    }))
    return res
  } catch (error) {
  }
}

export const getTemplateById = async (id: string | number) => {
  try {
    const res = await directusClientWithRest.request(readItem('templates', id))
    return res
  } catch (error) {
  }
}

export const createTemplate = async (payload: Template) => {
  try {
    const res = await directusClientWithRest.request(createItem('templates', payload))
    return res
  } catch (error) {
  }
}

export const updateTemplate = async (id: string | number, payload: Template) => {
  try {
    const res = await directusClientWithRest.request(updateItem('templates', id, payload))
    return res
  } catch (error) {
  }
}

export const deleteTemplate = async (id: string | number) => {
  try {
    const res = await directusClientWithRest.request(deleteItem('templates', id))
    return res
  } catch (error) {
  }
}