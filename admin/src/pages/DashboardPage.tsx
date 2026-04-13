import {
  Package,
  ShoppingCart,
  DollarSign,
  Users,
  TrendingUp
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import { useDashboardStats } from "../hooks/useDashboard";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface DashboardStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalUsers: number;
  revenue: number;
  profit: number;
  chartData: { date: string; revenue: number }[];
  pieChartData: { name: string; value: number }[];
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function DashboardPage() {
  const navigate = useNavigate();
  const [days, setDays] = useState<number>(30);
  const { data, isLoading: loading, error } = useDashboardStats(days);
  const stats = data as DashboardStats | undefined;

  if (
    error &&
    (error as { response?: { status?: number } }).response?.status === 403
  ) {
    return (
      <div className="text-center py-20 text-red-600">
        <h2 className="text-2xl font-bold mb-4">Truy cập bị từ chối</h2>
        <p>Bạn không có quyền truy cập trang Dashboard.</p>
      </div>
    );
  }

  if (loading) return <div className="text-center py-10">Đang tải...</div>;
  if (!stats)
    return (
      <div className="text-center py-10 text-red-500">Lỗi tải dữ liệu</div>
    );

  const statCards = [
    {
      name: "Tổng sản phẩm",
      value: stats.totalProducts,
      icon: Package,
      color: "text-blue-600",
      bg: "bg-blue-100",
      path: "/products"
    },
    {
      name: "Tổng đơn hàng",
      value: stats.totalOrders,
      icon: ShoppingCart,
      color: "text-green-600",
      bg: "bg-green-100",
      path: "/orders"
    },
    {
      name: "Đơn chờ xử lý",
      value: stats.pendingOrders,
      icon: ShoppingCart,
      color: "text-orange-600",
      bg: "bg-orange-100",
      path: "/orders"
    },
    {
      name: "Doanh thu",
      value: new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
      }).format(stats.revenue || 0),
      icon: DollarSign,
      color: "text-green-600",
      bg: "bg-green-100",
      path: "/orders"
    },
    {
      name: "Lợi nhuận",
      value: new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND"
      }).format(stats.profit || 0),
      icon: TrendingUp,
      color: "text-blue-600",
      bg: "bg-blue-100",
      path: "/orders"
    },
    {
      name: "Người dùng",
      value: stats.totalUsers || "0",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-100",
      path: "/users"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm">
        <h2 className="text-lg font-bold text-gray-800">Cái nhìn tổng quan</h2>
        <select
          value={days}
          onChange={(e) => setDays(Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-green-500 focus:border-green-500 cursor-pointer"
        >
          <option value={1}>Hôm nay (24h)</option>
          <option value={14}>14 Ngày gần nhất</option>
          <option value={30}>30 Ngày gần nhất</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            onClick={() => navigate(stat.path)}
            className="bg-white rounded-xl shadow-sm p-6 flex items-center cursor-pointer hover:shadow-md transition-shadow"
          >
            <div className={`p-4 rounded-lg ${stat.bg} ${stat.color} mr-4`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={24} className="text-green-600" />
            <h3 className="text-lg font-bold text-gray-800">
              Biểu đồ doanh thu
            </h3>
          </div>

          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={stats.chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#eee"
                />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#888", fontSize: 12 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#888", fontSize: 12 }}
                  tickFormatter={(value) =>
                    new Intl.NumberFormat("vi-VN").format(value)
                  }
                />
                <RechartsTooltip
                  formatter={(value) => [
                    new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND"
                    }).format(Number(value) || 0),
                    "Doanh thu"
                  ]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)"
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#16a34a"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-6">
            <Package size={24} className="text-blue-600" />
            <h3 className="text-lg font-bold text-gray-800">
              Cơ cấu Doanh thu (Danh mục)
            </h3>
          </div>

          <div className="h-80 w-full flex items-center justify-center">
            {stats.pieChartData && stats.pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.pieChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {(stats?.pieChartData || []).map(
                      (_entry: any, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      )
                    )}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value) => [
                      new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND"
                      }).format(Number(value) || 0),
                      "Doanh thu"
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-400">Không có dữ liệu đơn hàng</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
