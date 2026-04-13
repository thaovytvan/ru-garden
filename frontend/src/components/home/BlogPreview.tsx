"use client";

import { Container, Grid, Heading, Text, Flex, Card, Button } from "@radix-ui/themes";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Calendar } from "lucide-react";
import { useEffect, useState } from "react";
import { getBlogs } from "@/lib/api";
import { BlogPost } from "@/types";

export const BlogPreview = () => {
  const [blogs, setBlogs] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const { data } = await getBlogs();
        setBlogs(data.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch blogs", err);
      }
    };
    fetchBlogs();
  }, []);

  if (blogs.length === 0) return null;

  return (
    <section className="py-24 bg-white">
      <Container size="4">
        <Flex justify="between" align="end" className="mb-16 px-6">
          <div className="max-w-xl">
            <Heading size="8" className="font-extrabold mb-4">Cẩm nang Rú Garden</Heading>
            <Text color="gray" size="4">Bí quyết chăm sóc và những câu chuyện xanh đầy cảm hứng</Text>
          </div>
          <Link href="/blog">
            <Button variant="ghost" color="grass" size="3" className="hidden md:flex items-center gap-2 font-bold cursor-pointer">
              Xem tất cả bài viết <ArrowRight size={18} />
            </Button>
          </Link>
        </Flex>

        <Grid columns={{ initial: "1", md: "3" }} gap="9" className="px-6">
          {blogs.map((blog, i) => (
            <motion.div
              key={blog.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link href={`/blog/${blog.slug}`}>
                <Card className="p-0 rounded-[2.5rem] overflow-hidden group border-none shadow-sm hover:shadow-xl transition-all h-full bg-[#F9F9F9] cursor-pointer">
                  <div className="relative h-64 w-full">
                    {blog.image && (
                      <Image 
                        src={blog.image} 
                        alt={blog.title} 
                        fill 
                        className="object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                    )}
                  </div>
                  <div className="p-8">
                    <Flex align="center" gap="2" className="mb-4 text-gray-400 text-xs font-bold uppercase tracking-widest" suppressHydrationWarning>
                      <Calendar size={14} /> {new Date(blog.createdAt).toLocaleDateString("vi-VN")}
                    </Flex>
                    <Heading size="5" className="mb-4 line-clamp-2 leading-tight font-bold group-hover:text-primary transition-colors">
                      {blog.title}
                    </Heading>
                    <Text size="2" color="gray" className="line-clamp-2 mb-6 opacity-80">
                      {blog.excerpt}
                    </Text>
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                        <ArrowRight size={20} />
                    </div>
                  </div>
                </Card>
              </Link>
            </motion.div>
          ))}
        </Grid>

        <div className="mt-12 px-6 md:hidden">
          <Link href="/blog">
            <Button variant="ghost" color="grass" size="3" className="w-full flex items-center justify-center gap-2 font-bold cursor-pointer">
              Xem tất cả bài viết <ArrowRight size={18} />
            </Button>
          </Link>
        </div>
      </Container>
    </section>
  );
};
