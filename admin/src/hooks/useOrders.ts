import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getOrders, updateOrderStatus, adminCreateOrder } from "../services/order.service";

export const useOrders = (params: { page: number; limit: number; status?: string; sortBy?: string; sortOrder?: string }) => {
  return useQuery({
    queryKey: ["orders", params],
    queryFn: () => getOrders(params),
  });
};

export const useUpdateOrderStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};

export const useAdminCreateOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: adminCreateOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
};
