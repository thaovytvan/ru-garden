import Link from "next/link";
import {
  Container,
  Flex,
  Heading,
  Text,
  Separator,
  Grid
} from "@radix-ui/themes";
import { Mail, MapPin, Phone } from "lucide-react";
import Image from "next/image";

export const Footer = () => {
  return (
    <footer id="contact" className="pt-20 pb-10 bg-[#E9EDC9]">
      <Container size="4">
        <Grid
          columns={{ initial: "1", sm: "2", md: "4" }}
          gap="9"
          className="px-6 mb-12"
        >
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/images/logo.png" alt="Logo" width={40} height={40} />
              <span className="text-2xl font-bold tracking-tight text-foreground">
                Rú <span className="text-primary italic">Garden</span>
              </span>
            </Link>
            <Text size="3" className="block text-foreground/80 leading-relaxed">
              Tiệm cây cảnh chuyên nghiệp tại Việt Nam. Chúng tôi mang sứ mệnh
              mang thiên nhiên tươi mát đến mọi gốc ngách trong không gian sống
              và hành trình của bạn.
            </Text>
          </div>

          {/* Quick Links */}
          <div>
            <Heading size="4" className="font-bold text-[#1B4332]">
              Khám phá
            </Heading>
            <nav className="flex flex-col gap-4 text-sm font-medium text-gray-500 mt-6">
              <Link href="/" className="hover:text-primary transition-colors">
                Trang chủ
              </Link>
              <Link
                href="/products"
                className="hover:text-primary transition-colors"
              >
                Tất cả sản phẩm
              </Link>
              <Link
                href="/about"
                className="hover:text-primary transition-colors"
              >
                Về chúng tôi
              </Link>
              <Link
                href="/blog"
                className="hover:text-primary transition-colors"
              >
                Góc xanh (Blog)
              </Link>
              <Link
                href="/contact"
                className="hover:text-primary transition-colors"
              >
                Liên hệ
              </Link>
            </nav>
          </div>

          {/* Categories */}
          <div>
            <Heading size="4" className="font-bold text-[#1B4332]">
              Danh mục
            </Heading>
            <nav className="flex flex-col gap-4 text-sm font-medium text-gray-500 mt-6">
              <Link
                href="/products?category=VAN_PHONG"
                className="hover:text-primary transition-colors"
              >
                Cây văn phòng
              </Link>
              <Link
                href="/products?category=TRONG_NHA"
                className="hover:text-primary transition-colors"
              >
                Cây trong nhà
              </Link>
              <Link
                href="/products?category=SEN_DA_XUONG_RONG"
                className="hover:text-primary transition-colors"
              >
                Sen đá & Xương rồng
              </Link>
              <Link
                href="/products?category=NGOAI_TROI"
                className="hover:text-primary transition-colors"
              >
                Cây ngoài trời
              </Link>
              <Link
                href="/products?tags=phong-thuy"
                className="hover:text-primary transition-colors"
              >
                Cây phong thủy
              </Link>
            </nav>
          </div>

          {/* Contact info */}
          <div>
            <Heading size="4" className="font-bold text-[#1B4332]">
              Thông tin liên hệ
            </Heading>
            <div className="flex flex-col gap-5 text-sm mt-6">
              <div className="flex items-start gap-3">
                <MapPin className="text-primary shrink-0" size={20} />
                <Text className="text-foreground/70">
                  Bồ Bản, Xã Nam Cửa Việt, Tỉnh Quảng Trị
                </Text>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="text-primary shrink-0" size={20} />
                <Text className="text-foreground/70">0969 847 030</Text>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="text-primary shrink-0" size={20} />
                <Text className="text-foreground/70">
                  hello.rugarden@gmail.com
                </Text>
              </div>
            </div>
          </div>
        </Grid>

        <Separator size="4" className="my-8 opacity-10" />

        <Flex
          justify="between"
          align="center"
          direction={{ initial: "column", sm: "row" }}
          gap="4"
        >
          <Text size="2" className="text-foreground/60">
            © 2026 Rú Garden. All rights reserved.
          </Text>
          <Flex gap="4" className="text-xs text-gray-500 font-medium">
            <Link href="/terms" className="hover:underline">
              Điều khoản sử dụng
            </Link>
            <Link href="/privacy" className="hover:underline">
              Chính sách bảo mật
            </Link>
          </Flex>
        </Flex>
      </Container>
    </footer>
  );
};
