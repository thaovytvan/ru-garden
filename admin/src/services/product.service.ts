import { apiClient } from "../api/client";

export const getProducts = async (params?: { sortBy?: string; sortOrder?: string }) => {
  const { data } = await apiClient.get("/admin/products", { params });
  return data;
};

export const getProductById = async (id: string) => {
  const { data } = await apiClient.get(`/admin/products/${id}`);
  return data;
};

export const createProduct = async (productData: Record<string, unknown>) => {
  const { data } = await apiClient.post("/admin/products", productData);
  return data;
};

export const updateProduct = async ({ id, data }: { id: string; data: Record<string, unknown> }) => {
  const response = await apiClient.put(`/admin/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: string) => {
  const { data } = await apiClient.delete(`/admin/products/${id}`);
  return data;
};
