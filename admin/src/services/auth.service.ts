import { apiClient } from "../api/client";

export const login = async (credentials: Record<string, string>) => {
  const { data } = await apiClient.post("/admin/login", credentials);
  return data;
};

export const getMe = async () => {
  const { data } = await apiClient.get("/admin/me");
  return data;
};

export const updateProfile = async (profileData: Record<string, string>) => {
  const { data } = await apiClient.put("/admin/me", profileData);
  return data;
};

export const updatePassword = async (passwordData: Record<string, string>) => {
  const { data } = await apiClient.put("/admin/me/password", passwordData);
  return data;
};
