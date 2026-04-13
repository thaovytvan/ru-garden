"use client";

import { Container, Flex, Heading, Text, Separator, Button, Badge, IconButton } from "@radix-ui/themes";
import { Calendar, User, ArrowLeft, Share2, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, use } from "react";
import { getBlogBySlug } from "@/lib/api";
import { BlogPost } from "@/types";
import { Skeleton } from "@/components/ui/Skeleton";

interface BlogDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = use(params);
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const { data } = await getBlogBySlug(slug);
        setBlog(data);
      } catch (err) {
        console.error("Failed to fetch blog post", err);
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [slug]);

  if (loading) {
    return (
      <div className="pt-32 pb-20">
        <Container size="4">
          <Skeleton className="h-[60vh] w-full rounded-[3rem] mb-12" />
          <Skeleton className="h-12 w-3/4 mb-6" />
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-4 w-1/2" />
        </Container>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="pt-32 pb-20 text-center">
        <Heading>Không tìm thấy bài viết</Heading>
        <Link href="/blog">
          <Button variant="soft" className="mt-4">Quay lại Blog</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-20">
      <Container size="3">
        <div className="px-6">
          <Link
            href="/blog"
            className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors mb-8 font-medium"
          >
            <ArrowLeft size={18} /> Quay lại chuyên mục
          </Link>

          <header className="mb-12">
            <Badge color="grass" variant="soft" size="2" className="mb-4">KIẾN THỨC</Badge>
            <Heading size="9" className="font-extrabold mb-6 leading-tight">
              {blog.title}
            </Heading>
            <Flex gap="6" align="center" className="text-gray-500 font-medium border-y border-muted/50 py-4">
              <Flex align="center" gap="2" suppressHydrationWarning>
                <Calendar size={18} className="text-primary" /> {new Date(blog.createdAt).toLocaleDateString("vi-VN")}
              </Flex>
              <Flex align="center" gap="2">
                <User size={18} className="text-secondary" /> {blog.author}
              </Flex>
              <div className="ml-auto flex items-center gap-4">
                <IconButton variant="ghost" color="gray" size="2" className="cursor-pointer hover:text-primary">
                  <Share2 size={20} />
                </IconButton>
              </div>
            </Flex>
          </header>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative h-[500px] w-full rounded-[3rem] overflow-hidden shadow-2xl mb-12"
          >
            {blog.image && (
              <Image src={blog.image} alt={blog.title} fill className="object-cover" priority />
            )}
          </motion.div>

          <article className="prose prose-lg max-w-none prose-headings:font-extrabold prose-p:text-gray-600 prose-p:leading-relaxed prose-img:rounded-[2rem]">
            <div className="whitespace-pre-line text-lg text-gray-700 leading-relaxed font-medium">
              {blog.content}
            </div>
          </article>

          <Separator size="4" className="my-12 opacity-10" />

          <Flex justify="between" align="center" className="bg-muted/30 p-8 rounded-[2rem]">
            <div>
              <Heading size="4" className="mb-2">Bạn có thắc mắc về bài viết này?</Heading>
              <Text color="gray">Đừng ngần ngại hỏi chuyên gia từ Rú Garden nhé!</Text>
            </div>
            <Link href="/contact">
              <Button size="3" color="grass" radius="full" className="cursor-pointer">
                <MessageCircle size={18} /> Nhận tư vấn ngay
              </Button>
            </Link>
          </Flex>
        </div>
      </Container>
    </div>
  );
}
