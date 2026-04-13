import {
  Filter,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldAlert,
  ShieldCheck,
  Trash2
} from "lucide-react";
import { useState } from "react";
import {
  useDeleteUser,
  useToggleUserStatus,
  useUpdateUserRole,
  useUsers
} from "../hooks/useUsers";
import { toast } from "react-hot-toast";
import ConfirmModal from "../components/ConfirmModal";

interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: "USER" | "STAFF" | "ADMIN";
  isActive: boolean;
  createdAt: string;
  _count: {
    orders: number;
  };
}

export default function UsersPage() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    type: "warning" as "danger" | "warning" | "info"
  });
  const limit = 10;

  const { data: response, isLoading: loading } = useUsers({
    search,
    role: roleFilter,
    page,
    limit
  });
  const users: User[] = response?.data || [];
  const total = response?.total || 0;

  const toggleStatusMutation = useToggleUserStatus();
  const updateRoleMutation = useUpdateUserRole();
  const deleteMutation = useDeleteUser();

  const handleToggleStatus = (user: User) => {
    setConfirmModal({
      isOpen: true,
      title: "Cập nhật trạng thái",
      message: `Bạn có chắc chắn muốn ${user.isActive ? "khóa" : "mở khóa"} tài khoản này?`,
      type: "warning",
      onConfirm: () => {
        toggleStatusMutation.mutate(user.id, {
          onSuccess: () =>
            toast.success(`Đã ${user.isActive ? "khóa" : "mở khóa"} tài khoản`),
          onError: () => toast.error("Có lỗi xảy ra khi cập nhật trạng thái")
        });
      }
    });
  };

  const handleRoleChange = (userId: string, newRole: string) => {
    setConfirmModal({
      isOpen: true,
      title: "Cập nhật vai trò",
      message: `Bạn có chắc chắn muốn chuyển người này thành ${newRole}?`,
      type: "warning",
      onConfirm: () => {
        updateRoleMutation.mutate(
          { id: userId, role: newRole },
          {
            onSuccess: () => toast.success("Đã cập nhật phân quyền"),
            onError: () => toast.error("Có lỗi xảy ra khi cập nhật phân quyền")
          }
        );
      }
    });
  };

  const handleDelete = (user: User) => {
    setConfirmModal({
      isOpen: true,
      title: "Xác nhận xóa",
      message: "Bạn có chắc chắn muốn xóa user này không? Hành động này không thể hoàn tác nếu user chưa có đơn hàng.",
      type: "danger",
      onConfirm: () => {
        deleteMutation.mutate(user.id, {
          onSuccess: () => toast.success("Đã xóa người dùng thành công"),
          onError: () => toast.error("Có lỗi xảy ra khi xóa người dùng")
        });
      }
    });
  };

  const totalPages = Math.ceil(total / limit);

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
            placeholder="Tìm kiếm theo Tên hoặc Email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={20} className="text-gray-500" />
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 outline-none focus:ring-2 focus:ring-green-500 w-full md:w-auto cursor-pointer"
          >
            <option value="ALL">Tất cả Roles</option>
            <option value="USER">User thường</option>
            <option value="STAFF">Nhân viên (Staff)</option>
            <option value="ADMIN">Quản trị viên (Admin)</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm border-b">
              <tr>
                <th className="px-6 py-4 font-medium">Người dùng</th>
                <th className="px-6 py-4 font-medium">Liên hệ</th>
                <th className="px-6 py-4 font-medium">Vai trò</th>
                <th className="px-6 py-4 font-medium">Đơn hàng</th>
                <th className="px-6 py-4 font-medium">Trạng thái</th>
                <th className="px-6 py-4 font-medium text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Không tìm thấy người dùng nào.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                        <Mail size={12} /> {user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1 mb-1">
                        <Phone size={14} className="text-gray-400" />
                        {user.phone || (
                          <span className="italic text-gray-300">
                            Chưa cập nhật
                          </span>
                        )}
                      </div>
                      <div className="flex items-start gap-1 max-w-[200px] truncate">
                        <MapPin
                          size={14}
                          className="text-gray-400 shrink-0 mt-0.5"
                        />
                        <span className="truncate" title={user.address || ""}>
                          {user.address || (
                            <span className="italic text-gray-300">
                              Chưa cập nhật
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(user.id, e.target.value)
                        }
                        className={`text-sm font-medium px-2 py-1 rounded border outline-none cursor-pointer ${
                          user.role === "ADMIN"
                            ? "bg-purple-50 text-purple-700 border-purple-200"
                            : user.role === "STAFF"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                        }`}
                      >
                        <option value="USER">User</option>
                        <option value="STAFF">Staff</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center bg-gray-100 text-gray-700 font-medium px-2.5 py-0.5 rounded-full text-xs">
                        {user._count.orders} đơn
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(user)}
                        title="Nhấn để đổi trạng thái"
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                          user.isActive
                            ? "bg-green-100 text-green-700 hover:bg-green-200"
                            : "bg-red-100 text-red-700 hover:bg-red-200"
                        }`}
                      >
                        {user.isActive ? (
                          <ShieldCheck size={14} />
                        ) : (
                          <ShieldAlert size={14} />
                        )}
                        {user.isActive ? "Hoạt động" : "Bị khóa"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                          title="Xóa người dùng"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Info */}
        {!loading && totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Hiển thị{" "}
              <span className="font-medium">{(page - 1) * limit + 1}</span> đến{" "}
              <span className="font-medium">
                {Math.min(page * limit, total)}
              </span>{" "}
              trong số <span className="font-medium">{total}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1 text-sm border rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
              >
                Trước
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1 text-sm border rounded text-gray-600 hover:bg-gray-50 disabled:opacity-50 cursor-pointer"
              >
                Tiếp
              </button>
            </div>
          </div>
        )}
      </div>
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        type={confirmModal.type}
      />
    </div>
  );
}
