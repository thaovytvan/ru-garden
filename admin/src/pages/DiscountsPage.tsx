import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, Search, Ticket } from "lucide-react";
import { toast } from "react-hot-toast";
import { useDiscounts, useDeleteDiscount } from "../hooks/useDiscounts";
import ConfirmModal from "../components/ConfirmModal";

export default function DiscountsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: responseData, isLoading: loading } = useDiscounts();
  const discounts = responseData?.data || [];
  const deleteDiscountMutation = useDeleteDiscount();

  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    discountId: ""
  });

  const filteredDiscounts = discounts.filter(
    (discount: { code: string }) =>
      discount.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      discountId: id
    });
  };

  const confirmDelete = () => {
    if (!confirmModal.discountId) return;

    deleteDiscountMutation.mutate(confirmModal.discountId, {
      onSuccess: () => {
        toast.success("Xóa mã giảm giá thành công!");
      },
      onError: () => {
        toast.error("Có lỗi xảy ra khi xóa mã giảm giá");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Tìm kiếm mã code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Link
            to="/discounts/new"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shrink-0 text-sm font-medium cursor-pointer"
          >
            <Plus size={18} />
            <span>Tạo mã mới</span>
          </Link>
        </div>
      </div>

      {/* Discounts Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Mã Code</th>
                <th className="px-6 py-4 font-medium">Loại</th>
                <th className="px-6 py-4 font-medium">Giá trị</th>
                <th className="px-6 py-4 font-medium">Lượt dùng</th>
                <th className="px-6 py-4 font-medium">Hết hạn</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filteredDiscounts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Không tìm thấy mã giảm giá nào.
                  </td>
                </tr>
              ) : (
                filteredDiscounts.map((discount: any) => (
                  <tr key={discount.id} className="hover:bg-gray-50 transition-colors text-sm">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Ticket size={16} className="text-green-600" />
                        <span className="font-bold text-gray-900 uppercase">{discount.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {discount.type === "PERCENTAGE" ? "Phần trăm (%)" : "Cố định (VNĐ)"}
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {discount.type === "PERCENTAGE" 
                        ? `${discount.value}%`
                        : new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(discount.value)
                      }
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {discount.usedCount} / {discount.usageLimit || "∞"}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {discount.endDate ? new Date(discount.endDate).toLocaleDateString("vi-VN") : "Không thời hạn"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        discount.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                      }`}>
                        {discount.isActive ? "Hoạt động" : "Tạm ngưng"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/discounts/edit/${discount.id}`}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer inline-flex"
                        >
                          <Edit size={16} />
                        </Link>
                        <button
                          onClick={() => handleDelete(discount.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer inline-flex"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmDelete}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa mã giảm giá này? Hành động này không thể hoàn tác."
        type="danger"
        confirmLabel="Xóa mã"
      />
    </div>
  );
}
