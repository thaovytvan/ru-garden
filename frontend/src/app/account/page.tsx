"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Phone, MapPin, Save, Package } from "lucide-react";
import { Button } from "@radix-ui/themes";
import { useAuth } from "@/context/AuthContext";
import { updateProfile, getMyOrders } from "@/lib/api";
import { Order } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Badge, Separator } from "@radix-ui/themes";

const statusConfig = {
  PENDING: { label: "Chờ xác nhận", color: "yellow" as const },
  CONFIRMED: { label: "Đã xác nhận", color: "blue" as const },
  PROCESSING: { label: "Đang xử lý", color: "indigo" as const },
  SHIPPED: { label: "Đang giao", color: "orange" as const },
  DELIVERED: { label: "Đã giao", color: "grass" as const },
  CANCELLED: { label: "Đã hủy", color: "red" as const },
};

export default function AccountPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, updateUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    } else if (user) {
      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
      });
      fetchOrders();
    }
  }, [isAuthenticated, isLoading, user, router]);

  const fetchOrders = async () => {
    try {
      const res = await getMyOrders();
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch orders", err);
    } finally {
      setIsOrdersLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });
    setIsSaving(true);

    try {
      const updatedUser = await updateProfile({
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
      });
      updateUser(updatedUser);
      setMessage({ type: "success", text: "Cập nhật thông tin thành công!" });
    } catch (error: any) {
      setMessage({ 
        type: "error", 
        text: error.response?.data?.error || "Đã có lỗi xảy ra khi cập nhật." 
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !isAuthenticated || !user) {
    return <div className="min-h-screen py-24 text-center">Đang tải...</div>;
  }

  return (
    <div className="min-h-screen py-24 px-4 sm:px-6 lg:px-8 bg-muted/20">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Tài khoản của tôi
          </h1>
          <p className="mt-2 text-gray-500">
            Quản lý thông tin cá nhân và lịch sử đổi hàng
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Thông tin */}
          <div className="lg:col-span-2">
            <div className="bg-white shadow-sm rounded-2xl p-6 border border-gray-100">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <User className="text-primary w-5 h-5" /> Thông tin cá nhân
              </h2>

              {message.text && (
                <div className={`mb-6 p-4 rounded-lg text-sm border ${
                  message.type === 'success' 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : 'bg-red-50 text-red-600 border-red-100'
                }`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4 text-foreground">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Họ và tên *</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        name="name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email <span className="text-xs text-gray-400 font-normal">(Không thể thay đổi)</span></label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Số điện thoại</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-white/10 rounded-lg bg-gray-50 dark:bg-white/5 focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Địa chỉ giao hàng mặc định</label>
                  <div className="relative">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <MapPin className="h-4 w-4 text-gray-400" />
                    </div>
                    <textarea
                      name="address"
                      rows={3}
                      value={formData.address}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 focus:ring-2 focus:ring-primary focus:border-transparent outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSaving}
                    variant="solid"
                    color="grass"
                    className="cursor-pointer"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Cột phải: Đơn hàng, vv... */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold flex items-center gap-2">
                  <Package className="w-5 h-5 text-primary" /> Lịch sử đơn hàng
                </h3>
              </div>
              
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {isOrdersLoading ? (
                  <div className="text-center py-4 text-gray-500 text-sm">Đang tải đơn hàng...</div>
                ) : orders.length === 0 ? (
                  <>
                    <p className="text-sm text-gray-600 mb-4">
                      Bạn chưa có đơn hàng nào gần đây.
                    </p>
                    <Button variant="soft" color="grass" className="w-full cursor-pointer" onClick={() => router.push('/products')}>
                      Khám phá sản phẩm
                    </Button>
                  </>
                ) : (
                  orders.map((order) => (
                    <div key={order.id} className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">#{order.id.slice(-8)}</p>
                          <p className="text-xs text-gray-500" suppressHydrationWarning>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <Badge color={statusConfig[order.status as keyof typeof statusConfig]?.color || 'gray'} size="1">
                          {statusConfig[order.status as keyof typeof statusConfig]?.label || order.status}
                        </Badge>
                      </div>
                      
                      <Separator size="4" className="opacity-5" />
                      
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-bold text-primary">{formatCurrency(order.totalAmount)}</p>
                        <p className="text-[10px] text-gray-500">{order.items.length} sản phẩm</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
