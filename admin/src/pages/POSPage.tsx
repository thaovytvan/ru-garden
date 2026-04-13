import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  User,
  Phone,
  FileText
} from "lucide-react";
import { useProducts } from "../hooks/useProducts";
import { useAdminCreateOrder } from "../hooks/useOrders";
import { useAvailableDiscounts } from "../hooks/useDiscounts";
import { toast } from "react-hot-toast";
import { validateDiscount } from "../services/discount.service";

interface Product {
  id: string;
  name: string;
  price: number;
  salePrice?: number | null;
  images: string[];
  stock: number;
  isActive: boolean;
  category: { name: string };
}

interface CartItem {
  product: Product;
  quantity: number;
}

export default function POSPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);

  const [customerInfo, setCustomerInfo] = useState({
    customerName: "",
    phone: "",
    address: "",
    note: "",
    discountCode: "",
    discountAmount: 0,
    discountType: "FIXED" as "FIXED" | "PERCENT"
  });

  const [appliedDiscount, setAppliedDiscount] = useState<{
    reduction: number;
    code: string;
    type: string;
    value: number;
  } | null>(null);

  const { data: availableDiscountsResponse } = useAvailableDiscounts();
  const availableDiscounts = useMemo(
    () => availableDiscountsResponse?.data || [],
    [availableDiscountsResponse]
  );

  const { data: responseData, isLoading: loadingProducts } = useProducts();
  const products = responseData?.data || [];

  const createOrderMutation = useAdminCreateOrder();

  const filteredProducts = products.filter(
    (product: Product) =>
      product.isActive &&
      (product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()))
  );

  const handleAddToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error("Sản phẩm đã hết hàng!");
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error(`Chỉ còn ${product.stock} sản phẩm trong kho!`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          if (newQty > item.product.stock) {
            toast.error(`Chỉ còn ${item.product.stock} sản phẩm trong kho!`);
            return item;
          }
          if (newQty < 1) return item;
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = item.product.salePrice ?? item.product.price;
      return sum + price * item.quantity;
    }, 0);
  }, [cart]);

  const calculatedDiscountAmount = useMemo(() => {
    if (appliedDiscount) {
      return appliedDiscount.reduction;
    }
    if (customerInfo.discountType === "PERCENT") {
      return (subtotal * (Number(customerInfo.discountAmount) || 0)) / 100;
    }
    return Number(customerInfo.discountAmount) || 0;
  }, [
    subtotal,
    customerInfo.discountAmount,
    customerInfo.discountType,
    appliedDiscount
  ]);

  const finalTotal = useMemo(() => {
    return Math.max(0, subtotal - calculatedDiscountAmount);
  }, [subtotal, calculatedDiscountAmount]);

  // Re-validate discount when subtotal changes
  useEffect(() => {
    const revalidate = async () => {
      if (!customerInfo.discountCode) return;

      try {
        const result = await validateDiscount(
          customerInfo.discountCode,
          subtotal
        );
        if (result.valid) {
          setAppliedDiscount({
            reduction: result.reduction,
            code: result.code,
            type: result.type,
            value: result.value
          });
        }
      } catch {
        // If it was applied but now failing, remove it
        if (appliedDiscount) {
          setAppliedDiscount(null);
          toast.error(
            `Mã ${customerInfo.discountCode} không còn hiệu lực do thay đổi đơn hàng.`
          );
        }
      }
    };

    revalidate();
  }, [subtotal, customerInfo.discountCode, appliedDiscount]);

  // Reset discount if cart is empty
  useEffect(() => {
    if (cart.length === 0 && customerInfo.discountCode) {
      setCustomerInfo(prev => ({ ...prev, discountCode: "" }));
      setAppliedDiscount(null);
    }
  }, [cart.length, customerInfo.discountCode]);

  const selectedDiscountData = useMemo(() => {
    if (!customerInfo.discountCode) return null;
    return availableDiscounts.find(
      (d: { code: string }) => d.code === customerInfo.discountCode
    );
  }, [customerInfo.discountCode, availableDiscounts]);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Giỏ hàng trống!");
      return;
    }

    createOrderMutation.mutate(
      {
        ...customerInfo,
        discountCode: appliedDiscount
          ? appliedDiscount.code
          : customerInfo.discountCode,
        discountAmount: calculatedDiscountAmount,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity
        }))
      },
      {
        onSuccess: () => {
          toast.success("Tạo đơn hàng thành công!");
          setCart([]);
          setAppliedDiscount(null);
          setCustomerInfo({
            customerName: "",
            phone: "",
            address: "",
            note: "",
            discountCode: "",
            discountAmount: 0,
            discountType: "FIXED"
          });
        },
        onError: () => {
          toast.error("Lỗi khi tạo đơn hàng");
        }
      }
    );
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-8rem)] text-foreground">
      {/* Trái: Danh sách sản phẩm */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 shrink-0">
          <div className="relative w-full">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm sản phẩm theo tên, danh mục..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 bg-gray-50 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
        </div>

        <div className="p-4 flex-1 overflow-y-auto">
          {loadingProducts ? (
            <div className="flex justify-center items-center h-full text-gray-500">
              Đang tải sản phẩm...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-500">
              Không tìm thấy sản phẩm nào
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product: Product) => (
                <div
                  key={product.id}
                  onClick={() => handleAddToCart(product)}
                  className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${product.stock <= 0 ? "opacity-50 grayscale" : "hover:border-green-500"}`}
                >
                  <img
                    src={product.images[0] || "https://via.placeholder.com/150"}
                    alt={product.name}
                    className="w-full h-32 object-cover rounded-md mb-3"
                  />
                  <h3 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
                    {product.name}
                  </h3>
                  <div className="flex items-end justify-between mt-2">
                    <span className="font-semibold text-green-700 text-sm">
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND"
                      }).format(product.salePrice ?? product.price)}
                    </span>
                    <span className="text-xs text-gray-500">
                      Kho: {product.stock}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Phải: Giỏ hàng & Thanh toán */}
      <div className="w-full lg:w-96 flex flex-col bg-white rounded-xl shadow-sm overflow-hidden shrink-0">
        <div className="p-4 bg-green-50 border-b border-green-100 flex items-center justify-between shrink-0">
          <h2 className="font-bold text-green-800 flex items-center gap-2">
            <ShoppingCart size={20} />
            Đơn hàng ({cart.length})
          </h2>
          {cart.length > 0 && (
            <button
              onClick={() => setCart([])}
              className="text-sm text-red-600 hover:text-red-700 cursor-pointer"
            >
              Xóa tất cả
            </button>
          )}
        </div>

        {/* Danh sách giỏ hàng */}
        <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3">
              <ShoppingCart size={48} className="opacity-20" />
              <p>Chưa có sản phẩm nào</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => {
                const price = item.product.salePrice ?? item.product.price;
                return (
                  <div
                    key={item.product.id}
                    className="bg-white p-3 rounded border border-gray-100 flex gap-3 shadow-sm"
                  >
                    <img
                      src={
                        item.product.images[0] ||
                        "https://via.placeholder.com/50"
                      }
                      alt={item.product.name}
                      className="w-12 h-12 rounded object-cover"
                    />
                    <div className="flex-1 flex flex-col justify-between overflow-hidden">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-sm font-medium text-gray-800 truncate">
                          {item.product.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-red-400 hover:text-red-600 cursor-pointer shrink-0"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <div className="font-semibold text-green-700 text-sm">
                          {new Intl.NumberFormat("vi-VN", {
                            style: "currency",
                            currency: "VND"
                          }).format(price)}
                        </div>
                        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg p-0.5">
                          <button
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="p-1 hover:bg-gray-200 rounded cursor-pointer transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="text-sm font-medium w-6 text-center select-none">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="p-1 hover:bg-gray-200 rounded cursor-pointer transition-colors disabled:opacity-50"
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Thông tin khách hàng & Giảm giá & Tổng tiền */}
        <div className="p-4 border-t border-gray-100 shrink-0 bg-white">
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2">
              <User size={16} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Tên khách hàng"
                value={customerInfo.customerName}
                onChange={(e) =>
                  setCustomerInfo({
                    ...customerInfo,
                    customerName: e.target.value
                  })
                }
                className="w-full text-sm outline-none border-b border-gray-200 focus:border-green-500 py-1"
              />
            </div>

            <div className="flex items-center gap-2">
              <Phone size={14} className="text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Số điện thoại"
                value={customerInfo.phone}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, phone: e.target.value })
                }
                className="w-full text-xs outline-none border-b border-gray-200 focus:border-green-500 py-1"
              />
            </div>
            <div className="flex items-center gap-2 text-foreground/70">
              <span className="text-[10px] font-bold text-gray-400">
                CHỌN MÃ:
              </span>
              <select
                value={customerInfo.discountCode}
                disabled={cart.length === 0}
                onChange={async (e) => {
                  const code = e.target.value;
                  setCustomerInfo({ ...customerInfo, discountCode: code });
                  if (!code) {
                    setAppliedDiscount(null);
                    return;
                  }

                  try {
                    const result = await validateDiscount(code, subtotal);
                    if (result.valid) {
                      setAppliedDiscount({
                        reduction: result.reduction,
                        code: result.code,
                        type: result.type,
                        value: result.value
                      });
                    }
                  } catch {
                    setAppliedDiscount(null);
                    // We don't toast here anymore because we show the nudge below
                  }
                }}
                className="flex-1 text-xs outline-none border-b border-gray-200 focus:border-green-500 py-1 bg-transparent cursor-pointer font-bold text-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">-- Không áp dụng --</option>
                {availableDiscounts.map(
                  (discount: {
                    id: string;
                    code: string;
                    minOrderAmount: number;
                    type: string;
                    value: number;
                  }) => {
                    const isEligible =
                      subtotal >= (discount.minOrderAmount || 0);
                    return (
                      <option key={discount.id} value={discount.code}>
                        {discount.code} -{" "}
                        {discount.type === "PERCENTAGE"
                          ? `Giảm ${discount.value}%`
                          : `-${new Intl.NumberFormat("vi-VN").format(discount.value)}đ`}
                        {!isEligible ? " (Chưa đủ điều kiện)" : ""}
                      </option>
                    );
                  }
                )}
              </select>
            </div>

            {/* Voucher Nudge / Info */}
            {selectedDiscountData && (
              <div
                className={`text-[10px] px-2 py-1.5 rounded-md border flex flex-col gap-1 ${
                  appliedDiscount
                    ? "bg-green-50 border-green-100 text-green-700"
                    : "bg-red-50 border-red-100 text-red-600"
                }`}
              >
                {!appliedDiscount ? (
                  <>
                    <div className="font-bold flex justify-between">
                      <span>
                        Mã {selectedDiscountData.code} chưa đủ điều kiện:
                      </span>
                      <span>
                        Cần thêm{" "}
                        {new Intl.NumberFormat("vi-VN").format(
                          selectedDiscountData.minOrderAmount - subtotal
                        )}
                        đ
                      </span>
                    </div>
                    <div>
                      Yêu cầu đơn hàng từ{" "}
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND"
                      }).format(selectedDiscountData.minOrderAmount)}
                    </div>
                  </>
                ) : (
                  <div className="font-bold italic">
                    ✓ Đã áp dụng mã {selectedDiscountData.code}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-start gap-2">
              <FileText size={16} className="text-gray-400 shrink-0 mt-1.5" />
              <textarea
                placeholder="Ghi chú đơn hàng"
                value={customerInfo.note}
                onChange={(e) =>
                  setCustomerInfo({ ...customerInfo, note: e.target.value })
                }
                className="w-full text-xs outline-none border border-gray-200 focus:border-green-500 rounded p-2 resize-none h-12"
              />
            </div>
          </div>

          <div className="space-y-1 mb-4 border-t pt-2">
            <div className="flex justify-between text-[11px] text-gray-500">
              <span>Tạm tính:</span>
              <span>
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND"
                }).format(subtotal)}
              </span>
            </div>
            {calculatedDiscountAmount > 0 && (
              <div className="flex justify-between text-[11px] text-red-500 font-medium">
                <span>
                  {appliedDiscount
                    ? `Giảm giá (${appliedDiscount.code}):`
                    : `Giảm giá tay ${customerInfo.discountType === "PERCENT" ? `(${customerInfo.discountAmount}%)` : ""}:`}
                </span>
                <span>
                  -
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND"
                  }).format(calculatedDiscountAmount)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-end pt-1">
              <span className="font-bold text-gray-700 text-sm">
                Thanh toán:
              </span>
              <span className="text-xl font-black text-green-700">
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND"
                }).format(finalTotal)}
              </span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || createOrderMutation.isPending}
            className={`w-full py-3 rounded-lg text-white font-bold text-lg transition-colors cursor-pointer flex items-center justify-center gap-2
              ${cart.length === 0 ? "bg-gray-300" : "bg-green-600 hover:bg-green-700"}
            `}
          >
            {createOrderMutation.isPending ? "Đang xử lý..." : "Thanh Toán"}
          </button>
        </div>
      </div>
    </div>
  );
}
