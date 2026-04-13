import { apiClient } from "../api/client";

export const getOrders = async (params: { page: number; limit: number; status?: string; sortBy?: string; sortOrder?: string }) => {
  const { data } = await apiClient.get("/admin/orders", { params });
  return data;
};

export const updateOrderStatus = async ({ id, status }: { id: string; status: string }) => {
  const { data } = await apiClient.put(`/admin/orders/${id}/status`, { status });
  return data;
};

export const adminCreateOrder = async (orderData: {
  customerName?: string;
  phone?: string;
  email?: string;
  address?: string;
  note?: string;
  discountCode?: string;
  discountAmount?: number;
  items: { productId: string; quantity: number }[];
}) => {
  const { data } = await apiClient.post("/admin/orders", orderData);
  return data;
};
