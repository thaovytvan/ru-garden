"use client";

import {
  Container,
  Flex,
  Heading,
  Text,
  Grid,
  Card,
  Badge
} from "@radix-ui/themes";
import { Calendar, User, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getBlogs } from "@/lib/api";
import { BlogPost } from "@/types";
import { Skeleton } from "@/components/ui/Skeleton";

export default function BlogPage() {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data } = await getBlogs();
        setBlogs(data);
      } catch (err) {
        console.error("Failed to fetch blogs", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogs();
  }, []);

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
              Cẩm nang <span className="text-secondary italic">Yêu Cây</span>
            </Heading>
            <Text size="5" color="gray" className="block font-medium">
              Kiến thức chăm sóc, xu hướng không gian xanh và những câu chuyện
              từ vườn Rú Garden.
            </Text>
          </motion.div>
        </div>

        <div className="px-6">
          {loading ? (
            <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="9">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[450px] rounded-[2.5rem]" />
              ))}
            </Grid>
          ) : (
            <Grid columns={{ initial: "1", sm: "2", md: "3" }} gap="9">
              {blogs.map((blog, i) => (
                <motion.div
                  key={blog.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Link href={`/blog/${blog.slug}`}>
                    <Card className="p-0 rounded-[2.5rem] overflow-hidden border-none shadow-sm hover:shadow-2xl transition-all h-full bg-white group">
                      <div className="relative h-64 overflow-hidden">
                        {blog.image && (
                          <Image
                            src={blog.image}
                            alt={blog.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                        )}
                        <div className="absolute top-4 left-4">
                          <Badge color="grass" variant="solid" radius="full">
                            Kiến thức
                          </Badge>
                        </div>
                      </div>
                      <div className="p-8">
                        <Flex
                          gap="4"
                          align="center"
                          className="mb-4 text-gray-400 text-xs font-bold uppercase tracking-widest"
                        >
                          <Flex align="center" gap="1" suppressHydrationWarning>
                            <Calendar size={14} />{" "}
                            {new Date(blog.createdAt).toLocaleDateString(
                              "vi-VN"
                            )}
                          </Flex>
                          <Flex align="center" gap="1">
                            <User size={14} /> {blog.author}
                          </Flex>
                        </Flex>
                        <Heading
                          size="6"
                          className="mb-4 line-clamp-2 leading-tight group-hover:text-primary transition-colors"
                        >
                          {blog.title}
                        </Heading>
                        <Text
                          size="3"
                          color="gray"
                          className="line-clamp-3 mb-6 opacity-80 leading-relaxed"
                        >
                          {blog.excerpt}
                        </Text>
                        <Flex
                          align="center"
                          gap="2"
                          className="text-primary font-bold group-hover:gap-4 transition-all"
                        >
                          Xem thêm <ArrowRight size={18} />
                        </Flex>
                      </div>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </Grid>
          )}

          {!loading && blogs.length === 0 && (
            <div className="text-center py-20">
              <Text color="gray" size="4">
                Chưa có bài viết nào được đăng.
              </Text>
            </div>
          )}
        </div>
      </Container>
    </div>
  );
}
