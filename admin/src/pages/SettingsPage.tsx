import { useState, useEffect } from "react";
import {
  User,
  Building,
  Settings as SettingsIcon,
  Save,
  Lock
} from "lucide-react";
import {
  useAdminProfile,
  useUpdateAdminProfile,
  useUpdateAdminPassword
} from "../hooks/useAuth";
import { apiClient } from "../api/client";
import { toast } from "react-hot-toast";

interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  branch: string;
}

export default function SettingsPage() {
  const { data: profile, isLoading: loading } = useAdminProfile();
  const [bankInfo, setBankInfo] = useState<BankInfo | null>(null);

  const updateProfileMutation = useUpdateAdminProfile();
  const updatePasswordMutation = useUpdateAdminPassword();

  const [editEmail, setEditEmail] = useState("");
  const [editFullName, setEditFullName] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    if (profile) {
      setTimeout(() => {
        setEditEmail(profile.email || "");
        setEditFullName(profile.fullName || "");
      }, 0);
    }
  }, [profile]);

  useEffect(() => {
    const fetchBankData = async () => {
      try {
        const bankRes = await apiClient.get("/bankinfo");
        if (bankRes.data.success) {
          setBankInfo(bankRes.data.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin ngân hàng", error);
      }
    };
    fetchBankData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate(
      {
        email: editEmail,
        fullName: editFullName
      },
      {
        onSuccess: () => toast.success("Cập nhật thông tin thành công!"),
        onError: (err: unknown) =>
          toast.error(
            "Có lỗi xảy ra: " +
              ((err as { response?: { data?: { message?: string } } }).response
                ?.data?.message || "")
          )
      }
    );
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");

    if (newPassword !== confirmPassword) {
      setPasswordError("Mật khẩu mới không khớp!");
      return;
    }

    updatePasswordMutation.mutate(
      {
        currentPassword,
        newPassword
      },
      {
        onSuccess: () => {
          toast.success("Đổi mật khẩu thành công!");
          setCurrentPassword("");
          setNewPassword("");
          setConfirmPassword("");
        },
        onError: (err: unknown) =>
          setPasswordError(
            (err as { response?: { data?: { message?: string } } }).response
              ?.data?.message || "Có lỗi xảy ra khi đổi mật khẩu"
          )
      }
    );
  };

  if (loading) return <div className="text-center py-10">Đang tải...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div className="flex items-center gap-3 mb-6">
        <SettingsIcon className="text-gray-500" size={28} />
        <h2 className="text-2xl font-bold text-gray-800">Cài đặt hệ thống</h2>
      </div>

      {/* Thông tin Admin */}
      <form
        onSubmit={handleUpdateProfile}
        className="bg-white rounded-xl shadow-sm p-8"
      >
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <div className="flex items-center gap-3">
            <User className="text-green-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-800">
              Thông tin cá nhân Admin
            </h3>
          </div>
          <button
            type="submit"
            disabled={updateProfileMutation.isPending}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save size={18} />
            {updateProfileMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tên đăng nhập (Username)
            </label>
            <input
              type="text"
              disabled
              value={profile?.username || ""}
              className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email liên hệ *
            </label>
            <input
              type="email"
              required
              value={editEmail}
              onChange={(e) => setEditEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Họ và tên
            </label>
            <input
              type="text"
              value={editFullName}
              onChange={(e) => setEditFullName(e.target.value)}
              placeholder="VD: Nguyễn Văn A"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
            />
          </div>
        </div>
      </form>

      {/* Đổi mật khẩu */}
      <form
        onSubmit={handleUpdatePassword}
        className="bg-white rounded-xl shadow-sm p-8"
      >
        <div className="flex items-center justify-between mb-6 border-b pb-4">
          <div className="flex items-center gap-3">
            <Lock className="text-purple-600" size={24} />
            <h3 className="text-lg font-semibold text-gray-800">
              Đổi mật khẩu
            </h3>
          </div>
          <button
            type="submit"
            disabled={
              updatePasswordMutation.isPending ||
              !currentPassword ||
              !newPassword
            }
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Save size={18} />
            {updatePasswordMutation.isPending
              ? "Đang lưu..."
              : "Cập nhật mật khẩu"}
          </button>
        </div>

        {passwordError && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
            {passwordError}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu hiện tại
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu mới
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Xác nhận mật khẩu mới
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
        </div>
      </form>

      {/* Thông tin Ngân hàng gốc */}
      <div className="bg-white rounded-xl shadow-sm p-8 opacity-80 mt-10 border-dashed border-2">
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <Building className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-800">
            Thông tin thanh toán ngân hàng (Chỉ đọc)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Tên ngân hàng
            </label>
            <div className="px-4 py-2 border border-blue-100 rounded-md bg-blue-50/30 text-gray-800 font-medium whitespace-pre-wrap">
              {bankInfo?.bankName || "---"}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">
              Số tài khoản
            </label>
            <div className="px-4 py-2 border border-blue-100 rounded-md bg-blue-50/30 text-gray-800 font-bold text-blue-700 tracking-wider">
              {bankInfo?.accountNumber || "---"}
            </div>
          </div>
          <div className="md:col-span-2 mt-2 text-sm text-gray-500 italic">
            * Thông tin thanh toán hiện tại chỉ có thể thay đổi trong cấu hình
            server (file .env backend).
          </div>
        </div>
      </div>
    </div>
  );
}
