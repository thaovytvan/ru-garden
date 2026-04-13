import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../services/dashboard.service";

export const useDashboardStats = (days: number = 14) => {
  return useQuery({
    queryKey: ["dashboard", days],
    queryFn: () => getDashboardStats(days),
  });
};
