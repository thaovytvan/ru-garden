import { Hero } from "@/components/home/Hero";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { FeaturedCategories } from "@/components/home/FeaturedCategories";
import { BlogPreview } from "@/components/home/BlogPreview";
import Link from "next/link";
import { Button } from "@radix-ui/themes";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main>
      <Hero />
      <FeaturedCategories />
      <FeaturedProducts />
      <BlogPreview />

      {/* Short introduction section */}
      <section id="about" className="py-24 bg-muted/30">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-8 text-foreground leading-tight">
            Tại sao nên chọn{" "}
            <span className="text-primary italic">Rú Garden?</span>
          </h2>
          <p className="text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Chúng tôi tin rằng mỗi cái cây đều có một linh hồn và câu chuyện
            riêng. Tại Rú Garden, mọi sản phẩm đều được chăm sóc tỉ mỉ bởi những
            chuyên gia tâm huyết, đảm bảo mang đến cho bạn không chỉ là một mảng
            xanh, mà là một người bạn đồng hành tràn đầy sức sống.
          </p>
          <div className="mt-10">
            <Link href="/about">
              <Button size="4" variant="soft" color="grass" radius="full" className="px-8 cursor-pointer">
                Đọc thêm về chúng tôi <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-[#081C15] text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            <path d="M0 100 C 20 0 50 0 100 100 Z" fill="currentColor" />
          </svg>
        </div>

        <div className="max-w-4xl mx-auto text-center px-6 relative z-10">
          <h2 className="text-4xl md:text-6xl font-extrabold mb-8 leading-tight">
            Trang trí ngay hôm nay, nhận ưu đãi{" "}
            <span className="text-secondary italic">10%</span>
          </h2>
          <p className="text-xl mb-12 opacity-80 max-w-2xl mx-auto">
            Đăng ký nhận bản tin để cập nhật những mẫu cây mới nhất và kiến thức
            chăm sóc cây cảnh chuyên sâu từ Rú Garden.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-lg mx-auto">
            <input
              type="email"
              placeholder="Email của bạn..."
              className="flex-1 px-8 py-5 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-secondary transition-all"
            />
            <button className="bg-secondary hover:bg-secondary-600 text-[#081C15] font-extrabold py-5 px-10 rounded-full transition-all shadow-2xl hover:scale-105">
              Đăng ký ngay
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
