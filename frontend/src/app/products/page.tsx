"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Container,
  Flex,
  Heading,
  Text,
  Grid,
  Badge,
  Button,
  TextField,
  Skeleton
} from "@radix-ui/themes";
import { Search, Filter, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/lib/api";
import { formatCurrency, cn } from "@/lib/utils";
import { getImageUrl } from "@/lib/image-utils";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types";
import {
  PLANT_CATEGORIES,
  SUPPLY_CATEGORIES,
  getCategoryLabel
} from "@/lib/constants";

function ProductListingContent() {
  const searchParams = useSearchParams();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  useEffect(() => {
    setCategory(searchParams.get("category") || "");
    setSearchTerm(searchParams.get("search") || "");
  }, [searchParams]);

  useEffect(() => {
    const fetch = async () => {
      setIsLoading(true);
      try {
        const response = await getProducts({
          category: category || undefined,
          search: searchTerm || undefined,
          sortBy,
          sortOrder
        });
        setProducts(response.data);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [category, searchTerm, sortBy, sortOrder]);

  return (
    <Container size="4" className="pt-32 pb-20">
      <Flex
        direction={{ initial: "column", md: "row" }}
        justify="between"
        align={{ initial: "start", md: "end" }}
        gap="6"
        className="mb-12 px-6"
      >
        <div className="space-y-2">
          <Badge color="grass" variant="soft" radius="full">
            Cửa hàng
          </Badge>
          <Heading size="8" className="font-extrabold tracking-tight">
            Góc <span className="text-primary italic">Rú Garden</span>
          </Heading>
          <Text color="gray">
            Tất cả sản phẩm đều được Rú Garden chăm sóc tỉ mỉ.
          </Text>
        </div>

        <Flex
          gap="4"
          direction={{ initial: "column", sm: "row" }}
          align="center"
          className="w-full md:w-auto"
        >
          <TextField.Root
            placeholder="Tìm tên cây..."
            size="3"
            className="w-full sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          >
            <TextField.Slot>
              <Search size={18} />
            </TextField.Slot>
          </TextField.Root>

          <Flex align="center" gap="2" className="w-full sm:w-auto">
            <Text size="2" color="gray" className="hidden sm:block">Sắp xếp:</Text>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split("-");
                setSortBy(field);
                setSortOrder(order);
              }}
              className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-green-500 outline-none cursor-pointer"
            >
              <option value="createdAt-desc">Mới nhất</option>
              <option value="price-asc">Giá: Thấp đến Cao</option>
              <option value="price-desc">Giá: Cao đến Thấp</option>
              <option value="name-asc">Tên: A-Z</option>
            </select>
          </Flex>
        </Flex>
      </Flex>

      <Flex
        gap="9"
        className="px-6"
        direction={{ initial: "column", lg: "row" }}
      >
        {/* Sidebar Filters */}
        <aside className="w-full lg:w-64 space-y-8 flex-shrink-0">
          <div className="space-y-6">
            <Flex align="center" gap="2" className="text-primary font-bold">
              <Filter size={18} />
              <Text size="3" weight="bold">
                Bộ lọc sản phẩm
              </Text>
            </Flex>

            {/* Plants */}
            <Text
              size="2"
              weight="bold"
              className="text-primary/70 uppercase tracking-wider block border-b pb-2"
            >
              🌿 Cây cảnh
            </Text>
            <div className="flex flex-wrap lg:flex-col gap-2 mt-3">
              {PLANT_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm text-left transition-all",
                    category === cat.value
                      ? "bg-primary text-white shadow-md"
                      : "bg-muted hover:bg-muted-dark text-gray-600"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Supplies */}
            <Text
              size="2"
              weight="bold"
              className="text-amber-600/70 uppercase tracking-wider block border-b pb-2"
            >
              🛠 Vật tư nông nghiệp
            </Text>
            <div className="flex flex-wrap lg:flex-col gap-2 mt-3">
              {SUPPLY_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setCategory(cat.value)}
                  className={cn(
                    "px-4 py-2 rounded-full text-sm text-left transition-all",
                    category === cat.value
                      ? "bg-amber-500 text-white shadow-md"
                      : "bg-muted hover:bg-muted-dark text-gray-600"
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div className="flex-1">
          {isLoading ? (
            <Grid columns={{ initial: "2", md: "3" }} gap="6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[4/5] rounded-3xl" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-3/4" />
                </div>
              ))}
            </Grid>
          ) : products.length > 0 ? (
            <Grid columns={{ initial: "2", md: "3" }} gap="6">
              {products.map((product) => (
                <div key={product.id} className="group flex flex-col">
                  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-muted mb-4 shadow-sm border border-muted-dark group-hover:shadow-xl transition-all duration-500">
                    <Image
                      src={getImageUrl(product.images[0])}
                      alt={product.name}
                      fill
                      className={cn(
                        "object-cover group-hover:scale-110 transition-transform duration-700",
                        product.stock <= 0 && "grayscale opacity-60"
                      )}
                    />
                    {product.stock <= 0 && (
                      <div className="absolute top-4 left-4 z-10">
                        <Badge
                          color="red"
                          variant="solid"
                          radius="full"
                          size="2"
                          className="px-3 py-1 font-bold shadow-lg"
                        >
                          Hết hàng
                        </Badge>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="solid"
                        color="grass"
                        radius="full"
                        highContrast
                        className="cursor-pointer"
                        disabled={product.stock <= 0}
                        onClick={(e) => {
                          e.preventDefault();
                          if (product.stock <= 0) return;
                          addToCart({
                            id: product.id,
                            name: product.name,
                            price: product.price,
                            salePrice: product.salePrice,
                            image: product.images[0],
                            slug: product.slug,
                            quantity: 1
                          });
                        }}
                      >
                        {product.stock <= 0 ? (
                          "Sắp về hàng"
                        ) : (
                          <>
                            <ShoppingCart size={18} /> Thêm vào giỏ
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                  <Flex justify="between" align="center" className="mb-1">
                    <Text
                      size="1"
                      color="gray"
                      className="font-bold flex items-center gap-1"
                    >
                      <Badge size="1" variant="outline">
                        {getCategoryLabel(product.category)}
                      </Badge>
                    </Text>
                    <Flex align="center" gap="1" className="text-yellow-500">
                      <Star size={12} fill="currentColor" />
                      <Text size="1" className="font-bold opacity-80">
                        {product.rating || 4.9}
                      </Text>
                    </Flex>
                  </Flex>
                  <Link href={`/products/${product.slug}`}>
                    <Heading
                      size="4"
                      className="hover:text-primary transition-colors"
                    >
                      {product.name}
                    </Heading>
                  </Link>
                  <Flex gap="2" align="center" className="mt-1">
                    <Text size="4" weight="bold" className="text-primary">
                      {formatCurrency(product.salePrice || product.price)}
                    </Text>
                    {product.salePrice && (
                      <Text
                        size="2"
                        color="gray"
                        className="line-through opacity-50 italic"
                      >
                        {formatCurrency(product.price)}
                      </Text>
                    )}
                  </Flex>
                </div>
              ))}
            </Grid>
          ) : (
            <div className="text-center py-20 bg-muted/30 rounded-3xl">
              <Heading size="5" color="gray">
                Không tìm thấy cây cần tìm...
              </Heading>
              <Text color="gray" className="mt-2 block">
                Hãy thử lọc bằng tiêu chí khác bạn nhé!
              </Text>
              <Button
                variant="outline"
                color="grass"
                className="mt-6"
                onClick={() => {
                  setCategory("");
                  setSearchTerm("");
                }}
              >
                Xóa bộ lọc
              </Button>
            </div>
          )}
        </div>
      </Flex>
    </Container>
  );
}

export default function ProductListingPage() {
  return (
    <Suspense
      fallback={
        <div className="pt-32 text-center h-screen">Đang tải sản phẩm...</div>
      }
    >
      <ProductListingContent />
    </Suspense>
  );
}
