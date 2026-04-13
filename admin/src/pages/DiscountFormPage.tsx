import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { ArrowLeft, Save } from "lucide-react";
import {
  useCreateDiscount,
  useDiscount,
  useUpdateDiscount
} from "../hooks/useDiscounts";

export default function DiscountFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: discount, isLoading: loadingDiscount } = useDiscount(id || "");
  const createDiscountMutation = useCreateDiscount();
  const updateDiscountMutation = useUpdateDiscount();

  const [formData, setFormData] = useState({
    code: "",
    type: "PERCENTAGE",
    value: "",
    minOrderAmount: "0",
    maxDiscountAmount: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    usageLimit: "",
    isActive: true
  });

  useEffect(() => {
    if (discount) {
      setFormData({
        code: discount.code,
        type: discount.type,
        value: discount.value.toString(),
        minOrderAmount: discount.minOrderAmount?.toString() || "0",
        maxDiscountAmount: discount.maxDiscountAmount?.toString() || "",
        startDate: discount.startDate
          ? new Date(discount.startDate).toISOString().split("T")[0]
          : "",
        endDate: discount.endDate
          ? new Date(discount.endDate).toISOString().split("T")[0]
          : "",
        usageLimit: discount.usageLimit?.toString() || "",
        isActive: discount.isActive
      });
    }
  }, [discount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.code || !formData.value) {
      toast.error("Vui lòng nhập mã code và giá trị giảm giá.");
      return;
    }

    const payload = {
      ...formData,
      value: Number(formData.value),
      minOrderAmount: Number(formData.minOrderAmount) || 0,
      maxDiscountAmount: formData.maxDiscountAmount
        ? Number(formData.maxDiscountAmount)
        : null,
      usageLimit: formData.usageLimit ? Number(formData.usageLimit) : null,
      startDate: new Date(formData.startDate).toISOString(),
      endDate: formData.endDate
        ? new Date(formData.endDate).toISOString()
        : null
    };

    if (isEdit) {
      updateDiscountMutation.mutate(
        { id: id!, data: payload },
        {
          onSuccess: () => {
            toast.success("Cập nhật mã giảm giá thành công!");
            navigate("/discounts");
          },
          onError: (err: any) => {
            toast.error(err.response?.data?.error || "Có lỗi xảy ra");
          }
        }
      );
    } else {
      createDiscountMutation.mutate(payload, {
        onSuccess: () => {
          toast.success("Tạo mã giảm giá thành công!");
          navigate("/discounts");
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.error || "Có lỗi xảy ra");
        }
      });
    }
  };

  if (isEdit && loadingDiscount) {
    return <div className="text-center py-12">Đang tải dữ liệu...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate("/discounts")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <ArrowLeft size={20} />
          <span>Quay lại</span>
        </button>
        <h2 className="text-2xl font-bold text-gray-900">
          {isEdit ? "Chỉnh sửa mã giảm giá" : "Thêm mã giảm giá mới"}
        </h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-sm p-8 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Mã Code (Ví dụ: GIAM10)
            </label>
            <input
              type="text"
              value={formData.code}
              onChange={(e) =>
                setFormData({ ...formData, code: e.target.value.toUpperCase() })
              }
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none uppercase"
              placeholder="Nhập mã code..."
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Loại giảm giá
            </label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="PERCENTAGE">Phần trăm (%)</option>
              <option value="FIXED">Cố định (VNĐ)</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Giá trị giảm {formData.type === "PERCENTAGE" ? "(%)" : "(VNĐ)"}
            </label>
            <input
              type="number"
              value={formData.value}
              onChange={(e) =>
                setFormData({ ...formData, value: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="0"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Đơn hàng tối thiểu (VNĐ)
            </label>
            <input
              type="number"
              value={formData.minOrderAmount}
              onChange={(e) =>
                setFormData({ ...formData, minOrderAmount: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="0"
            />
          </div>

          {formData.type === "PERCENTAGE" && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">
                Giảm tối đa (Chỉ cho %)
              </label>
              <input
                type="number"
                value={formData.maxDiscountAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxDiscountAmount: e.target.value
                  })
                }
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                placeholder="Không giới hạn"
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Giới hạn số lượt dùng
            </label>
            <input
              type="number"
              value={formData.usageLimit}
              onChange={(e) =>
                setFormData({ ...formData, usageLimit: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Không giới hạn"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Ngày bắt đầu
            </label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) =>
                setFormData({ ...formData, startDate: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">
              Ngày kết thúc
            </label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) =>
                setFormData({ ...formData, endDate: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
              placeholder="Mãi mãi"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) =>
              setFormData({ ...formData, isActive: e.target.checked })
            }
            className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
          />
          <label
            htmlFor="isActive"
            className="text-sm font-semibold text-gray-700"
          >
            Kích hoạt mã giảm giá này
          </label>
        </div>

        <div className="flex justify-end pt-6 border-t">
          <button
            type="submit"
            disabled={
              createDiscountMutation.isPending ||
              updateDiscountMutation.isPending
            }
            className="flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg hover:bg-green-700 transition-colors font-bold cursor-pointer transition-all disabled:opacity-50"
          >
            <Save size={20} />
            {isEdit ? "Cập nhật" : "Tạo mới"}
          </button>
        </div>
      </form>
    </div>
  );
}
