"use client";

import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import {
  createOrder,
  validateDiscount,
  getAvailableDiscounts
} from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Flex,
  Grid,
  Heading,
  Separator,
  Spinner,
  Text,
  TextField
} from "@radix-ui/themes";
import {
  ArrowRight,
  CheckCircle,
  Copy,
  CreditCard,
  FileText,
  MapPin,
  User
} from "lucide-react";
import NextImage from "next/image";
import Link from "next/link";
import { useEffect, useState, useMemo } from "react";

export default function CheckoutPage() {
  const { user } = useAuth();
  const { items, totalPrice, totalItems, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  const [formData, setFormData] = useState({
    customerName: "",
    phone: "",
    email: "",
    address: "",
    note: "",
    discountCode: ""
  });

  const [isValidating, setIsValidating] = useState(false);
  const [appliedDiscount, setAppliedDiscount] = useState<{
    reduction: number;
    code: string;
    type: string;
    value: number;
  } | null>(null);

  const [availableVouchers, setAvailableVouchers] = useState<any[]>([]);
  const [showVouchers, setShowVouchers] = useState(false);

  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const res = await getAvailableDiscounts();
        setAvailableVouchers(res.data);
      } catch (err) {
        console.error("Failed to fetch vouchers", err);
      }
    };
    fetchVouchers();
  }, []);

  const handleApplyDiscount = async (codeOverride?: string) => {
    const codeToUse = codeOverride || formData.discountCode;
    if (!codeToUse) return;

    setIsValidating(true);
    try {
      const result = await validateDiscount(codeToUse, totalPrice);
      setAppliedDiscount(result);
      if (codeOverride) {
        setFormData((prev) => ({ ...prev, discountCode: codeOverride }));
        setShowVouchers(false);
      }
    } catch (err: any) {
      alert(err.response?.data?.error || "Mã giảm giá không hợp lệ");
      setAppliedDiscount(null);
    } finally {
      setIsValidating(false);
    }
  };

  const finalPrice = Math.max(
    0,
    totalPrice - (appliedDiscount?.reduction || 0)
  );

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        phone: user.phone || prev.phone || "",
        address: user.address || prev.address || "",
        email: user.email || prev.email || "",
        customerName: user.name || prev.customerName || ""
      }));
    }
  }, [user]);

  // Re-validate discount when price changes
  useEffect(() => {
    const revalidate = async () => {
      if (!appliedDiscount) return;
      
      try {
        const result = await validateDiscount(appliedDiscount.code, totalPrice);
        setAppliedDiscount(result);
      } catch {
        setAppliedDiscount(null);
      }
    };
    
    revalidate();
  }, [totalPrice, appliedDiscount]);

  const selectedVoucherData = useMemo(() => {
    if (!formData.discountCode) return null;
    return availableVouchers.find(v => v.code === formData.discountCode);
  }, [formData.discountCode, availableVouchers]);

  // Reset discount if cart is empty
  useEffect(() => {
    if (totalItems === 0 && formData.discountCode) {
      setFormData(prev => ({ ...prev, discountCode: "" }));
      setAppliedDiscount(null);
    }
  }, [totalItems, formData.discountCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsSubmitting(true);
    try {
      const orderItems = items.map((item) => ({
        productId: item.id,
        quantity: item.quantity
      }));

      const res = await createOrder({
        ...formData,
        items: orderItems
      });

      setOrderSuccess(res);
      clearCart();
    } catch (err) {
      console.error("Order failed", err);
      alert("Đã có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderSuccess) {
    return (
      <Container size="3" className="pt-32 pb-20 px-6">
        <Card className="p-12 rounded-[3.5rem] shadow-2xl border-4 border-primary/20 text-center space-y-8 bg-white">
          <div className="mx-auto w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary animate-bounce-slow">
            <CheckCircle size={56} />
          </div>
          <div className="space-y-4">
            <Heading size="8" className="tracking-tight font-extrabold">
              Đã đặt hàng{" "}
              <span className="text-primary italic">thành công!</span>
            </Heading>
            <Text
              size="4"
              className="block max-w-md mx-auto text-foreground/70"
            >
              Cảm ơn {formData.customerName}! Đơn hàng của bạn đang được Rú
              Garden tiếp nhận. Vui lòng thực hiện chuyển khoản để được xác nhận
              nhanh nhất.
            </Text>
          </div>

          <Separator size="4" className="my-8 opacity-10" />

          <div className="bg-muted/50 p-8 rounded-[2rem] border border-muted-dark space-y-6 text-left max-w-lg mx-auto">
            <Badge color="grass" variant="solid" className="mb-2">
              Thông tin chuyển khoản
            </Badge>
            <Flex direction="column" gap="4">
              <Flex justify="between" align="center">
                <Text size="2" className="text-foreground/60">
                  Ngân hàng:
                </Text>
                <Text weight="bold">{orderSuccess.bankInfo.bankName}</Text>
              </Flex>
              <Flex justify="between" align="center">
                <Text size="2" className="text-foreground/60">
                  Số tài khoản:
                </Text>
                <Flex align="center" gap="2">
                  <Text
                    weight="bold"
                    className="text-primary text-xl font-extrabold"
                  >
                    {orderSuccess.bankInfo.accountNumber}
                  </Text>
                  <Copy
                    size={16}
                    className="text-gray-400 cursor-pointer hover:text-primary"
                  />
                </Flex>
              </Flex>
              <Flex justify="between" align="center">
                <Text size="2" className="text-foreground/60">
                  Chủ tài khoản:
                </Text>
                <Text weight="bold">{orderSuccess.bankInfo.accountHolder}</Text>
              </Flex>
              <Flex justify="between" align="center">
                <Text size="2" className="text-foreground/60">
                  Số tiền:
                </Text>
                <Text
                  weight="bold"
                  color="grass"
                  className="text-2xl font-extrabold"
                >
                  {formatCurrency(finalPrice)}
                </Text>
              </Flex>
              <Flex
                justify="between"
                align="center"
                className="bg-primary/10 p-3 rounded-xl border border-primary/20"
              >
                <Text size="2" className="text-foreground/70 font-bold">
                  Nội dung:
                </Text>
                <Text weight="bold" className="text-primary">
                  {orderSuccess.bankInfo.transferContent}
                </Text>
              </Flex>
            </Flex>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/" className="sm:w-64">
              <Button
                size="4"
                variant="solid"
                color="grass"
                radius="full"
                highContrast
                className="w-full py-8 cursor-pointer shadow-xl"
              >
                Quay về trang chủ
              </Button>
            </Link>
            <Link href="/products" className="sm:w-64">
              <Button
                size="4"
                variant="outline"
                color="gray"
                radius="full"
                className="w-full py-8 font-bold cursor-pointer hover:bg-muted"
              >
                Mua thêm cây khác
              </Button>
            </Link>
          </div>
        </Card>
      </Container>
    );
  }

  if (items.length === 0) {
    return (
      <Container size="4" className="pt-32 pb-20 text-center h-screen px-6">
        <Heading size="7">Bạn chưa có sản phẩm nào để thanh toán.</Heading>
        <Link
          href="/products"
          className="mt-8 block text-primary font-bold hover:underline"
        >
          Quay lại cửa hàng
        </Link>
      </Container>
    );
  }

  return (
    <Container size="4" className="pt-32 pb-20">
      <Heading size="8" className="tracking-tight font-extrabold px-6 mb-12">
        Thanh toán & <span className="text-primary italic">Nhận hàng</span>
      </Heading>

      <Grid columns={{ initial: "1", lg: "2" }} gap="9" className="px-6">
        {/* Form Column */}
        <section className="space-y-12">
          <form
            id="checkout-form"
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            <div className="space-y-6">
              <Flex align="center" gap="3" className="mb-6">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                  <User size={20} />
                </div>
                <Heading size="5">Thông tin của bạn</Heading>
              </Flex>

              <Grid columns={{ initial: "1", sm: "2" }} gap="4">
                <Box className="space-y-2">
                  <Text size="2" className="text-foreground/70 font-bold">
                    Họ và tên *
                  </Text>
                  <TextField.Root
                    placeholder="Nguyễn Văn A"
                    size="3"
                    required
                    value={formData.customerName}
                    onChange={(e) =>
                      setFormData({ ...formData, customerName: e.target.value })
                    }
                  />
                </Box>
                <Box className="space-y-2">
                  <Text size="2" className="text-foreground/70 font-bold">
                    Số điện thoại *
                  </Text>
                  <TextField.Root
                    placeholder="0901234567"
                    size="3"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </Box>
              </Grid>

              <Box className="space-y-2">
                <Text size="2" className="text-foreground/70 font-bold">
                  Email (không bắt buộc)
                </Text>
                <TextField.Root
                  placeholder="you@example.com"
                  size="3"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </Box>
            </div>

            <div className="space-y-6">
              <Flex align="center" gap="3" className="mb-6">
                <div className="w-10 h-10 bg-accent/10 text-accent rounded-full flex items-center justify-center">
                  <MapPin size={20} />
                </div>
                <Heading size="5">Địa chỉ giao hàng</Heading>
              </Flex>

              <Box className="space-y-2">
                <Text size="2" className="text-foreground/70 font-bold">
                  Địa chỉ nhận hàng *
                </Text>
                <TextField.Root
                  placeholder="Số nhà, tên đường, phường/xã..."
                  size="3"
                  required
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                />
              </Box>

              <Box className="space-y-2">
                <Text size="2" className="text-foreground/70 font-bold">
                  Ghi chú đơn hàng (tuỳ chọn)
                </Text>
                <TextField.Root
                  placeholder="VD: Giao giờ hành chính, gọi trước khi đến..."
                  size="3"
                  value={formData.note}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                >
                  <TextField.Slot>
                    <FileText size={18} />
                  </TextField.Slot>
                </TextField.Root>
              </Box>

              <Box className="space-y-2">
                <Text size="2" className="text-foreground/70 font-bold">
                  Mã giảm giá / Voucher (tuỳ chọn)
                </Text>
                <div className="flex gap-2">
                  <TextField.Root
                    placeholder="Nhập mã giảm giá..."
                    size="3"
                    className="flex-1"
                    value={formData.discountCode}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discountCode: e.target.value.toUpperCase()
                      })
                    }
                  />
                  <Button
                    type="button"
                    variant="soft"
                    color="grass"
                    size="3"
                    onClick={() => handleApplyDiscount()}
                    loading={isValidating}
                  >
                    Áp dụng
                  </Button>
                </div>

                <div className="mt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="1"
                    className="text-primary font-bold cursor-pointer italic"
                    onClick={() => setShowVouchers(!showVouchers)}
                  >
                    {showVouchers
                      ? "Ẩn danh sách mã"
                      : "Xem các mã giảm giá hiện có"}
                  </Button>

                  {showVouchers && (
                    <div className="mt-3 space-y-3 bg-muted/30 p-4 rounded-2xl border border-muted animate-in fade-in slide-in-from-top-2 duration-300">
                      {availableVouchers.length === 0 ? (
                        <Text size="1" color="gray">
                          Hiện không có mã nào khả dụng.
                        </Text>
                      ) : (
                        availableVouchers.map((v) => {
                          const isEligible = totalPrice >= (v.minOrderAmount || 0);
                          return (
                            <div
                              key={v.id}
                              className={`p-3 rounded-xl border shadow-sm flex justify-between items-center gap-2 transition-all ${
                                isEligible 
                                  ? "bg-white border-muted" 
                                  : "bg-muted/10 border-muted opacity-80"
                              }`}
                            >
                              <div className="flex-1">
                                <Flex align="center" gap="2">
                                  <Text
                                    size="2"
                                    weight="bold"
                                    color="grass"
                                    className="block uppercase"
                                  >
                                    {v.code}
                                  </Text>
                                  {!isEligible && (
                                    <Badge size="1" color="gray" variant="soft">
                                      Chưa đủ điều kiện
                                    </Badge>
                                  )}
                                </Flex>
                                <Text
                                  size="1"
                                  className="block text-foreground/70"
                                >
                                  {v.type === "PERCENTAGE"
                                    ? `Giảm ${v.value}%`
                                    : `Giảm ${formatCurrency(v.value)}`}
                                </Text>
                                {v.minOrderAmount > 0 && (
                                  <Text
                                    size="1"
                                    className={`block text-[10px] ${!isEligible ? "text-red-500 font-bold" : "text-gray-400"}`}
                                  >
                                    Đơn từ {formatCurrency(v.minOrderAmount)}
                                  </Text>
                                )}
                              </div>
                              <Button
                                size="1"
                                type="button"
                                variant={isEligible ? "soft" : "outline"}
                                color={isEligible ? "grass" : "gray"}
                                className="cursor-pointer"
                                onClick={() => handleApplyDiscount(v.code)}
                                disabled={!isEligible}
                              >
                                {isEligible ? "Dùng" : "Khoá"}
                              </Button>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* Voucher Nudge UI */}
                {(selectedVoucherData || appliedDiscount) && (
                  <div className={`mt-3 p-4 rounded-2xl border flex flex-col gap-2 transition-all animate-in fade-in slide-in-from-top-1 ${
                    appliedDiscount 
                      ? "bg-primary/5 border-primary/20" 
                      : "bg-red-50 border-red-100"
                  }`}>
                    {appliedDiscount ? (
                      <Flex justify="between" align="center">
                        <div>
                          <Text size="1" color="grass" weight="bold" className="flex items-center gap-1">
                            <CheckCircle size={14} /> Mã {appliedDiscount.code} đã áp dụng!
                          </Text>
                          <Text size="1" className="text-foreground/60 block">Bạn được giảm {formatCurrency(appliedDiscount.reduction)}</Text>
                        </div>
                        <Button 
                          variant="ghost" 
                          color="red" 
                          size="1" 
                          onClick={() => {
                            setAppliedDiscount(null);
                            setFormData(prev => ({ ...prev, discountCode: "" }));
                          }}
                        >
                          Gỡ mã
                        </Button>
                      </Flex>
                    ) : selectedVoucherData && (
                      <div className="space-y-1">
                        <Flex justify="between" align="center">
                          <Text size="1" color="red" weight="bold">
                            Chưa đủ điều kiện áp mã {selectedVoucherData.code}
                          </Text>
                          <Text size="1" weight="bold" color="red">
                            + {formatCurrency(selectedVoucherData.minOrderAmount - totalPrice)}
                          </Text>
                        </Flex>
                        <Text size="1" className="text-foreground/70 block">
                          Để dùng mã này, bạn cần mua thêm ít nhất {formatCurrency(selectedVoucherData.minOrderAmount - totalPrice)}.
                        </Text>
                        <Link href="/products">
                          <Button variant="soft" color="grass" size="1" className="mt-2 w-full font-bold">
                            Quay lại mua thêm hàng
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}

              </Box>
            </div>

            <div className="space-y-6">
              <Flex align="center" gap="3" className="mb-6">
                <div className="w-10 h-10 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center">
                  <CreditCard size={20} />
                </div>
                <Heading size="5">Phương thức thanh toán</Heading>
              </Flex>
              <div className="p-6 bg-blue-50/50 border-2 border-blue-500 rounded-[2rem] flex items-center justify-between">
                <Flex align="center" gap="4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center">
                    <span className="text-2xl">🏦</span>
                  </div>
                  <div>
                    <Text weight="bold">Chuyển khoản Ngân hàng</Text>
                    <Text size="1" color="gray" className="block">
                      Nhận thông tin STK sau khi Nhấn Đặt hàng
                    </Text>
                  </div>
                </Flex>
                <CheckCircle className="text-blue-500" />
              </div>
            </div>
          </form>
        </section>

        {/* Summary Column */}
        <aside className="lg:sticky lg:top-32 h-fit">
          <Card className="p-10 rounded-[3rem] shadow-2xl bg-white border border-muted space-y-8 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -z-10" />

            <Heading size="6" className="font-extrabold">
              Đơn hàng của bạn
            </Heading>

            <div className="max-h-[300px] overflow-y-auto space-y-4 pr-2">
              {items.map((item) => (
                <Flex
                  key={item.id}
                  justify="between"
                  align="center"
                  gap="4"
                  className="pb-4 border-b border-muted opacity-90"
                >
                  <Flex gap="3" align="center">
                    <div className="relative w-12 h-16 rounded-xl overflow-hidden shrink-0 border border-muted">
                      <NextImage
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <Text size="2" weight="bold" className="line-clamp-1">
                        {item.name}
                      </Text>
                      <Text size="1" className="text-foreground/60">
                        SL: {item.quantity}
                      </Text>
                    </div>
                  </Flex>
                  <Text size="2" weight="bold">
                    {formatCurrency(
                      (item.salePrice || item.price) * item.quantity
                    )}
                  </Text>
                </Flex>
              ))}
            </div>

            <div className="space-y-4 pt-4">
              <Flex justify="between">
                <Text className="text-foreground/70">Tổng sản phẩm</Text>
                <Text weight="bold">{totalItems}</Text>
              </Flex>
              <Flex justify="between">
                <Text className="text-foreground/70">Phí vận chuyển</Text>
                <Badge color="grass" variant="solid" radius="full">
                  Miễn phí
                </Badge>
              </Flex>
              <Separator size="4" className="my-2 opacity-10" />
              <Flex justify="between" align="baseline">
                <Heading size="6">Tổng thanh toán</Heading>
                <Heading size="7" color="grass" className="font-extrabold">
                  {formatCurrency(finalPrice)}
                </Heading>
              </Flex>
            </div>

            <Button
              type="submit"
              form="checkout-form"
              size="4"
              variant="solid"
              color="grass"
              radius="full"
              highContrast
              className="w-full py-8 mt-4 shadow-xl cursor-pointer hover:shadow-2xl transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? <Spinner /> : "Xác nhận Đặt hàng"}{" "}
              <ArrowRight size={20} />
            </Button>
          </Card>
        </aside>
      </Grid>
    </Container>
  );
}
