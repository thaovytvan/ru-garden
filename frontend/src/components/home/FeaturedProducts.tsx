"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Container,
  Flex,
  Heading,
  Text,
  Grid,
  Button,
  Badge,
  Skeleton
} from "@radix-ui/themes";
import { ArrowRight, ShoppingCart, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getProducts } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import { getImageUrl } from "@/lib/image-utils";
import { useCart } from "@/context/CartContext";
import { Product } from "@/types";

import { getCategoryLabel } from "@/lib/constants";

export const FeaturedProducts = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await getProducts({ featured: true, limit: 4 });
        setProducts(response.data);
      } catch (error) {
        console.error("Failed to fetch featured products:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <section className="py-20 bg-white">
      <Container size="4">
        <Flex justify="between" align="end" className="mb-12 px-6">
          <div className="space-y-4">
            <Badge color="grass" variant="surface" radius="full" size="2">
              Sản phẩm nổi bật
            </Badge>
            <Heading size="8" className="tracking-tight font-extrabold">
              Gợi ý cho{" "}
              <span className="text-primary italic">không gian của bạn</span>
            </Heading>
            <Text color="gray" size="3">
              Những mẫu cây đẹp nhất được Rú Garden tuyển chọn kỹ lưỡng.
            </Text>
          </div>
          <Link
            href="/products"
            className="hidden md:flex items-center gap-2 text-primary font-bold hover:underline"
          >
            Xem tất cả <ArrowRight size={20} />
          </Link>
        </Flex>

        <Grid columns={{ initial: "2", md: "4" }} gap="6" className="px-6">
          {isLoading
            ? [...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-[4/5] rounded-3xl" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-5 w-1/3" />
                </div>
              ))
            : products.map((product, index) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="group cursor-pointer"
                >
                  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-muted mb-4 shadow-sm border border-muted transition-transform duration-500 group-hover:scale-[1.02] group-hover:shadow-xl">
                    <Image
                      src={getImageUrl(product.images[0])}
                      alt={product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 300px"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                      priority={index < 2}
                    />

                    {/* Sale Badge */}
                    {product.salePrice && (
                      <div className="absolute top-4 left-4 bg-accent text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg">
                        GIẢM GIÁ
                      </div>
                    )}

                    {/* Quick Add Overlay */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="solid"
                        color="grass"
                        radius="full"
                        size="3"
                        className="shadow-2xl cursor-pointer"
                        disabled={product.stock <= 0}
                        onClick={(e) => {
                          e.preventDefault();
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
                        <ShoppingCart size={18} /> Thêm đồ
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Flex justify="between" align="center">
                      <Text
                        size="1"
                        color="gray"
                        className="font-bold letter-spacing-wider"
                      >
                        {getCategoryLabel(product.category)}
                      </Text>
                      <Flex align="center" gap="1" className="text-yellow-500">
                        <Star size={12} fill="currentColor" />
                        <Text size="1" className="font-bold">
                          {product.rating || 4.9}
                        </Text>
                      </Flex>
                    </Flex>
                    <Link href={`/products/${product.slug}`}>
                      <Heading
                        size="4"
                        className="group-hover:text-primary transition-colors line-clamp-1"
                      >
                        {product.name}
                      </Heading>
                    </Link>
                    <Flex align="center" gap="2">
                      <Text className="font-extrabold text-primary" size="4">
                        {formatCurrency(product.salePrice || product.price)}
                      </Text>
                      {product.salePrice && (
                        <Text
                          className="line-through opacity-40 italic"
                          size="2"
                          color="gray"
                        >
                          {formatCurrency(product.price)}
                        </Text>
                      )}
                    </Flex>
                  </div>
                </motion.div>
              ))}
        </Grid>

        <div className="mt-12 text-center md:hidden">
          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-primary font-bold"
          >
            Xem tất cả <ArrowRight size={20} />
          </Link>
        </div>
      </Container>
    </section>
  );
};
