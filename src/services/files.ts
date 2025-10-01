import { axiosInstance } from "./instance"

export const uploadImage = async (formData: FormData) => {
  const response = await axiosInstance.post('files', formData);
  return response;
};