import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit, Trash2, Search, ArrowUpDown, ChevronUp, ChevronDown } from "lucide-react";
import { toast } from "react-hot-toast";
import { useProducts, useDeleteProduct } from "../hooks/useProducts";
import { getImageUrl } from "../lib/image-utils";
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

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    productId: ""
  });

  const { data: responseData, isLoading: loading } = useProducts({ 
    sortBy: sortField, 
    sortOrder 
  });
  const products = responseData?.data || [];
  const deleteProductMutation = useDeleteProduct();

  const filteredProducts = products.filter(
    (product: { name: string; slug: string }) =>
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.slug.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: string) => {
    setConfirmModal({
      isOpen: true,
      productId: id
    });
  };

  const confirmDelete = () => {
    if (!confirmModal.productId) return;
    
    deleteProductMutation.mutate(confirmModal.productId, {
      onSuccess: () => {
        toast.success("Xóa sản phẩm thành công!");
      },
      onError: () => {
        toast.error("Có lỗi xảy ra khi xóa sản phẩm");
      }
    });
  };

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
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
            placeholder="Tìm kiếm theo Tên..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Link
            to="/products/new"
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors shrink-0 text-sm font-medium cursor-pointer"
          >
            <Plus size={18} />
            <span>Thêm mới</span>
          </Link>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-600 text-sm border-b uppercase tracking-wider">
              <tr>
                <th 
                  className="px-6 py-4 font-semibold cursor-pointer group"
                  onClick={() => toggleSort("name")}
                >
                  <div className="flex items-center">
                    Sản phẩm <SortIcon field="name" sortField={sortField} sortOrder={sortOrder} />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 font-semibold cursor-pointer group"
                  onClick={() => toggleSort("category")}
                >
                  <div className="flex items-center">
                    Danh mục <SortIcon field="category" sortField={sortField} sortOrder={sortOrder} />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 font-semibold cursor-pointer group"
                  onClick={() => toggleSort("price")}
                >
                  <div className="flex items-center">
                    Giá <SortIcon field="price" sortField={sortField} sortOrder={sortOrder} />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 font-semibold cursor-pointer group"
                  onClick={() => toggleSort("stock")}
                >
                  <div className="flex items-center">
                    Tồn kho <SortIcon field="stock" sortField={sortField} sortOrder={sortOrder} />
                  </div>
                </th>
                <th 
                  className="px-6 py-4 font-semibold cursor-pointer group"
                  onClick={() => toggleSort("isActive")}
                >
                  <div className="flex items-center">
                    Trạng thái <SortIcon field="isActive" sortField={sortField} sortOrder={sortOrder} />
                  </div>
                </th>
                <th className="px-6 py-4 font-semibold text-right">Thao tác</th>
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
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    Không tìm thấy sản phẩm nào.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(
                  (
                    product: Record<string, unknown> & {
                      id: string;
                      name: string;
                      images: string[];
                      category: { name: string };
                      slug: string;
                      price: number;
                      stock: number;
                      isActive: boolean;
                    }
                  ) => (
                    <tr
                      key={product.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={getImageUrl(product.images?.[0])}
                            alt={product.name}
                            className="w-10 h-10 rounded-md object-cover"
                          />
                          <div>
                            <div className="font-medium text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              /{product.slug}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {product.category?.name || "—"}
                      </td>
                      <td className="px-6 py-4 text-gray-900 font-medium">
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND"
                        }).format(product.price)}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {product.stock}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            !product.isActive
                               ? "bg-red-100 text-red-700"
                               : product.stock <= 0
                               ? "bg-yellow-100 text-yellow-700"
                               : "bg-green-100 text-green-700"
                          }`}
                        >
                          {!product.isActive ? "Ngừng bán" : product.stock <= 0 ? "Hết hàng" : "Đang bán"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            to={`/products/edit/${product.id}`}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer inline-flex"
                            title="Sửa sản phẩm"
                          >
                            <Edit size={18} />
                          </Link>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer inline-flex"
                            title="Xóa sản phẩm"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )
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
        message="Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác."
        type="danger"
        confirmLabel="Xóa sản phẩm"
      />
    </div>
  );
}
