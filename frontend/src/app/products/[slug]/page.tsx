import { Metadata } from "next";
import { getProductBySlug } from "@/lib/api";
import ProductDetailClient from "./ProductDetailClient";
import Link from "next/link";
import { Product } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const product = await getProductBySlug(slug);
    return {
      title: `${product.name} | Rú Garden`,
      description: product.description.slice(0, 160),
      openGraph: {
        title: `${product.name} | Rú Garden`,
        description: product.description.slice(0, 160),
        images: product.images,
      },
    };
  } catch {
    return {
      title: "Sản phẩm không tồn tại | Rú Garden",
    };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  
  let product: Product | null = null;
  let hasError = false;

  try {
    product = await getProductBySlug(slug);
  } catch (error) {
    console.error("Error fetching product:", error);
    hasError = true;
  }
    
  if (hasError) {
    return (
      <div className="pt-32 text-center h-screen font-medium">
        Đã có lỗi xảy ra khi tải thông tin cây. Vui lòng thử lại sau.{" "}
        <Link href="/products" className="text-primary hover:underline">
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 text-center h-screen font-medium">
        Không tìm thấy cây bạn yêu cầu.{" "}
        <Link href="/products" className="text-primary hover:underline">
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  return <ProductDetailClient product={product} />;
}
