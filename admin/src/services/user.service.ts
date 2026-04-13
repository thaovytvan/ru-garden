import { apiClient } from "../api/client";

export const getUsers = async (params?: Record<string, unknown>) => {
  const { data } = await apiClient.get("/admin/users", { params });
  return data;
};

export const toggleUserStatus = async (id: string) => {
  const { data } = await apiClient.put(`/admin/users/${id}/status`);
  return data;
};

export const updateUserRole = async ({ id, role }: { id: string; role: string }) => {
  const { data } = await apiClient.put(`/admin/users/${id}/role`, { role });
  return data;
};

export const deleteUser = async (id: string) => {
  const { data } = await apiClient.delete(`/admin/users/${id}`);
  return data;
};
