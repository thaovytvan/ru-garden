"use client";

import { motion } from "framer-motion";
import { Button, Container, Flex, Heading, Text } from "@radix-ui/themes";
import { ArrowRight, Leaf, Sparkles, MessageCircle } from "lucide-react";
import Link from "next/link";

export const Hero = () => {
  return (
    <section className="relative pt-48 pb-32 overflow-hidden min-h-[90vh] flex items-center">
      {/* Premium Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1772907952251-09e722aafa6a?auto=format&fit=crop&w=2000&q=80')",
            filter: "brightness(0.7)"
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#081C15]/90 to-transparent" />
      </div>

      <Container size="4" className="relative z-10">
        <div className="max-w-3xl px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Flex align="center" gap="2" className="mb-6">
              <span className="w-12 h-[2px] bg-secondary rounded-full" />
              <Text
                color="amber"
                size="2"
                weight="bold"
                className="uppercase tracking-[0.3em]"
              >
                Chào mừng tới Rú Garden
              </Text>
            </Flex>

            <Heading
              size="9"
              className="text-white font-extrabold leading-[1.1] pb-8 hero-title"
              style={{ fontSize: "clamp(4rem, 10vw, 4rem)" }}
            >
              Nơi Thiên Nhiên <br />
              <span className="text-secondary italic">Khởi Đầu</span> Câu Chuyện
            </Heading>

            <Text size="5" className="text-white/80 max-w-xl leading-relaxed">
              Từ những góc nhỏ văn phòng tới mảng xanh trong tổ ấm, Rú Garden
              mang tới những người bạn đồng hành xanh mát, thanh lọc tâm hồn và
              làm đẹp không gian sống của bạn.
            </Text>

            <Flex gap="5" align="center" wrap="wrap" className="py-12">
              <Link href="/products">
                <Button
                  size="4"
                  color="grass"
                  radius="full"
                  highContrast
                  className="px-10 h-16 text-lg cursor-pointer hover:scale-105 transition-all shadow-2xl"
                >
                  Khám phá bộ sưu tập <ArrowRight size={20} />
                </Button>
              </Link>
              <Link href="/contact">
                <Button
                  size="4"
                  variant="ghost"
                  radius="full"
                  className="text-white hover:bg-white/10 h-16 px-8 text-lg cursor-pointer"
                >
                  <MessageCircle size={20} /> Nhận tư vấn
                </Button>
              </Link>
            </Flex>

            {/* Quick Metrics */}
            <Flex
              gap="9"
              className="mt-20 pt-10 border-t border-white/10"
              align="center"
            >
              <div className="space-y-1">
                <div className="text-3xl font-bold text-white flex items-center gap-2">
                  1000+ <Sparkles className="text-accent" size={20} />
                </div>
                <div className="text-white/50 text-xs font-bold uppercase tracking-widest">
                  Khách hàng yêu thích
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-3xl font-bold text-white flex items-center gap-2">
                  500+ <Leaf className="text-primary" size={20} />
                </div>
                <div className="text-white/50 text-xs font-bold uppercase tracking-widest">
                  Loài cây thuần dưỡng
                </div>
              </div>
            </Flex>
          </motion.div>
        </div>
      </Container>

      {/* Atmospheric Particles Overlay (Stable positions) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-white/10 rounded-full blur-sm"
            initial={{
              y: 1000,
              x: (i * 200) % 1000,
              opacity: 0
            }}
            animate={{
              y: -100,
              opacity: [0, 0.5, 0]
            }}
            transition={{
              duration: 15 + i * 2,
              repeat: Infinity,
              delay: i * 2
            }}
          />
        ))}
      </div>
    </section>
  );
};
