import { apiClient } from "../api/client";

export const getDashboardStats = async (days: number = 14) => {
  const { data } = await apiClient.get(`/admin/dashboard?days=${days}`);
  return data.data;
};
