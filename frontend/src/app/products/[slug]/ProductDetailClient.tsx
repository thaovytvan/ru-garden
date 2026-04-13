"use client";

import { useState, useEffect } from "react";
import {
  Container,
  Flex,
  Heading,
  Text,
  Grid,
  Badge,
  Button,
  Separator,
  IconButton,
  Card
} from "@radix-ui/themes";
import {
  ShoppingCart,
  Star,
  ArrowLeft,
  ShieldCheck,
  Leaf,
  Zap,
  Share2,
  MessageSquare,
  Droplets,
  Sparkles,
  Heart
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { formatCurrency, cn } from "@/lib/utils";
import { getImageUrl } from "@/lib/image-utils";
import { useCart } from "@/context/CartContext";
import {
  getProducts,
  getReviewsByProduct,
  createReview as apiCreateReview
} from "@/lib/api";
import { Product, Review } from "@/types";
import { Skeleton } from "@/components/ui/Skeleton";
import { getCategoryLabel } from "@/lib/constants";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-hot-toast";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface ProductDetailClientProps {
  product: Product;
}

export default function ProductDetailClient({
  product
}: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const [activeImage, setActiveImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [newReview, setNewReview] = useState({ rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoadingRelated(true);
        setLoadingReviews(true);

        const [relatedRes, reviewsRes] = await Promise.all([
          getProducts({ category: product.category.value, limit: 4 }),
          getReviewsByProduct(product.id)
        ]);

        const filtered = relatedRes.data
          .filter((p) => p.id !== product.id)
          .slice(0, 4);
        setRelatedProducts(filtered);
        setReviews(reviewsRes.data);
      } catch (err) {
        console.error("Failed to fetch product data", err);
      } finally {
        setLoadingRelated(false);
        setLoadingReviews(false);
      }
    };
    fetchData();
  }, [product.id, product.category.value]);

  const handleSubmitReview = async () => {
    if (!isAuthenticated || !user) {
      toast.error("Vui lòng đăng nhập để đánh giá sản phẩm!");
      return;
    }

    if (!newReview.comment.trim()) {
      toast.error("Vui lòng nhập nội dung đánh giá!");
      return;
    }

    try {
      setSubmittingReview(true);
      const response = await apiCreateReview({
        ...newReview,
        productId: product.id,
        userId: user.id
      });
      setReviews([response.data, ...reviews]);
      setNewReview({ rating: 5, comment: "" });
      setShowReviewForm(false);
      toast.success("Cảm ơn bạn đã đánh giá sản phẩm!");
    } catch (err) {
      console.error("Failed to submit review", err);
      toast.error("Có lỗi xảy ra, vui lòng thử lại sau.");
    } finally {
      setSubmittingReview(false);
    }
  };

  const averageRating =
    reviews.length > 0
      ? (
          reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
        ).toFixed(1)
      : "4.9";

  return (
    <>
      <Container size="4" className="pt-32 pb-20">
        <Link
          href="/products"
          className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-8 px-6 font-medium"
        >
          <ArrowLeft size={18} /> Quay lại cửa hàng
        </Link>

        <Grid columns={{ initial: "1", md: "2" }} gap="9" className="px-6">
          {/* Left Column: Images */}
          <div className="space-y-4">
            <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden bg-muted shadow-2xl border-4 border-white animate-fade-in group">
              <Image
                src={getImageUrl(product.images[activeImage])}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                priority
              />
            </div>

            <Flex gap="4" className="overflow-x-auto p-2">
              {product.images.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "relative w-20 h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all shadow-sm",
                    activeImage === i
                      ? "border-primary scale-105 shadow-md"
                      : "border-transparent opacity-60 hover:opacity-100"
                  )}
                >
                  <Image
                    src={getImageUrl(img)}
                    alt={`${product.name} view ${i}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </Flex>
          </div>

          {/* Right Column: Info */}
          <div className="space-y-8 flex flex-col justify-center">
            <div className="space-y-4">
              <Badge color="grass" variant="soft" radius="full" size="2">
                {getCategoryLabel(product.category)}
              </Badge>
              <Flex justify="between" align="start">
                <Heading
                  size="9"
                  className="tracking-tight font-extrabold leading-tight"
                >
                  {product.name}
                </Heading>
                <IconButton
                  variant="ghost"
                  color="gray"
                  size="3"
                  className="mt-2 text-gray-500 hover:text-primary transition-colors cursor-pointer"
                >
                  <Share2 size={24} />
                </IconButton>
              </Flex>

              <Flex align="center" gap="4">
                <Flex gap="1" className="text-yellow-500">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={18}
                      fill={
                        i < Math.round(Number(averageRating))
                          ? "currentColor"
                          : "none"
                      }
                    />
                  ))}
                </Flex>
                <Text
                  size="2"
                  color="gray"
                  className="font-bold border-l-2 border-muted pl-4"
                >
                  {reviews.length || 32} Đánh giá
                </Text>
              </Flex>
            </div>

            <Flex gap="4" align="center">
              <Text
                size="8"
                weight="bold"
                className="text-primary tracking-tight"
              >
                {formatCurrency(product.salePrice || product.price)}
              </Text>
              {product.salePrice && (
                <Text
                  size="5"
                  color="gray"
                  className="line-through opacity-40 italic"
                >
                  {formatCurrency(product.price)}
                </Text>
              )}
              {product.salePrice && (
                <Badge color="crimson" variant="solid" radius="full">
                  TIẾT KIỆM{" "}
                  {Math.round((1 - product.salePrice / product.price) * 100)}%
                </Badge>
              )}
            </Flex>

            <Text
              size="4"
              color="gray"
              className="leading-relaxed opacity-90 max-w-lg"
            >
              {product.description}
            </Text>

            <Separator size="4" className="my-2 opacity-10" />

            {/* Stock Status */}
            <div className="space-y-2">
              <Flex align="center" gap="2">
                <div
                  className={cn(
                    "w-3 h-3 rounded-full animate-pulse",
                    product.stock > 0 ? "bg-green-500" : "bg-red-500"
                  )}
                />
                <Text weight="bold" color={product.stock > 0 ? "grass" : "red"}>
                  {product.stock > 0
                    ? "Còn hàng sẵn tại vườn"
                    : "Hết hàng - Sắp về thêm"}
                </Text>
              </Flex>
              {product.stock > 0 && product.stock <= 5 && (
                <Text
                  size="1"
                  color="crimson"
                  weight="bold"
                  className="block animate-bounce"
                >
                  🌿 Chỉ còn {product.stock} cây duy nhất - Mua ngay kẻo lỡ!
                </Text>
              )}
            </div>

            <Flex direction={{ initial: "column", sm: "row" }} gap="4">
              <Button
                size="4"
                variant="solid"
                color="grass"
                radius="full"
                highContrast
                className="flex-1 cursor-pointer shadow-lg hover:shadow-2xl transition-all"
                disabled={product.stock <= 0}
                onClick={() =>
                  addToCart({
                    id: product.id,
                    name: product.name,
                    price: product.price,
                    salePrice: product.salePrice,
                    image: product.images[0],
                    slug: product.slug,
                    quantity: 1
                  })
                }
              >
                <ShoppingCart size={20} />{" "}
                {product.stock > 0 ? "Thêm vào giỏ ngay" : "Tạm hết hàng"}
              </Button>
              <Link
                href={product.stock > 0 ? "/checkout" : "#"}
                className={cn(
                  "flex-1",
                  product.stock <= 0 && "pointer-events-none opacity-50"
                )}
              >
                <Button
                  size="4"
                  variant="outline"
                  color="gray"
                  radius="full"
                  className="w-full font-bold cursor-pointer hover:bg-muted"
                  disabled={product.stock <= 0}
                  onClick={() => {
                    if (product.stock > 0) {
                      addToCart({
                        id: product.id,
                        name: product.name,
                        price: product.price,
                        salePrice: product.salePrice,
                        image: product.images[0],
                        slug: product.slug,
                        quantity: 1
                      });
                    }
                  }}
                >
                  Mua ngay
                </Button>
              </Link>
            </Flex>

            {/* Value Props */}
            <Grid
              columns="2"
              gap="4"
              className="pt-8 bg-muted/20 p-6 rounded-[2rem] border border-muted"
            >
              <Flex gap="3" align="center">
                <ShieldCheck className="text-primary" size={20} />
                <div className="flex flex-col">
                  <Text size="1" weight="bold">
                    Bảo hành 1 đổi 1
                  </Text>
                  <Text size="1" color="gray">
                    Trong vòng 30 ngày
                  </Text>
                </div>
              </Flex>
              <Flex gap="3" align="center">
                <Leaf className="text-secondary" size={20} />
                <div className="flex flex-col">
                  <Text size="1" weight="bold">
                    Cây thuần dưỡng
                  </Text>
                  <Text size="1" color="gray">
                    Kỹ thuật cao, khỏe mạnh
                  </Text>
                </div>
              </Flex>
              <Flex gap="3" align="center">
                <Zap className="text-accent" size={20} />
                <div className="flex flex-col">
                  <Text size="1" weight="bold">
                    Giao 2h nội thành
                  </Text>
                  <Text size="1" color="gray">
                    Hỏa tốc Tỉnh Quảng Trị
                  </Text>
                </div>
              </Flex>
              <Flex gap="3" align="center">
                <Star className="text-primary" size={20} />
                <div className="flex flex-col">
                  <Text size="1" weight="bold">
                    Tặng phân bón
                  </Text>
                  <Text size="1" color="gray">
                    Cho mọi đơn hàng
                  </Text>
                </div>
              </Flex>
            </Grid>
          </div>
        </Grid>

        {/* Plant Characteristics */}
        {(product.careInstructions || product.uses || product.benefits) && (
          <div className="mt-10 px-6">
            <Separator size="4" className="mb-10 opacity-10" />
            <Grid columns={{ initial: "1", md: "3" }} gap="9">
              {product.careInstructions && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="space-y-4"
                >
                  <Flex align="center" gap="3" className="text-primary">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Droplets size={24} />
                    </div>
                    <Heading size="4" weight="bold">
                      Cách chăm sóc
                    </Heading>
                  </Flex>
                  <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {product.careInstructions}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              )}

              {product.uses && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="space-y-4"
                >
                  <Flex align="center" gap="3" className="text-accent">
                    <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
                      <Sparkles size={24} />
                    </div>
                    <Heading size="4" weight="bold">
                      Công dụng
                    </Heading>
                  </Flex>
                  <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {product.uses}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              )}

              {product.benefits && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <Flex align="center" gap="3" className="text-secondary">
                    <div className="w-10 h-10 bg-secondary/10 rounded-full flex items-center justify-center text-primary">
                      <Heart size={24} />
                    </div>
                    <Heading size="4" weight="bold" className="text-primary">
                      Lợi ích
                    </Heading>
                  </Flex>
                  <div className="prose prose-slate max-w-none text-gray-600 leading-relaxed text-sm">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {product.benefits}
                    </ReactMarkdown>
                  </div>
                </motion.div>
              )}
            </Grid>
          </div>
        )}
      </Container>

      <section className="bg-muted/30 py-24">
        <Container size="4">
          <div className="px-6">
            <Flex align="center" gap="3" className="mb-12">
              <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center text-primary">
                <Leaf size={24} />
              </div>
              <Heading size="8" className="tracking-tight font-extrabold">
                Sản phẩm <span className="text-primary italic">tương tự</span>
              </Heading>
            </Flex>

            {loadingRelated ? (
              <Grid columns={{ initial: "2", md: "4" }} gap="6">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="aspect-square rounded-[2rem]" />
                ))}
              </Grid>
            ) : (
              <Grid columns={{ initial: "2", md: "4" }} gap="6">
                {relatedProducts.map((p) => (
                  <motion.div
                    key={p.id}
                    whileHover={{ y: -10 }}
                    className="group"
                  >
                    <Link href={`/products/${p.slug}`}>
                      <Card className="p-0 rounded-[2rem] overflow-hidden border-none shadow-sm hover:shadow-xl transition-all bg-white">
                        <div className="relative aspect-square overflow-hidden">
                          <Image
                            src={getImageUrl(p.images[0])}
                            alt={p.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                        </div>
                        <div className="p-5">
                          <Text
                            size="2"
                            color="gray"
                            className="block mb-1 uppercase tracking-wider font-bold opacity-60"
                          >
                            {getCategoryLabel(p.category)}
                          </Text>
                          <Heading size="4" className="mb-2 line-clamp-1">
                            {p.name}
                          </Heading>
                          <Flex justify="between" align="center">
                            <Text weight="bold" color="grass" size="4">
                              {formatCurrency(p.salePrice || p.price)}
                            </Text>
                            {p.salePrice && (
                              <Text
                                size="1"
                                color="gray"
                                className="line-through opacity-50"
                              >
                                {formatCurrency(p.price)}
                              </Text>
                            )}
                          </Flex>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </Grid>
            )}

            {relatedProducts.length === 0 && !loadingRelated && (
              <Text color="gray" className="italic">
                Chưa có sản phẩm tương tự nào khác.
              </Text>
            )}
          </div>
        </Container>
      </section>

      {/* Reviews Section */}
      <section className="py-24">
        <Container size="4">
          <div className="px-6">
            <Flex align="center" justify="between" className="mb-12">
              <Flex align="center" gap="3">
                <div className="w-10 h-10 bg-accent/20 rounded-full flex items-center justify-center text-accent">
                  <MessageSquare size={24} />
                </div>
                <Heading size="8" className="tracking-tight font-extrabold">
                  Bình luận &{" "}
                  <span className="text-accent italic">Đánh giá</span>
                </Heading>
              </Flex>
              {!showReviewForm && (
                <Button
                  variant="soft"
                  color="grass"
                  radius="full"
                  className="cursor-pointer"
                  onClick={() => setShowReviewForm(true)}
                >
                  Viết đánh giá
                </Button>
              )}
            </Flex>

            {showReviewForm && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="mb-12 bg-muted/20 p-8 rounded-[3rem] overflow-hidden"
              >
                <Heading size="5" className="mb-6">
                  Đánh giá của bạn
                </Heading>
                <div className="space-y-6">
                  <div>
                    <Text size="2" weight="bold" className="block mb-2">
                      Số sao
                    </Text>
                    <Flex gap="2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <IconButton
                          key={star}
                          variant={newReview.rating >= star ? "solid" : "soft"}
                          color="yellow"
                          onClick={() =>
                            setNewReview({ ...newReview, rating: star })
                          }
                          className="cursor-pointer"
                        >
                          <Star
                            size={20}
                            fill={
                              newReview.rating >= star ? "currentColor" : "none"
                            }
                          />
                        </IconButton>
                      ))}
                    </Flex>
                  </div>
                  <div>
                    <Text size="2" weight="bold" className="block mb-2">
                      Lời bình luận
                    </Text>
                    <textarea
                      rows={4}
                      className="w-full p-4 rounded-2xl border-2 border-muted focus:border-primary outline-none transition-all resize-none"
                      placeholder="Hãy chia sẻ trải nghiệm của bạn về sản phẩm này nhé..."
                      value={newReview.comment}
                      onChange={(e) =>
                        setNewReview({ ...newReview, comment: e.target.value })
                      }
                    />
                  </div>
                  <Flex gap="4">
                    <Button
                      size="3"
                      color="grass"
                      radius="full"
                      className="px-8 cursor-pointer"
                      loading={submittingReview}
                      onClick={handleSubmitReview}
                    >
                      Gửi đánh giá
                    </Button>
                    <Button
                      size="3"
                      variant="soft"
                      color="gray"
                      radius="full"
                      className="cursor-pointer"
                      onClick={() => setShowReviewForm(false)}
                    >
                      Hủy
                    </Button>
                  </Flex>
                </div>
              </motion.div>
            )}

            <div className="space-y-6">
              {loadingReviews ? (
                [...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-[2rem]" />
                ))
              ) : reviews.length > 0 ? (
                reviews.map((rev) => (
                  <Card
                    key={rev.id}
                    className="p-8 rounded-[2.5rem] border-none shadow-sm group hover:shadow-md transition-all"
                  >
                    <Flex gap="4" align="start">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold">
                        {rev.user.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <Flex justify="between" align="center" className="mb-2">
                          <Text weight="bold" size="3">
                            {rev.user.name}
                          </Text>
                          <Text size="1" color="gray">
                            {new Date(rev.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </Text>
                        </Flex>
                        <Flex gap="1" className="text-yellow-500 mb-4">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              fill={i < rev.rating ? "currentColor" : "none"}
                            />
                          ))}
                        </Flex>
                        <Text
                          size="3"
                          className="text-gray-600 leading-relaxed italic"
                        >
                          &quot;{rev.comment}&quot;
                        </Text>
                      </div>
                    </Flex>
                  </Card>
                ))
              ) : (
                <div className="bg-muted/20 rounded-[3rem] p-12 text-center border-2 border-dashed border-muted">
                  <Text color="gray" size="4">
                    Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên
                    chia sẻ cảm nhận của bạn!
                  </Text>
                </div>
              )}
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
