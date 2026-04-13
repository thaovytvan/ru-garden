import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  getDiscounts, 
  getDiscountById, 
  getAvailableDiscounts,
  createDiscount, 
  updateDiscount, 
  deleteDiscount 
} from "../services/discount.service";

export const useDiscounts = () => {
  return useQuery({
    queryKey: ["discounts"],
    queryFn: getDiscounts,
  });
};

export const useAvailableDiscounts = () => {
  return useQuery({
    queryKey: ["discounts", "available"],
    queryFn: getAvailableDiscounts,
  });
};

export const useDiscount = (id: string) => {
  return useQuery({
    queryKey: ["discounts", id],
    queryFn: () => getDiscountById(id),
    enabled: !!id,
  });
};

export const useCreateDiscount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDiscount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
    },
  });
};

export const useUpdateDiscount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDiscount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
    },
  });
};

export const useDeleteDiscount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteDiscount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["discounts"] });
    },
  });
};
