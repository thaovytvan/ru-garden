"use client";

import { Container, Grid, Heading, Text, Flex, Card } from "@radix-ui/themes";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CATEGORIES = [
  {
    name: "Cây Trong Nhà",
    value: "TRONG_NHA",
    image:
      "https://images.unsplash.com/photo-1545241047-6083a3684587?q=80&w=1974&auto=format&fit=crop",
    count: "25+ mẫu"
  },
  {
    name: "Cây Văn Phòng",
    value: "VAN_PHONG",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop",
    count: "15+ mẫu"
  },
  {
    name: "Sen Đá - Xương Rồng",
    value: "SEN_DA_XUONG_RONG",
    image:
      "https://images.openai.com/static-rsc-4/TPA9kWXCKcoprmAXiPlEEDMDurJtYJnnvbBPKnHC6MPKJy1roCmMeJOIO0HVJujThuvUZyzM8TVUiPDZTwPY3YIh9785SaedO5SO6LZKakPZg7ybe_4bSQI0tJiMeYj4fRDRivE_H-9nJ3kkXZwhwPppcyU0idcziEqYrJ8TVpPUKMNJZMZmVM7mXbViyqA7?purpose=inline",
    count: "40+ mẫu"
  },
  {
    name: "Cây Ngoài Trời",
    value: "NGOAI_TROI",
    image:
      "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=2070&auto=format&fit=crop",
    count: "20+ mẫu"
  }
];

export const FeaturedCategories = () => {
  return (
    <section className="py-24 bg-[#FEFAE0]/30">
      <Container size="4">
        <div className="text-center mb-16 underline-offset-8">
          <Heading size="8" className="font-extrabold mb-4">
            Danh Mục Tuyển Chọn
          </Heading>
          <Text color="gray" size="4">
            Tìm kiếm người bạn xanh phù hợp với không gian của bạn
          </Text>
        </div>

        <Grid
          columns={{ initial: "1", sm: "2", md: "4" }}
          gap="6"
          className="px-6"
        >
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.value}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link href={`/products?category=${cat.value}`}>
                <Card className="p-0 rounded-[2.5rem] overflow-hidden group cursor-pointer border-none shadow-sm hover:shadow-2xl transition-all h-[400px]">
                  <div className="relative h-full w-full">
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-8 left-8 right-8 text-white">
                      <Text
                        size="1"
                        className="font-bold uppercase tracking-[0.2em] text-secondary mb-2 block"
                      >
                        {cat.count}
                      </Text>
                      <Heading
                        size="6"
                        className="font-bold leading-tight group-hover:text-secondary transition-colors"
                      >
                        {cat.name}
                      </Heading>
                      <Flex
                        align="center"
                        gap="2"
                        className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity font-bold text-sm"
                      >
                        Khám phá ngay <ArrowRight size={16} />
                      </Flex>
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </Grid>
      </Container>
    </section>
  );
};
