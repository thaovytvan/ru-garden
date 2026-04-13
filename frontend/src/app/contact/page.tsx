"use client";

import { useState } from "react";
import {
  Container,
  Flex,
  Heading,
  Text,
  Grid,
  Button,
  Card,
  TextField,
  TextArea
} from "@radix-ui/themes";
import { Mail, Phone, MapPin, Send, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-hot-toast";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.message) {
      toast.error("Vui lòng điền đầy đủ các thông tin bắt buộc.");
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api"}/contact`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message);
        setFormData({ name: "", email: "", phone: "", message: "" });
      } else {
        toast.error(data.message || "Có lỗi xảy ra, vui lòng thử lại sau.");
      }
    } catch (err) {
      console.error("Failed to send contact message", err);
      toast.error("Không thể gửi tin nhắn. Vui lòng kiểm tra kết nối mạng.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleZaloClick = () => {
    window.open("https://zalo.me/0901234567", "_blank");
  };

  return (
    <div className="pt-32 pb-20">
      <Container size="4">
        <div className="px-6 mb-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Heading size="9" className="font-extrabold pb-4">
              Liên hệ với <span className="text-primary italic">Rú Garden</span>
            </Heading>
            <Text size="5" color="gray">
              Chúng tôi luôn sẵn lòng lắng nghe và hỗ trợ bạn. Hãy để lại lời
              nhắn hoặc ghé thăm vườn của chúng tôi nhé!
            </Text>
          </motion.div>
        </div>

        <Grid columns={{ initial: "1", md: "2" }} gap="2" className="px-6">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-8 rounded-[2.5rem] shadow-xl border-none">
              <Heading size="6" className="pb-6">
                Gửi tin nhắn cho chúng tôi
              </Heading>
              <Flex direction="column" gap="4">
                <div className="space-y-2">
                  <Text size="2" weight="bold">
                    Họ và tên <span className="text-red-500">*</span>
                  </Text>
                  <TextField.Root
                    placeholder="Nhập tên của bạn..."
                    size="3"
                    radius="large"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Text size="2" weight="bold">
                    Email <span className="text-red-500">*</span>
                  </Text>
                  <TextField.Root
                    placeholder="example@gmail.com"
                    size="3"
                    radius="large"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Text size="2" weight="bold">
                    Số điện thoại
                  </Text>
                  <TextField.Root
                    placeholder="Nhập số điện thoại..."
                    size="3"
                    radius="large"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Text size="2" weight="bold">
                    Lời nhắn <span className="text-red-500">*</span>
                  </Text>
                  <TextArea
                    placeholder="Bạn cần hỗ trợ gì?"
                    size="3"
                    className="min-h-[150px] rounded-2xl"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  />
                </div>
                <Button
                  size="4"
                  color="grass"
                  radius="full"
                  className="mt-4 cursor-pointer"
                  onClick={handleSubmit}
                  loading={isSubmitting}
                >
                  <Send size={18} /> Gửi tin nhắn
                </Button>
              </Flex>
            </Card>
          </motion.div>

          {/* Contact Info & Map */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-8"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Card className="p-1.5 rounded-3xl bg-primary/5 border-none">
                <Flex align="center" gap="4">
                  <div className="size-10 bg-primary rounded-2xl flex items-center justify-center text-white">
                    <Phone size={24} />
                  </div>
                  <div>
                    <Text size="1" color="gray" weight="bold">
                      Hotline
                    </Text>
                    <Text size="2" weight="bold" className="block">
                      0969 847 030
                    </Text>
                  </div>
                </Flex>
              </Card>
              <Card className="p-1.5 rounded-3xl bg-secondary/5 border-none">
                <Flex align="center" gap="4">
                  <div className="size-10 bg-secondary rounded-2xl flex items-center justify-center text-white">
                    <Mail size={24} />
                  </div>
                  <div>
                    <Text size="1" color="gray" weight="bold">
                      Email
                    </Text>
                    <Text size="2" weight="bold" className="block">
                      hello.rugarden@gmail.com
                    </Text>
                  </div>
                </Flex>
              </Card>
            </div>

            <Card className="p-6 rounded-3xl bg-muted/20 border-none">
              <Flex gap="4">
                <div className="w-12 h-12 bg-accent rounded-2xl flex-shrink-0 flex items-center justify-center text-white">
                  <MapPin size={24} />
                </div>
                <div className="flex gap-1.5 items-center">
                  <Text size="1" color="gray" weight="bold">
                    Địa chỉ:
                  </Text>
                  <Text size="3" weight="bold">
                    Bồ Bản, Xã Nam Cửa Việt, Tỉnh Quảng Trị
                  </Text>
                </div>
              </Flex>
            </Card>

            {/* Map Placeholder */}
            <div className="w-full h-[300px] rounded-[2.5rem] overflow-hidden shadow-inner border-4 border-white">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3821.464947938361!2d107.1824!3d16.8903!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTbCsDUzJzI1LjEiTiAxMDfCsDEwJzU2LjYiRQ!5e0!3m2!1svi!2s!4v1712895000000!5m2!1svi!2s"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            <Button
              size="4"
              variant="soft"
              color="indigo"
              radius="full"
              className="w-full cursor-pointer"
              onClick={handleZaloClick}
            >
              <MessageCircle size={18} /> Chat trực tiếp qua Zalo
            </Button>
          </motion.div>
        </Grid>
      </Container>
    </div>
  );
}
