import { apiClient } from "../api/client";

export const getDiscounts = async () => {
  const { data } = await apiClient.get("/discounts");
  return data;
};

export const getDiscountById = async (id: string) => {
  const { data } = await apiClient.get(`/discounts/${id}`);
  return data;
};

export const getAvailableDiscounts = async () => {
  const { data } = await apiClient.get("/discounts/available");
  return data;
};

export const createDiscount = async (discountData: any) => {
  const { data } = await apiClient.post("/discounts", discountData);
  return data;
};

export const updateDiscount = async ({ id, data: discountData }: { id: string, data: any }) => {
  const { data } = await apiClient.put(`/discounts/${id}`, discountData);
  return data;
};

export const deleteDiscount = async (id: string) => {
  const { data } = await apiClient.delete(`/discounts/${id}`);
  return data;
};

export const validateDiscount = async (code: string, amount: number) => {
  const { data } = await apiClient.post("/discounts/validate", { code, amount });
  return data;
};
