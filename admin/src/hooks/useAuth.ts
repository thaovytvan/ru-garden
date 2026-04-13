import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMe, updateProfile, updatePassword, login } from "../services/auth.service";

export const useLoginAdmin = () => {
  return useMutation({
    mutationFn: login,
  });
};

export const useAdminProfile = () => {
  return useQuery({
    queryKey: ["admin_profile"],
    queryFn: getMe,
    retry: false, // don't retry if token is invalid
  });
};

export const useUpdateAdminProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_profile"] });
    },
  });
};

export const useUpdateAdminPassword = () => {
  return useMutation({
    mutationFn: updatePassword,
  });
};
