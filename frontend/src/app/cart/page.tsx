"use client";

import {
  Container,
  Flex,
  Heading,
  Text,
  Grid,
  Button,
  Separator,
  Badge,
  Card
} from "@radix-ui/themes";
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowLeft,
  ArrowRight
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatCurrency, cn } from "@/lib/utils";
import { getImageUrl } from "@/lib/image-utils";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, totalPrice, totalItems } =
    useCart();

  if (items.length === 0) {
    return (
      <Container size="4" className="pt-32 pb-20 text-center">
        <Flex direction="column" align="center" gap="6">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center text-primary/30">
            <ShoppingBag size={48} />
          </div>
          <Heading size="8" className="tracking-tight font-extrabold">
            Giỏ hàng đang{" "}
            <span className="text-primary italic">trong lành quá!</span>
          </Heading>
          <Text color="gray" size="4">
            Chưa có cây xanh nào được chọn. Hãy thêm chút mảng xanh cho nhà bạn
            nhé.
          </Text>
          <Link href="/products">
            <Button
              size="4"
              variant="solid"
              color="grass"
              radius="full"
              highContrast
              className="px-10 cursor-pointer shadow-lg"
            >
              Đến cửa hàng ngay
            </Button>
          </Link>
        </Flex>
      </Container>
    );
  }

  return (
    <Container size="4" className="pt-32 pb-20">
      <Heading size="8" className="tracking-tight font-extrabold px-6 mb-12">
        Giỏ hàng của <span className="text-primary italic">bạn</span> (
        {totalItems})
      </Heading>

      <Grid columns={{ initial: "1", lg: "3" }} gap="9" className="px-6">
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-6">
          {items.map((item) => (
            <Flex
              key={item.id}
              gap="6"
              className="bg-white p-6 rounded-[2rem] border border-muted shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="relative w-24 h-32 flex-shrink-0 rounded-2xl overflow-hidden shadow-sm">
                <Image
                  src={getImageUrl(item.image)}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>

              <Flex direction="column" justify="between" className="flex-1">
                <div>
                  <Flex justify="between" align="start">
                    <Link href={`/products/${item.slug}`}>
                      <Heading
                        size="5"
                        className="hover:text-primary transition-colors"
                      >
                        {item.name}
                      </Heading>
                    </Link>
                    <IconButton
                      variant="ghost"
                      color="crimson"
                      onClick={() => removeFromCart(item.id)}
                    >
                      <Trash2 size={18} />
                    </IconButton>
                  </Flex>
                  <Text size="3" className="font-bold text-primary mt-1">
                    {formatCurrency(item.salePrice || item.price)}
                  </Text>
                </div>

                <Flex justify="between" align="center">
                  <Flex
                    align="center"
                    gap="1"
                    className="bg-muted px-3 py-1 rounded-full border border-muted-dark"
                  >
                    <IconButton
                      variant="ghost"
                      color="gray"
                      onClick={() => updateQuantity(item.id, -1)}
                    >
                      <Minus size={14} />
                    </IconButton>
                    <Text size="3" weight="bold" className="w-8 text-center">
                      {item.quantity}
                    </Text>
                    <IconButton
                      variant="ghost"
                      color="gray"
                      onClick={() => updateQuantity(item.id, 1)}
                    >
                      <Plus size={14} />
                    </IconButton>
                  </Flex>
                  <Text weight="bold" size="4">
                    {formatCurrency(
                      (item.salePrice || item.price) * item.quantity
                    )}
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          ))}

          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-primary font-bold hover:underline"
          >
            <ArrowLeft size={20} /> Tiếp tục mua thêm
          </Link>
        </div>

        {/* Summary Card */}
        <aside className="lg:col-span-1 sticky top-32 h-fit">
          <Card className="p-8 rounded-[2.5rem] shadow-2xl border border-primary/10 bg-muted/20">
            <Heading size="6" className="mb-8 font-extrabold">
              Tạm tính
            </Heading>

            <div className="space-y-4">
              <Flex justify="between">
                <Text className="text-foreground/70">Số lượng sản phẩm</Text>
                <Text weight="bold">{totalItems}</Text>
              </Flex>
              <Flex justify="between">
                <Text className="text-foreground/70">Tạm tính</Text>
                <Text weight="bold">{formatCurrency(totalPrice)}</Text>
              </Flex>
              <Flex justify="between">
                <Text className="text-foreground/70">Phí vận chuyển</Text>
                <Badge color="grass" variant="solid" radius="full">
                  MIỄN PHÍ
                </Badge>
              </Flex>

              <Separator size="4" className="my-4 opacity-10" />

              <Flex justify="between" align="baseline" className="pt-2">
                <Heading size="6">Tổng cộng</Heading>
                <Heading
                  size="7"
                  color="grass"
                  className="font-extrabold tracking-tight"
                >
                  {formatCurrency(totalPrice)}
                </Heading>
              </Flex>

              <div className="pt-8">
                <Link href="/checkout">
                  <Button
                    size="4"
                    variant="solid"
                    color="grass"
                    radius="full"
                    highContrast
                    className="w-full shadow-xl cursor-pointer hover:shadow-2xl py-8"
                  >
                    Tiến hành Thanh toán <ArrowRight size={20} />
                  </Button>
                </Link>
              </div>

              <Text
                size="1"
                className="block text-center mt-6 italic text-foreground/60 leading-relaxed"
              >
                Bằng việc nhấp vào nút này, bạn đồng ý với Các điều khoản và
                chính sách bán hàng của Rú Garden.
              </Text>
            </div>
          </Card>
        </aside>
      </Grid>
    </Container>
  );
}

function IconButton({
  children,
  variant,
  color,
  onClick,
  className
}: {
  children: React.ReactNode;
  variant?: "ghost" | "solid" | "outline" | "soft" | "surface";
  color?:
    | "gray"
    | "accent"
    | "primary"
    | "secondary"
    | "grass"
    | "crimson"
    | "amber"
    | "indigo"
    | "sky";
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Button
      variant={variant}
      color={color as any}
      onClick={onClick}
      className={cn("p-2 h-auto rounded-full cursor-pointer", className)}
    >
      {children}
    </Button>
  );
}
