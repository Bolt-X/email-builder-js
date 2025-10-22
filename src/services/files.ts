import { uploadFiles } from "@directus/sdk";
import { directusClientWithRest } from "./directus";
import axios from "axios";

export const uploadImage = async (formData: FormData) => {
  const response = await directusClientWithRest.request(uploadFiles(formData));
  return response;
};

export const uploadImageWithProgress = async (file: File, onProgress: (p: number) => void) => {
  const formData = new FormData();
  formData.append("file", file);

  // const token = "ACCESS_TOKEN";
  const baseURL = import.meta.env.VITE_API_URL;

  const res = await axios.post(`${baseURL}/files`, formData, {
    headers: {
      // Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (event) => {
      if (event.total) {
        const percent = Math.round((event.loaded * 100) / event.total);
        onProgress?.(percent); // Gọi callback để cập nhật % tiến trình
      }
    },
  });

  return res.data.data;
}
