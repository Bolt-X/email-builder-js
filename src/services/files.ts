import { uploadFiles } from "@directus/sdk";
import { directusClientWithRest } from "./directus";

export const uploadImage = async (formData: FormData) => {
  const response = await directusClientWithRest.request(uploadFiles(formData));
  return response;
};