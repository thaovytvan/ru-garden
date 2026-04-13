import { Eye, Filter, Package, Search, X, Plus, Printer, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useOrders, useUpdateOrderStatus } from "../hooks/useOrders";
import { toast } from "react-hot-toast";
import { printInvoice } from "../utils/printInvoice";
import ConfirmModal from "../components/ConfirmModal";

const SortIcon = ({ 
  field, 
  sortField, 
  sortOrder 
}: { 
  field: string; 
  sortField: string; 
  sortOrder: "asc" | "desc" 
}) => {
  if (sortField !== field) return <ArrowUpDown size={14} className="ml-1 opacity-0 group-hover:opacity-50 transition-opacity" />;
  return sortOrder === "asc" ? <ChevronUp size={14} className="ml-1 text-green-600" /> : <ChevronDown size={14} className="ml-1 text-green-600" />;
};

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    images: string[];
  };
}

interface Order {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  address: string;
  note: string | null;
  totalAmount: number;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  transferContent: string | null;
  discountCode: string | null;
  discountAmount: number;
  createdAt: string;
  items: OrderItem[];
}

const statusConfig = {
  PENDING: { label: "Chờ xác nhận", color: "bg-yellow-100 text-yellow-800" },
  CONFIRMED: { label: "Đã xác nhận", color: "bg-blue-100 text-blue-800" },
  PROCESSING: { label: "Đang xử lý", color: "bg-indigo-100 text-indigo-800" },
  SHIPPED: { label: "Đang giao", color: "bg-orange-100 text-orange-800" },
  DELIVERED: { label: "Đã giao", color: "bg-green-100 text-green-800" },
  CANCELLED: { label: "Đã hủy", color: "bg-red-100 text-red-800" }
};

export default function OrdersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const limit = 15;

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    orderId: "",
    newStatus: ""
  });

  const { data: responseData, isLoading: loading } = useOrders({
    page,
    limit,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    sortBy: sortField,
    sortOrder
  });
  const orders: Order[] = responseData?.data || [];
  const total = responseData?.total || 0;

  const updateOrderStatusMutation = useUpdateOrderStatus();

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    setConfirmModal({
      isOpen: true,
      orderId,
      newStatus
    });
  };

  const confirmUpdateStatus = () => {
    const { orderId, newStatus } = confirmModal;
    if (!orderId || !newStatus) return;

    updateOrderStatusMutation.mutate(
      { id: orderId, status: newStatus },
      {
        onSuccess: () => {
          toast.success("Cập nhật trạng thái thành công!");
          if (selectedOrder?.id === orderId) {
            setSelectedOrder({
              ...selectedOrder,
              status: newStatus as Order["status"]
            });
          }
        },
        onError: () => {
          toast.error("Lỗi khi cập nhật trạng thái đơn hàng.");
        }
      }
    );
  };

  const handlePrintInvoice = () => {
    printInvoice(selectedOrder);
  };

  const filteredOrders = orders.filter((order) => {
    const q = searchQuery.toLowerCase();
    return (
      order.customerName.toLowerCase().includes(q) ||
      order.phone.includes(q) ||
      order.id.toLowerCase().includes(q)
    );
  });

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
            placeholder="Tìm theo Mã ĐH, Tên hoặc SĐT..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-shadow"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter size={20} className="text-gray-500" />
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="border border-gray-200 rounded-lg px-4 py-2 bg-gray-50 outline-none focus:ring-2 focus:ring-green-500 w-full md:w-auto cursor-pointer"
          >
            <option value="ALL">Tất cả trạng thái</option>
            {Object.keys(statusConfig).map((key) => (
              <option key={key} value={key}>
                {statusConfig[key as keyof typeof statusConfig].label}
              </option>
            ))}
          </select>

          <Link
            to="/pos"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shrink-0 text-sm font-medium cursor-pointer"
          >
            <Plus size={18} />
            <span>Tạo đơn POS</span>
          </Link>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm border-b uppercase tracking-wider">
              <tr>
                <th 
                  className="px-6 py-4 font-semibold cursor-pointer group"
                  onClick={() => toggleSort("id")}
                >
                  <div className="flex items-center">
                    Mã Đơn <SortIcon field="id" sortField={sortField} sortOrder={sortOrder} />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 font-semibold cursor-pointer group"
                  onClick={() => toggleSort("customerName")}
                >
                  <div className="flex items-center">
                    Khách hàng <SortIcon field="customerName" sortField={sortField} sortOrder={sortOrder} />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 font-semibold cursor-pointer group"
                  onClick={() => toggleSort("createdAt")}
                >
                  <div className="flex items-center">
                    Ngày đặt <SortIcon field="createdAt" sortField={sortField} sortOrder={sortOrder} />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 font-semibold cursor-pointer group"
                  onClick={() => toggleSort("totalAmount")}
                >
                  <div className="flex items-center">
                    Tổng tiền <SortIcon field="totalAmount" sortField={sortField} sortOrder={sortOrder} />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 font-semibold cursor-pointer group"
                  onClick={() => toggleSort("status")}
                >
                  <div className="flex items-center">
                    Trạng thái <SortIcon field="status" sortField={sortField} sortOrder={sortOrder} />
                  </div>
                </th>
                <th className="px-6 py-4 font-semibold text-right">Chi tiết</th>
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
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Không tìm thấy đơn hàng nào.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-xs font-semibold bg-gray-100 px-2 py-1 rounded text-gray-700 uppercase">
                        #{order.id.slice(-8)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {order.customerName}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {order.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit"
                      })}
                    </td>
                    <td className="px-6 py-4 font-medium text-green-700">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND"
                      }).format(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) =>
                          handleUpdateStatus(order.id, e.target.value)
                        }
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border outline-none cursor-pointer ${statusConfig[order.status].color} border-transparent`}
                      >
                        {Object.keys(statusConfig).map((key) => (
                          <option
                            key={key}
                            value={key}
                            className="bg-white text-gray-900"
                          >
                            {
                              statusConfig[key as keyof typeof statusConfig]
                                .label
                            }
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer inline-flex"
                        title="Xem chi tiết"
                      >
                        <Eye size={18} />
                      </button>
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
              Trang <span className="font-medium">{page}</span> /{" "}
              <span className="font-medium">{totalPages}</span>
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <Package className="text-green-600" /> Chi tiết đơn hàng{" "}
                <span className="font-mono text-gray-500 uppercase text-sm">
                  #{selectedOrder.id.slice(-8)}
                </span>
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-2 hover:bg-gray-100 rounded-full cursor-pointer transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4 text-sm">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">
                    Thông tin khách hàng
                  </h4>
                  <p>
                    <span className="text-gray-500 inline-block w-20">
                      Họ tên:
                    </span>{" "}
                    <span className="font-medium">
                      {selectedOrder.customerName}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-500 inline-block w-20">
                      SĐT:
                    </span>{" "}
                    <span className="font-medium">{selectedOrder.phone}</span>
                  </p>
                  <p>
                    <span className="text-gray-500 inline-block w-20">
                      Email:
                    </span>{" "}
                    <span>{selectedOrder.email || "Không có"}</span>
                  </p>
                  <p className="flex items-start">
                    <span className="text-gray-500 inline-block w-20 shrink-0">
                      Địa chỉ:
                    </span>{" "}
                    <span className="break-words">{selectedOrder.address}</span>
                  </p>
                  {selectedOrder.note && (
                    <p className="flex items-start">
                      <span className="text-gray-500 inline-block w-20 shrink-0">
                        Ghi chú:
                      </span>{" "}
                      <span className="bg-yellow-50 text-yellow-800 p-2 rounded w-full">
                        {selectedOrder.note}
                      </span>
                    </p>
                  )}
                </div>
                <div className="space-y-4 text-sm">
                  <h4 className="font-semibold text-gray-900 border-b pb-2">
                    Thông tin đơn hàng
                  </h4>
                  <p>
                    <span className="text-gray-500 inline-block w-24">
                      Ngày đặt:
                    </span>{" "}
                    <span>
                      {new Date(selectedOrder.createdAt).toLocaleString(
                        "vi-VN"
                      )}
                    </span>
                  </p>
                  <p className="flex items-center">
                    <span className="text-gray-500 inline-block w-24">
                      Trạng thái:
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${statusConfig[selectedOrder.status].color}`}
                    >
                      {statusConfig[selectedOrder.status].label}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-500 inline-block w-24">
                      Nội dung CK:
                    </span>{" "}
                    <span className="font-mono bg-gray-100 px-1 py-0.5 rounded">
                      {selectedOrder.transferContent || "Trống"}
                    </span>
                  </p>
                  {selectedOrder.discountCode && (
                    <p className="flex justify-between bg-green-50 border border-green-200 p-2 rounded">
                      <span className="text-green-700 font-semibold">
                        Mã Voucher áp dụng:
                      </span>
                      <span className="font-bold text-green-800 uppercase px-2 bg-white border border-green-300 rounded shadow-sm">
                        {selectedOrder.discountCode}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 border-b pb-2 mb-4">
                  Sản phẩm đã đặt
                </h4>
                <div className="space-y-4">
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 border border-gray-100 rounded-lg p-3"
                    >
                      <img
                        src={
                          item.product.images[0] ||
                          "https://via.placeholder.com/60"
                        }
                        alt={item.product.name}
                        className="w-16 h-16 rounded object-cover"
                      />
                      <div className="flex-1">
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-sm text-gray-500">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND"
                          }).format(item.price)}{" "}
                          x {item.quantity}
                        </div>
                      </div>
                      <div className="font-semibold text-green-700">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND"
                        }).format(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-between items-center">
              <div>
                <button
                  onClick={handlePrintInvoice}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium cursor-pointer"
                >
                  <Printer size={18} />
                  <span>In biên lai</span>
                </button>
              </div>
              <div className="flex items-center gap-4">
                {selectedOrder.discountAmount > 0 && (
                  <div className="flex justify-between items-center text-red-600 text-sm mb-1 px-1">
                    <span className="font-medium">Giảm giá đã áp dụng:</span>
                    <span className="font-bold">
                      -
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND"
                      }).format(selectedOrder.discountAmount)}
                    </span>
                  </div>
                )}
                <span className="font-semibold text-gray-700">
                  Tổng thanh toán:
                </span>
                <span className="text-2xl font-bold text-green-700">
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND"
                  }).format(selectedOrder.totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={confirmUpdateStatus}
        title="Cập nhật trạng thái"
        message={`Bạn có chắc chắn muốn chuyển đơn hàng này thành "${statusConfig[confirmModal.newStatus as keyof typeof statusConfig]?.label}"?`}
        type="warning"
        confirmLabel="Cập nhật"
      />
    </div>
  );
}
