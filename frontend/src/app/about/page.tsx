"use client";

import { Container, Heading, Text, Grid, Card } from "@radix-ui/themes";
import { Leaf, Heart, Users, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="pt-32 pb-20 overflow-hidden">
      <Container size="4">
        {/* Hero Section */}
        <div className="px-6 mb-24 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="rounded-[3rem] overflow-hidden relative h-[500px] shadow-2xl"
          >
            <Image
              src="https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=2070&auto=format&fit=crop"
              alt="About Rú Garden"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-center px-6">
              <div className="max-w-3xl">
                <Heading size="9" className="text-white font-extrabold mb-6">
                  Câu chuyện về{" "}
                  <span className="text-secondary italic">Rú Garden</span>
                </Heading>
                <Text
                  size="5"
                  className="text-white/90 leading-relaxed font-medium"
                >
                  &ldquo;Nơi tình yêu thiên nhiên được nảy mầm và nuôi dưỡng qua
                  từng tán lá.&rdquo;
                </Text>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Story Section */}
        <Grid
          columns={{ initial: "1", md: "2" }}
          gap="9"
          className="px-6 mb-24 items-center"
        >
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Heading size="8" className="font-extrabold pb-8 leading-tight">
              Sứ mệnh mang <span className="text-primary">không gian xanh</span>{" "}
              tới mọi nhà
            </Heading>

            <div className="space-y-10 text-gray-500 border-l-2 border-primary/10 pl-8">
              <div className="space-y-4">
                <Heading
                  size="3"
                  className="text-primary font-bold uppercase tracking-widest italic"
                >
                  01. Khởi đầu từ đam mê
                </Heading>
                <Text as="p" size="4" className="leading-relaxed">
                  Bắt đầu từ một góc nhỏ với niềm đam mê mãnh liệt dành cho
                  những loài cây nhiệt đới, Rú Garden đã lớn dần lên với khao
                  khát kết nối con người với thiên nhiên ngay trong lòng thành
                  phố chật chội.
                </Text>
              </div>

              <div className="space-y-4">
                <Heading
                  size="3"
                  className="text-primary font-bold uppercase tracking-widest italic"
                >
                  02. Cân bằng & Sáng tạo
                </Heading>
                <div className="space-y-4">
                  <Text as="p" size="4" className="leading-relaxed">
                    Rú Garden được xây dựng bởi một lập trình viên yêu cây –
                    người vẫn đang làm việc trong lĩnh vực công nghệ mỗi ngày,
                    song song với việc chăm sóc và phát triển cửa hàng nhỏ của
                    mình. Chính sự cân bằng giữa công việc và đam mê đã tạo nên
                    một Rú Garden rất riêng: vừa tỉ mỉ, logic, vừa nhẹ nhàng và
                    gần gũi.
                  </Text>
                  <Text as="p" size="4" className="leading-relaxed">
                    Từ những giờ làm việc với code, chúng tôi tìm thấy sự thư
                    giãn trong việc chăm sóc từng chiếc lá, từng chậu cây nhỏ.
                    Và từ đó, mong muốn mang lại cho mọi người một không gian
                    xanh – nơi ai cũng có thể cảm nhận được sự bình yên giữa
                    nhịp sống bận rộn.
                  </Text>
                </div>
              </div>

              <div className="space-y-4">
                <Heading
                  size="3"
                  className="text-primary font-bold uppercase tracking-widest italic"
                >
                  03. Giá trị bền vững
                </Heading>
                <div className="space-y-4">
                  <Text as="p" size="4" className="leading-relaxed">
                    Chúng tôi không chỉ bán cây, chúng tôi mang tới những giải
                    pháp không gian sống xanh, giúp giảm bớt căng thẳng, thanh
                    lọc không khí và mang lại nguồn năng lượng tích cực cho gia
                    đình bạn.
                  </Text>
                  <Text
                    as="p"
                    size="4"
                    className="leading-relaxed font-bold text-primary italic"
                  >
                    Rú Garden hy vọng mỗi chậu cây bạn mang về không chỉ là một
                    món decor, mà còn là một phần của sự thư giãn và cân bằng
                    trong cuộc sống hằng ngày 🌿
                  </Text>
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative h-[400px] rounded-[2.5rem] overflow-hidden shadow-xl"
          >
            <Image
              src="https://cdn.shopify.com/s/files/1/0525/1206/3653/files/D52AE7CF-92F1-4FFD-9D75-9330F4AB7FA0_1_201_a_3e0ede50-e150-4bf4-b674-9a316a48ba7a_600x600.jpg?v=1626832056"
              alt="Our Story"
              fill
              className="object-cover"
            />
          </motion.div>
        </Grid>

        {/* Values */}
        <div className="px-6 mb-24">
          <div className="text-center mb-12">
            <Heading size="8" className="font-extrabold mb-4">
              Giá trị cốt lõi
            </Heading>
            <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
          </div>
          <Grid columns={{ initial: "1", sm: "2", md: "4" }} gap="6">
            {[
              {
                icon: Leaf,
                title: "Tận tâm chăm sóc",
                desc: "Mỗi chậu cây đều được dưỡng kỹ ít nhất 2 tuần trước khi xuất vườn."
              },
              {
                icon: Heart,
                title: "Đam mê xanh",
                desc: "Chúng tôi yêu cây và mong muốn lan tỏa tình yêu đó tới bạn."
              },
              {
                icon: Users,
                title: "Đồng hành trọn đời",
                desc: "Hỗ trợ tư vấn chăm sóc cây miễn phí vĩnh viễn cho mọi khách hàng."
              },
              {
                icon: ShieldCheck,
                title: "Chất lượng là vàng",
                desc: "Cam kết cây khỏe, giống tốt và đúng mô tả 100%."
              }
            ].map((value, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card className="p-8 h-full rounded-[2.5rem] border-none shadow-sm hover:shadow-xl transition-all">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
                    <value.icon size={32} />
                  </div>
                  <Heading size="5" className="mb-3">
                    {value.title}
                  </Heading>
                  <Text size="2" color="gray">
                    {value.desc}
                  </Text>
                </Card>
              </motion.div>
            ))}
          </Grid>
        </div>
      </Container>
    </div>
  );
}
